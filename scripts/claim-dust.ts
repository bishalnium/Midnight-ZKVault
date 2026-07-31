import 'dotenv/config';
import * as sdk from '@midnight-ntwrk/wallet-sdk';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as bip39 from 'bip39';
import { firstValueFrom } from 'rxjs';

const PREPROD = {
  indexerUrl: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWsUrl: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  nodeUrl: 'wss://rpc.preprod.midnight.network',
  proofServerUrl: 'http://localhost:6300',
};

async function main() {
  setNetworkId('preprod');
  const mnemonic = process.env.WALLET_SEED!;
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic.trim());
  const hdResult = sdk.HDWallet.fromSeed(seedBuffer) as any;
  const root = hdResult.hdWallet;

  const sk = root.selectAccount(0).selectRole(sdk.Roles.NightExternal).deriveKeyAt(0);
  const zswapRoleKey = root.selectAccount(0).selectRole(sdk.Roles.Zswap).deriveKeyAt(0);
  const dustRoleKey = root.selectAccount(0).selectRole(sdk.Roles.Dust).deriveKeyAt(0);

  const keystore = sdk.createKeystore(sk.key, sdk.NetworkId.NetworkId.PreProd);
  const pub = sdk.PublicKey.fromKeyStore(keystore);
  const dustParams = ledger.LedgerParameters.initialParameters().dust;

  console.log('🔗 Initializing WalletFacade to Preprod...');
  const wallet = await sdk.WalletFacade.init({
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
    unshielded: (c: any) => sdk.UnshieldedWallet(c).startWithPublicKey(pub),
    shielded: (c: any) => sdk.ShieldedWallet(c).startWithSeed(zswapRoleKey.key),
    dust: (c: any) => sdk.DustWallet(c).startWithSeed(dustRoleKey.key, dustParams),
  });

  const zswapSecretKeys = ledger.ZswapSecretKeys.fromSeed(zswapRoleKey.key);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(dustRoleKey.key);
  await wallet.start(zswapSecretKeys, dustSecretKey);

  console.log('⏳ Waiting 15s for indexer sync...');
  await new Promise((r) => setTimeout(r, 15000));

  const state = await firstValueFrom(wallet.state());
  const nightUtxos = state.unshielded.availableCoins;

  console.log(`• Found ${nightUtxos.length} tNIGHT UTXO(s).`);
  if (nightUtxos.length === 0) {
    console.error('❌ No tNIGHT UTXOs found to claim DUST from!');
    process.exit(1);
  }

  const signingKey = Buffer.from(sk.key).toString('hex');
  const verifyingKey = ledger.signatureVerifyingKey(signingKey);
  const signDustRegistration = (payload: Uint8Array) => ledger.signData(signingKey, payload);

  console.log('🛠️ Creating DUST Claim & UTXO Rotation Transaction via SDK...');
  const recipe = await wallet.registerNightUtxosForDustGeneration(
    nightUtxos,
    verifyingKey,
    signDustRegistration,
    state.dust.address
  );

  console.log('⚡ Proving and Finalizing Transaction with local Proof Server...');
  const finalizedTx = await wallet.finalizeRecipe(recipe);

  console.log('📤 Submitting Dust Claim Transaction to Midnight Preprod...');
  const txId = await wallet.submitTransaction(finalizedTx);

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  ✅  tDUST CLAIM TRANSACTION SUBMITTED SUCCESSFULLY!          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`  Tx ID: ${txId}`);
  console.log('  Your ~186 tDUST will appear in your Dust availableCoins in ~20-30s!');
  console.log('');
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Error claiming DUST:', e);
  process.exit(1);
});

