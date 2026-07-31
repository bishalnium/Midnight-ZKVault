import 'dotenv/config';
import * as sdk from '@midnight-ntwrk/wallet-sdk';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as bip39 from 'bip39';

const PREPROD = {
  indexerUrl: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWsUrl: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  nodeUrl: 'https://rpc.preprod.midnight.network',
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

  console.log('⏳ Waiting 15s for indexer sync...');
  await new Promise((r) => setTimeout(r, 15000));

  let sub: any;
  await new Promise<void>((resolve) => {
    sub = wallet.state().subscribe((state) => {
      console.log('─── Dust Generation Estimation ───');
      const nightUtxos = state.unshielded.availableCoins.map(({ utxo, meta }: any) => ({
        ...utxo,
        ctime: meta.ctime,
        registeredForDustGeneration: meta.registeredForDustGeneration,
      }));
      console.log('Night UTXOs count:', nightUtxos.length);
      try {
        const est = state.dust.estimateDustGeneration(nightUtxos, new Date());
        console.log('Estimated Dust Generation count:', est.length);
        for (const item of est) {
          console.log('  Item:', JSON.stringify(item, (key, value) => typeof value === 'bigint' ? value.toString() + 'n' : value, 2));
        }
      } catch (e: any) {
        console.error('Estimate error:', e.message);
      }
      resolve();
    });
  });
  if (sub) sub.unsubscribe();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
