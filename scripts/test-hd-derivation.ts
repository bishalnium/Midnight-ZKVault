import 'dotenv/config';
import * as sdk from '@midnight-ntwrk/wallet-sdk';
import { UnshieldedAddress, DustAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import * as bip39 from 'bip39';

const mnemonic = process.env.WALLET_SEED!;

function checkDerivation(name: string, seed: Uint8Array) {
  const hdResult = sdk.HDWallet.fromSeed(seed);
  if (hdResult.type !== 'seedOk') return;
  const root = hdResult.hdWallet;
  
  const sk = root.selectAccount(0).selectRole(sdk.Roles.NightExternal).deriveKeyAt(0);
  if (sk.type !== 'keyDerived') return;

  const keystore = sdk.createKeystore(sk.key, sdk.NetworkId.NetworkId.PreProd);
  const addrStr = keystore.getBech32Address().asString();

  console.log(`${name}: ${addrStr}`);
  if (addrStr === 'mn_addr_preprod1gyrrs8h74m3c34jxhy86nev4a3gzqxzapwvw097saw82fklgmsyqkh2tnv') {
    console.log('    🎯 MATCH FOUND WITH LACE WALLET!!');
  }
}

console.log('Testing HD derivation methods against Lace address...');
console.log('Target: mn_addr_preprod1gyrrs8h74m3c34jxhy86nev4a3gzqxzapwvw097saw82fklgmsyqkh2tnv');

const fullSeed = bip39.mnemonicToSeedSync(mnemonic.trim());
checkDerivation('1. mnemonicToSeedSync (64 bytes)', fullSeed);
checkDerivation('2. mnemonicToSeedSync.subarray(0, 32)', fullSeed.subarray(0, 32));

const entropyHex = bip39.mnemonicToEntropy(mnemonic.trim());
const entropyBytes = Buffer.from(entropyHex, 'hex');
checkDerivation('3. mnemonicToEntropy (raw 32 bytes)', entropyBytes);

for (let acc = 0; acc < 5; acc++) {
  const hd = sdk.HDWallet.fromSeed(fullSeed);
  if (hd.type === 'seedOk') {
    const sk = hd.hdWallet.selectAccount(acc).selectRole(sdk.Roles.NightExternal).deriveKeyAt(0);
    if (sk.type === 'keyDerived') {
      const ks = sdk.createKeystore(sk.key, sdk.NetworkId.NetworkId.PreProd);
      const str = ks.getBech32Address().asString();
      console.log(`4. fullSeed Acc=${acc}: ${str}`);
      if (str === 'mn_addr_preprod1gyrrs8h74m3c34jxhy86nev4a3gzqxzapwvw097saw82fklgmsyqkh2tnv') {
        console.log(`    🎯 MATCH FOUND Acc=${acc}!!`);
      }
    }
  }
}

for (let acc = 0; acc < 5; acc++) {
  const hd = sdk.HDWallet.fromSeed(entropyBytes);
  if (hd.type === 'seedOk') {
    const sk = hd.hdWallet.selectAccount(acc).selectRole(sdk.Roles.NightExternal).deriveKeyAt(0);
    if (sk.type === 'keyDerived') {
      const ks = sdk.createKeystore(sk.key, sdk.NetworkId.NetworkId.PreProd);
      const str = ks.getBech32Address().asString();
      console.log(`5. entropy Acc=${acc}: ${str}`);
      if (str === 'mn_addr_preprod1gyrrs8h74m3c34jxhy86nev4a3gzqxzapwvw097saw82fklgmsyqkh2tnv') {
        console.log(`    🎯 MATCH FOUND Acc=${acc}!!`);
      }
    }
  }
}
