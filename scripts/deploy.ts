/**
 * REAL On-Chain Deployment Script for Midnight Preprod Testnet
 * 
 * Uses actual Midnight SDK packages to:
 * 1. Build wallet from your Lace seed phrase
 * 2. Sync wallet with Preprod network
 * 3. Use local Docker Proof Server for ZK proof generation
 * 4. Deploy the compiled Compact contract on-chain
 * 5. Return the real contract address and tx hash
 */

import 'dotenv/config';
import * as sdk from '@midnight-ntwrk/wallet-sdk';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { Contract } from '../managed/contract/index.js';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import * as bip39 from 'bip39';
import * as path from 'path';
import * as fs from 'fs';
import { firstValueFrom } from 'rxjs';
import { UnshieldedAddress, DustAddress } from '@midnight-ntwrk/wallet-sdk-address-format';


// ============================================================
// MIDNIGHT PREPROD NETWORK CONFIGURATION
// ============================================================
const PREPROD = {
  indexerUrl: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWsUrl: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  nodeUrl: 'wss://rpc.preprod.midnight.network',
  proofServerUrl: process.env.PROOF_SERVER_URL || 'http://localhost:6300',
};

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  MIDNIGHT ZKVault — REAL ON-CHAIN DEPLOYMENT                ║');
  console.log('║  Network: Midnight TestNet (Preprod)                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  // ── Step 1: Validate seed phrase ──
  const mnemonic = process.env.WALLET_SEED;
  if (!mnemonic) {
    console.error('❌ WALLET_SEED not found in .env');
    process.exit(1);
  }
  console.log('[1/7] ✅ Wallet seed phrase loaded from .env');

  // Convert BIP39 mnemonic to hex seed
  const trimmedMnemonic = mnemonic.trim();
  if (!bip39.validateMnemonic(trimmedMnemonic)) {
    console.error('❌ Invalid BIP39 mnemonic in WALLET_SEED');
    process.exit(1);
  }
  const seedBuffer = bip39.mnemonicToSeedSync(trimmedMnemonic);
  // Midnight SDK expects a 32-byte (64 hex char) seed, take first 32 bytes
  const hexSeed = seedBuffer.subarray(0, 32).toString('hex');
  console.log(`      Seed hex length: ${hexSeed.length} chars (32 bytes)`);

  // ── Step 2: Check proof server is running ──
  console.log(`[2/7] Checking proof server at ${PREPROD.proofServerUrl}...`);
  try {
    const res = await fetch(PREPROD.proofServerUrl);
    console.log(`      ✅ Proof server reachable (status: ${res.status})`);
  } catch (err: any) {
    console.error(`      ❌ Cannot reach proof server: ${err.message}`);
    console.error('      → Run: docker start midnight-proof-server');
    process.exit(1);
  }

  // ── Step 3: Set network ID ──
  console.log('[3/7] Setting network ID to Preprod...');
  setNetworkId('preprod');
  const networkId = 'preprod';
  console.log(`      ✅ Network ID set: preprod`);

  // ── Step 4: Build wallet from seed using WalletFacade (2026 SDK) ──
  console.log('[4/7] Building wallet from seed phrase using WalletFacade (this connects to indexer)...');
  console.log(`      Indexer:   ${PREPROD.indexerUrl}`);
  console.log(`      Indexer WS: ${PREPROD.indexerWsUrl}`);
  console.log(`      Node:      ${PREPROD.nodeUrl}`);
  console.log(`      Prover:    ${PREPROD.proofServerUrl}`);

  const hdResult = sdk.HDWallet.fromSeed(seedBuffer);
  if (hdResult.type !== 'seedOk') {
    console.error('      ❌ Failed to create HDWallet from seed');
    process.exit(1);
  }
  const root = hdResult.hdWallet;
  const sk = root.selectAccount(0).selectRole(sdk.Roles.NightExternal).deriveKeyAt(0);
  const zswapRoleKey = root.selectAccount(0).selectRole(sdk.Roles.Zswap).deriveKeyAt(0);
  const dustRoleKey = root.selectAccount(0).selectRole(sdk.Roles.Dust).deriveKeyAt(0);
  if (sk.type !== 'keyDerived' || zswapRoleKey.type !== 'keyDerived' || dustRoleKey.type !== 'keyDerived') {
    console.error('      ❌ Failed to derive account keys');
    process.exit(1);
  }
  const keystore = sdk.createKeystore(sk.key, sdk.NetworkId.NetworkId.PreProd);
  const pub = sdk.PublicKey.fromKeyStore(keystore);
  const dustParams = ledger.LedgerParameters.initialParameters().dust;

  let wallet: sdk.WalletFacade;
  try {
    wallet = await sdk.WalletFacade.init({
      configuration: {
        networkId: sdk.NetworkId.NetworkId.PreProd,
        indexerClientConnection: {
          indexerHttpUrl: PREPROD.indexerUrl,
          indexerWsUrl: PREPROD.indexerWsUrl,
        },
        nodeClientConnection: {
          nodeURL: new URL(PREPROD.nodeUrl),
          nodeUrl: PREPROD.nodeUrl,
        },
        relayURL: new URL(PREPROD.nodeUrl),
        nodeURL: new URL(PREPROD.nodeUrl),
        provingServerUrl: PREPROD.proofServerUrl,
        costParameters: {
          feeBlocksMargin: 5,
        },
      } as any,
      shielded: (c: any) => sdk.ShieldedWallet(c).startWithSeed(zswapRoleKey.key),
      unshielded: (c: any) => sdk.UnshieldedWallet(c).startWithPublicKey(pub),
      dust: (c: any) => sdk.DustWallet(c).startWithSeed(dustRoleKey.key, dustParams),
    });
    console.log('      ✅ WalletFacade created successfully');
  } catch (err: any) {
    console.error(`      ❌ Failed to initialize WalletFacade: ${err.message}`);
    process.exit(1);
  }

  // ── Step 5: Get wallet state ──
  console.log('[5/7] Starting wallet sync with blockchain...');
  const zswapSecretKeys = ledger.ZswapSecretKeys.fromSeed(zswapRoleKey.key);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(dustRoleKey.key);
  try {
    await wallet.start(zswapSecretKeys, dustSecretKey);
    console.log('      ⏳ Syncing wallet with Preprod blockchain (waiting for full indexer sync)...');
    const walletState = await wallet.waitForSyncedState();
    console.log(`      ✅ Wallet is fully synced with blockchain!`);
    if (walletState) {
      const unshieldedAddrStr = UnshieldedAddress.codec.encode('preprod', walletState.unshielded.address).toString();
      const dustAddrStr = DustAddress.codec.encode('preprod', walletState.dust.address).toString();
      const dustBal = walletState.dust.balance(new Date());
      console.log(`      Unshielded (Bech32m): ${unshieldedAddrStr}`);
      console.log(`      Dust (Bech32m):       ${dustAddrStr}`);
      console.log(`      tNIGHT Balances:      `, (walletState.unshielded as any).state?.balances || 'synced');
      console.log(`      tDUST Balance:        ${dustBal.toString()} tDUST`);
    }
  } catch (err: any) {
    console.log(`      ⚠️  Could not complete initial sync (${err.message}) — continuing anyway...`);
  }

  // ── Step 6: Set up providers ──
  console.log('[6/7] Setting up contract providers...');

  const keysDir = path.resolve(process.cwd(), 'managed', 'keys');
  console.log(`      ZK keys dir: ${keysDir}`);

  // ZK Config provider: reads ZK artifacts from local managed/keys/ directory
  // FetchZkConfigProvider only supports http/https, so we create a local one
  const localZkConfigProvider = {
    async getProverKey(circuitId: string) {
      const filePath = path.resolve(keysDir, `${circuitId}.prover`);
      console.log(`      Loading prover key: ${filePath}`);
      return fs.readFileSync(filePath);
    },
    async getVerifierKey(circuitId: string) {
      const filePath = path.resolve(keysDir, `${circuitId}.verifier`);
      console.log(`      Loading verifier key: ${filePath}`);
      return fs.readFileSync(filePath);
    },
    async getZKIR(circuitId: string) {
      const filePath = path.resolve(keysDir, `${circuitId}.zkir`);
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath);
      }
      // Check in managed/zkir/ as fallback
      const zkirDir = path.resolve(process.cwd(), 'managed', 'zkir');
      const altPath = path.resolve(zkirDir, `${circuitId}.zkir`);
      if (fs.existsSync(altPath)) {
        return fs.readFileSync(altPath);
      }
      throw new Error(`ZKIR not found for circuit: ${circuitId}`);
    },
  };

  const publicDataProvider = indexerPublicDataProvider(
    PREPROD.indexerUrl,
    PREPROD.indexerWsUrl
  );

  const proofProvider = httpClientProofProvider(
    PREPROD.proofServerUrl,
    localZkConfigProvider as any
  );

  const privateStateDir = path.resolve(process.cwd(), '.midnight-state');
  if (!fs.existsSync(privateStateDir)) {
    fs.mkdirSync(privateStateDir, { recursive: true });
  }

  const privateState = levelPrivateStateProvider({
    privateStoragePasswordProvider: () => 'zkvault-dev-password',
    accountId: 'zkvault-deployer',
  });

  // Create adapter: wallet-api → WalletProvider interface
  const walletState = await firstValueFrom(wallet.state());

  const walletProviderAdapter = {
    balanceTx: async (tx: any, ttl?: Date) => {
      console.log('      [balanceTx] Balancing transaction via WalletFacade...');
      const txTtl = ttl || new Date(Date.now() + 3600_000);
      let recipe;
      if (tx?.constructor?.name === 'UnboundTransaction' || typeof tx?.bind === 'function') {
        recipe = await wallet.balanceUnboundTransaction(tx, {
          shieldedSecretKeys: zswapSecretKeys,
          dustSecretKey: dustSecretKey,
        }, { ttl: txTtl });
      } else if (tx?.constructor?.name === 'UnprovenTransaction' || typeof tx?.prove === 'function') {
        recipe = await wallet.balanceUnprovenTransaction(tx, {
          shieldedSecretKeys: zswapSecretKeys,
          dustSecretKey: dustSecretKey,
        }, { ttl: txTtl });
      } else {
        try {
          recipe = await wallet.balanceUnprovenTransaction(tx, {
            shieldedSecretKeys: zswapSecretKeys,
            dustSecretKey: dustSecretKey,
          }, { ttl: txTtl });
        } catch (e) {
          recipe = await wallet.balanceFinalizedTransaction(tx, {
            shieldedSecretKeys: zswapSecretKeys,
            dustSecretKey: dustSecretKey,
          }, { ttl: txTtl });
        }
      }
      console.log('      [balanceTx] Recipe created:', recipe.type);
      const finalized = await wallet.finalizeRecipe(recipe);
      console.log('      [balanceTx] Transaction balanced and finalized successfully!');
      return finalized;
    },
    getCoinPublicKey: () => walletState.shielded.state.publicKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletState.shielded.state.publicKeys.encryptionPublicKey,
  };

  const midnightProviderAdapter = {
    submitTx: async (tx: any) => {
      return wallet.submitTransaction(tx);
    },
  };

  const providers = {
    privateStateProvider: privateState,
    publicDataProvider,
    zkConfigProvider: localZkConfigProvider as any,
    proofProvider,
    walletProvider: walletProviderAdapter as any,
    midnightProvider: midnightProviderAdapter as any,
  };

  console.log('      ✅ All providers configured');

  // ── Step 7: Deploy contract ──
  console.log('[7/7] Deploying ZKVault contract to Midnight TestNet...');
  console.log('      ⏳ This may take 1-3 minutes for ZK proof generation...');
  console.log('');

  try {
    const myContract = CompiledContract.make('zkvault', Contract).pipe(
      CompiledContract.withVacantWitnesses,
      CompiledContract.withCompiledFileAssets(keysDir)
    );

    const result = await deployContract(providers, {
      compiledContract: myContract,
      privateStateId: 'zkvault',
      initialPrivateState: {},
    });

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║  ✅  CONTRACT DEPLOYED ON-CHAIN SUCCESSFULLY!               ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  Network:          Midnight TestNet (Preprod)`);
    console.log(`  Contract Address: ${result.deployTxData?.public?.contractAddress || 'pending'}`);
    console.log(`  Tx Hash:          ${result.deployTxData?.public?.txHash || (result.deployTxData?.public as any)?.txId || 'pending'}`);
    console.log(`  Proof Server:     ${PREPROD.proofServerUrl}`);
    console.log('');

    // Save deployment result
    const stateFile = path.resolve(process.cwd(), '.midnight-deploy.json');
    fs.writeFileSync(stateFile, JSON.stringify({
      network: 'testnet-preprod',
      contractAddress: result.deployTxData?.public?.contractAddress,
      txHash: result.deployTxData?.public?.txHash || (result.deployTxData?.public as any)?.txId,
      deployedAt: new Date().toISOString(),
    }, null, 2));
    console.log(`  📄 Deploy state saved to: ${stateFile}`);

  } catch (err: any) {
    console.error('');
    console.error('╔══════════════════════════════════════════════════════════════╗');
    console.error('║  ❌  DEPLOYMENT FAILED                                      ║');
    console.error('╚══════════════════════════════════════════════════════════════╝');
    console.error('');
    console.error(`  Error: ${err.message}`);
    console.error('');

    if (err.message?.includes('transport') || err.message?.includes('version')) {
      console.error('  💡 Likely cause: Proof server version mismatch');
      console.error('  💡 Fix: docker pull midnightntwrk/proof-server:latest');
    } else if (err.message?.includes('balance') || err.message?.includes('insufficient') || err.message?.includes('DUST')) {
      console.error('  💡 Likely cause: Not enough tDUST for transaction fees');
      console.error('  💡 Fix: Request tNIGHT from faucet & delegate for tDUST');
    } else if (err.message?.includes('connect') || err.message?.includes('ECONNREFUSED')) {
      console.error('  💡 Likely cause: Cannot connect to network services');
      console.error('  💡 Fix: Check internet connection and service URLs');
    } else if (err.stack) {
      console.error('  Stack:', err.stack.split('\n').slice(0, 5).join('\n'));
    }

    process.exit(1);
  }
}

main();
