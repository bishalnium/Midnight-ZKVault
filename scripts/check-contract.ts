async function checkContractOnChain(address: string) {
  console.log(`Checking address on Midnight Preprod Indexer: ${address}...`);
  const endpoint = 'https://indexer.preprod.midnight.network/api/v4/graphql';
  
  const query = `
    query GetContract($address: String!) {
      contract(address: $address) {
        address
        state
      }
    }
  `;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { address } }),
    });

    const data = await res.json();
    console.log('Indexer Response:', JSON.stringify(data, null, 2));
    if (data.data && data.data.contract) {
      console.log('✅ CONTRACT IS DEPLOYED ON-CHAIN!');
    } else {
      console.log('⚠️ CONTRACT NOT FOUND ON-CHAIN INDEXER YET (Requires Live Wallet Seed Deployment)');
    }
  } catch (err: any) {
    console.error('Indexer query failed:', err.message);
  }
}

const targetAddress = process.argv[2] || '0x498a9d1872b4c10e6a9f37c2d1045b82e91241a0';
checkContractOnChain(targetAddress);
