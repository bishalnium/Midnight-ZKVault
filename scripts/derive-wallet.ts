import 'dotenv/config';

async function inspectWalletFromSeed() {
  const seed = process.env.WALLET_SEED;
  console.log('====================================================');
  console.log('       INSPECTING WALLET FROM 24-WORD SEED         ');
  console.log('====================================================');

  if (!seed) {
    console.log('No WALLET_SEED found in .env');
    return;
  }

  const words = seed.trim().split(/\s+/);
  console.log(`[+] Total Seed Words: ${words.length} words`);
  console.log(`[+] Word Preview: ${words.slice(0, 3).join(' ')} ... ${words.slice(-2).join(' ')}`);

  console.log('\n[+] Wallet Balance Status (From Your Wallet Screenshot):');
  console.log('    • Unshielded NIGHT Balance: +1000 tNIGHT (Received 2026/07/27 20:42)');
  console.log('    • Sponsored DUST Balance: 1.0 DUST (Network: Midnight Preprod)');
  console.log('    • Account Address: mn_addr_preprod18tzjvyhqv2ddm03c0cyqxay80c4l68rlrvzlzmwwwj8mjapym5hs0u2uf0');

  console.log('\n[+] What an Agent/Attacker CAN do with 24 Seed Words:');
  console.log('    1. Derive all private keys & public addresses deterministically.');
  console.log('    2. Sign and broadcast transactions (transfer NIGHT/ADA tokens).');
  console.log('    3. Sign zero-knowledge proofs and smart contract deployments.');

  console.log('\n[+] What an Agent/Attacker CANNOT do:');
  console.log('    • Cannot access your computer password or personal files.');
  console.log('    • Cannot change your seed phrase.');
  console.log('====================================================');
}

inspectWalletFromSeed();
