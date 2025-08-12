const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { Metaplex, keypairIdentity, bundlrStorage } = require('@metaplex-foundation/js');

async function debugV19() {
    try {
        console.log('🔍 Debugging Metaplex v0.19.4 Candy Machine creation...');
        
        // Initialize Solana connection
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        console.log('🔗 Connected to Solana devnet');
        
        // Load existing keypair
        const fs = require('fs-extra');
        const keypairPath = './keypair.json';
        const keypairData = await fs.readJson(keypairPath);
        const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
        
        // Check wallet balance
        const balance = await connection.getBalance(keypair.publicKey);
        console.log(`💰 Wallet balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        
        // Initialize Metaplex with bundlr storage
        const metaplex = Metaplex.make(connection)
            .use(keypairIdentity(keypair))
            .use(bundlrStorage({
                address: 'https://devnet.bundlr.network',
                providerUrl: 'https://api.devnet.solana.com',
                timeout: 60000,
            }));
        
        console.log('🍬 Metaplex initialized with bundlr storage');
        
        // Test the create method step by step
        console.log('\n🔍 Testing Candy Machine creation...');
        
        try {
            // First, let's see what the create method returns
            console.log('📝 Calling create method...');
            
            const result = await metaplex.candyMachines().create({
                itemsAvailable: 432,
                sellerFeeBasisPoints: 700,
                symbol: "MBRICK",
                maxEditionSupply: 0,
                isMutable: true,
                creators: [{
                    address: new PublicKey('85ArqfA2fy8spGcMGsSW7cbEJAWj26fe8mmoG2bwkgT9'),
                    share: 100,
                    verified: false
                }]
            });
            
            console.log('✅ Create method completed');
            console.log('Result type:', typeof result);
            console.log('Result:', result);
            
            if (result) {
                console.log('Result keys:', Object.keys(result));
                
                if (result.candyMachine) {
                    console.log('🎉 Candy Machine found in result.candyMachine!');
                    console.log('Address:', result.candyMachine.address);
                } else if (result.response) {
                    console.log('🎉 Response found in result.response!');
                    console.log('Response:', result.response);
                } else if (result.address) {
                    console.log('🎉 Address found directly in result!');
                    console.log('Address:', result.address);
                } else {
                    console.log('❓ Unexpected result structure');
                    console.log('Full result:', JSON.stringify(result, null, 2));
                }
            } else {
                console.log('❌ Result is null/undefined');
            }
            
        } catch (error) {
            console.log('❌ Create method failed:', error.message);
            console.log('Error type:', typeof error);
            console.log('Error stack:', error.stack);
        }
        
        console.log('\n✅ Debug completed!');
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

debugV19();
