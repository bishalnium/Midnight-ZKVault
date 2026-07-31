import 'dotenv/config';
import * as sdk from '@midnight-ntwrk/wallet-sdk';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { DustAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import * as bip39 from 'bip39';

const mnemonic = process.env.WALLET_SEED!;
const seedBuffer = bip39.mnemonicToSeedSync(mnemonic.trim());

const targetDust = 'mn_dust_preprod1wv6gc229f9u77zuf93ymk8cfhmryx9flemvlnwzz743ty2z3x0gjwelde88';
console.log('Target Dust Address:', targetDust);

// Test 1: DustSecretKey.fromSeed(seedBuffer.subarray(0, 32))
try {
  const sk = ledger.DustSecretKey.fromSeed(seedBuffer.subarray(0, 32));
  const pub = sk.publicKey;
  const addr = new DustAddress(pub);
  const str = DustAddress.codec.encode('preprod', addr).toString();
  console.log('1. seed.subarray(0, 32):  ', str);
  if (str === targetDust) console.log('   🎯 MATCH 1!!');
} catch (e: any) { console.log('1. err:', e.message); }

// Test 2: DustSecretKey.fromSeed(seedBuffer.subarray(32, 64))
try {
  const sk = ledger.DustSecretKey.fromSeed(seedBuffer.subarray(32, 64));
  const pub = sk.publicKey;
  const addr = new DustAddress(pub);
  const str = DustAddress.codec.encode('preprod', addr).toString();
  console.log('2. seed.subarray(32, 64): ', str);
  if (str === targetDust) console.log('   🎯 MATCH 2!!');
} catch (e: any) { console.log('2. err:', e.message); }

// Test 3: HDWallet role 2 (Dust)
try {
  const hd = sdk.HDWallet.fromSeed(seedBuffer);
  if (hd.type === 'seedOk') {
    const roleKey = hd.hdWallet.selectAccount(0).selectRole(sdk.Roles.Dust).deriveKeyAt(0);
    if (roleKey.type === 'keyDerived') {
      const sk = ledger.DustSecretKey.fromSeed(roleKey.key);
      const pub = sk.publicKey;
      const addr = new DustAddress(pub);
      const str = DustAddress.codec.encode('preprod', addr).toString();
      console.log('3. HDWallet Role 2 (Dust):', str);
      if (str === targetDust) console.log('   🎯 MATCH 3!!');
    }
  }
} catch (e: any) { console.log('3. err:', e.message); }

// Test 4: HDWallet role 0 (NightExternal) - same key as unshielded?
try {
  const hd = sdk.HDWallet.fromSeed(seedBuffer);
  if (hd.type === 'seedOk') {
    const roleKey = hd.hdWallet.selectAccount(0).selectRole(sdk.Roles.NightExternal).deriveKeyAt(0);
    if (roleKey.type === 'keyDerived') {
      const sk = ledger.DustSecretKey.fromSeed(roleKey.key);
      const pub = sk.publicKey;
      const addr = new DustAddress(pub);
      const str = DustAddress.codec.encode('preprod', addr).toString();
      console.log('4. HDWallet Role 0 (Night):', str);
      if (str === targetDust) console.log('   🎯 MATCH 4!!');
    }
  }
} catch (e: any) { console.log('4. err:', e.message); }

// Test 5: Entropy (32 bytes)
try {
  const entropyHex = bip39.mnemonicToEntropy(mnemonic.trim());
  const entropyBytes = Buffer.from(entropyHex, 'hex');
  const sk = ledger.DustSecretKey.fromSeed(entropyBytes);
  const pub = sk.publicKey;
  const addr = new DustAddress(pub);
  const str = DustAddress.codec.encode('preprod', addr).toString();
  console.log('5. Entropy (32 bytes):     ', str);
  if (str === targetDust) console.log('   🎯 MATCH 5!!');
} catch (e: any) { console.log('5. err:', e.message); }
