import 'dotenv/config';
import * as sdk from '@midnight-ntwrk/wallet-sdk';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { DustAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
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

  console.log('⏳ Waiting for full wallet sync from Midnight Preprod indexer...');
  const state = await wallet.waitForSyncedState();
  console.log('✅ Wallet is fully synced!');

  console.log('─── DUST WALLET STATE DETAILS ───');
  console.log('Dust Address:', DustAddress.codec.encode('preprod', state.dust.address).toString());
  console.log('Dust Balance:', state.dust.balance(new Date()).toString());
  console.log('Dust availableCoins:', state.dust.availableCoins);
  console.log('Dust Object Keys:', Object.keys(state.dust));
  console.log('Dust Full Details:', JSON.stringify(state.dust, (k, v) => typeof v === 'bigint' ? v.toString() + 'n' : v, 2));

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
