import 'dotenv/config';
import * as sdk from '@midnight-ntwrk/wallet-sdk';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { UnshieldedAddress, DustAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import * as bip39 from 'bip39';
import { firstValueFrom } from 'rxjs';

const PREPROD = {
  indexerUrl: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWsUrl: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  nodeUrl: 'https://rpc.preprod.midnight.network',
  proofServerUrl: process.env.PROOF_SERVER_URL || 'http://localhost:6300',
};

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  MIDNIGHT PREPROD WALLET BALANCE & ADDRESS CHECKER           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  const mnemonic = process.env.WALLET_SEED;
  if (!mnemonic || !bip39.validateMnemonic(mnemonic.trim())) {
    console.error('❌ Valid WALLET_SEED not found in .env');
    process.exit(1);
  }

  setNetworkId('preprod');

  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic.trim());
  const hdResult = sdk.HDWallet.fromSeed(seedBuffer);
  if (hdResult.type !== 'seedOk') {
    console.error('❌ Failed to create HDWallet');
    process.exit(1);
  }

  const root = hdResult.hdWallet;
  const sk = root.selectAccount(0).selectRole(sdk.Roles.NightExternal).deriveKeyAt(0);
  const zswapRoleKey = root.selectAccount(0).selectRole(sdk.Roles.Zswap).deriveKeyAt(0);
  const dustRoleKey = root.selectAccount(0).selectRole(sdk.Roles.Dust).deriveKeyAt(0);
  if (sk.type !== 'keyDerived' || zswapRoleKey.type !== 'keyDerived' || dustRoleKey.type !== 'keyDerived') {
    console.error('❌ Failed to derive account keys');
    process.exit(1);
  }

  const keystore = sdk.createKeystore(sk.key, sdk.NetworkId.NetworkId.PreProd);
  const pub = sdk.PublicKey.fromKeyStore(keystore);
  const dustParams = ledger.LedgerParameters.initialParameters().dust;

  console.log('🔗 Connecting to Midnight Preprod Indexer...');
  const wallet = await sdk.WalletFacade.init({
    configuration: {
      networkId: sdk.NetworkId.NetworkId.PreProd,
      indexerClientConnection: {
        indexerHttpUrl: PREPROD.indexerUrl,
        indexerWsUrl: PREPROD.indexerWsUrl,
      },
      nodeClientConnection: {
        nodeUrl: PREPROD.nodeUrl,
      },
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
  console.log('⏳ Syncing balance from Preprod blockchain (waiting 15s)...');
  await new Promise((r) => setTimeout(r, 15000));

  const state = await firstValueFrom(wallet.state());

  const unshieldedAddrStr = UnshieldedAddress.codec.encode('preprod', state.unshielded.address).toString();
  const dustAddrStr = DustAddress.codec.encode('preprod', state.dust.address).toString();
  const dustBal = state.dust.balance(new Date());

  console.log('');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('                       WALLET DETAILS                          ');
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`• Network:            Midnight Preprod Testnet`);
  console.log(`• Unshielded Address: ${unshieldedAddrStr}`);
  console.log(`• Dust Address:       ${dustAddrStr}`);
  console.log('────────────────────────────────────────────────────────────────');
  console.log(`• Unshielded Balances:`, state.unshielded.balances);
  console.log(`• tDUST Balance:       ${dustBal.toString()} tDUST`);
  console.log(`• Dust availableCoins:`, state.dust.availableCoins);
  console.log(`• Unshielded availableCoins:`, state.unshielded.availableCoins);
  console.log('════════════════════════════════════════════════════════════════');
  console.log('');

  if (dustBal === 0n) {
    console.log('⚠️  YOUR WALLET HAS 0 tDUST!');
    console.log('   To deploy smart contracts on Midnight Preprod, you need tDUST to pay fees.');
    console.log('   1. Copy your Unshielded Address above.');
    console.log('   2. Visit the Midnight Preprod Faucet to request tNIGHT.');
    console.log('   3. In Lace wallet, delegate your tNIGHT to generate tDUST.');
  } else {
    console.log('✅ You have sufficient tDUST to deploy smart contracts!');
  }

  process.exit(0);
}

main().catch((e) => {
  console.error('Fatal Error:', e);
  process.exit(1);
});
