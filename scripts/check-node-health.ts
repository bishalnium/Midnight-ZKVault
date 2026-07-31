import { ApiPromise, WsProvider } from '@polkadot/api';

async function main() {
  console.log('🔗 Connecting to wss://rpc.preprod.midnight.network ...');
  const provider = new WsProvider('wss://rpc.preprod.midnight.network');
  const api = await ApiPromise.create({ provider, throwOnConnect: false });

  console.log('📡 Connected! Fetching chain info...');
  const [chain, nodeName, nodeVersion, runtimeVersion, header] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
    api.rpc.state.getRuntimeVersion(),
    api.rpc.chain.getHeader(),
  ]);

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  MIDNIGHT PREPROD NODE HEALTH & STATUS                       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`  Chain Name:       ${chain}`);
  console.log(`  Node Name:        ${nodeName} (${nodeVersion})`);
  console.log(`  Runtime Spec:     ${runtimeVersion.specName} v${runtimeVersion.specVersion}`);
  console.log(`  Latest Block:     #${header.number.toNumber()}`);
  console.log(`  Block ParentHash: ${header.parentHash.toHex()}`);
  console.log('');
  
  await api.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Failed to connect or query node:', err);
  process.exit(1);
});
