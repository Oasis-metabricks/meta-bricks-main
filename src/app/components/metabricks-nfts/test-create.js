const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');

async function testCreate() {
    try {
        console.log('🧪 Testing Candy Machine creation...');
        
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
        
        // Initialize Metaplex
        const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair));
        console.log('🍬 Metaplex initialized');
        
        // Test different creation approaches
        console.log('\n🔍 Testing creation methods...');
        
        const candyMachines = metaplex.candyMachines();
        
        // Method 1: Direct create
        console.log('\n1️⃣ Testing direct create...');
        try {
            const result = await candyMachines.create({
                itemsAvailable: 432,
                sellerFeeBasisPoints: 700,
                symbol: "MBRICK",
                maxEditionSupply: 0,
                isMutable: true,
                creators: [{
                    address: new PublicKey('85ArqfA2fy8spGcMGsSW7cbEJAWj26vewmmoG2bwkgT9'),
                    share: 100,
                    verified: false
                }]
            });
            
            console.log('✅ Direct create result:', result);
            console.log('Result type:', typeof result);
            console.log('Result keys:', Object.keys(result || {}));
            
            if (result && result.candyMachine) {
                console.log('🎉 Candy Machine created! Address:', result.candyMachine.address);
            } else if (result && result.response) {
                console.log('🎉 Candy Machine created! Response:', result.response);
            } else {
                console.log('❓ Unexpected result structure:', result);
            }
            
        } catch (error) {
            console.log('❌ Direct create failed:', error.message);
        }
        
        // Method 2: Using builders
        console.log('\n2️⃣ Testing builders approach...');
        try {
            if (candyMachines.builders) {
                const builder = candyMachines.builders().create({
                    itemsAvailable: 432,
                    sellerFeeBasisPoints: 700,
                    symbol: "MBRICK",
                    maxEditionSupply: 0,
                    isMutable: true,
                    creators: [{
                        address: new PublicKey('85ArqfA2fy8spGcMGsSW7cbEJAWj26vewmmoG2bwkgT9'),
                        share: 100,
                        verified: false
                    }]
                });
                
                console.log('✅ Builder created:', builder);
                console.log('Builder type:', typeof builder);
                console.log('Builder methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(builder)));
                
                // Try to send the builder
                if (builder.sendAndConfirm) {
                    console.log('🚀 Sending builder transaction...');
                    const result = await builder.sendAndConfirm(keypair);
                    console.log('✅ Builder sent:', result);
                } else if (builder.send) {
                    console.log('🚀 Sending builder transaction...');
                    const result = await builder.send();
                    console.log('✅ Builder sent:', result);
                } else {
                    console.log('❓ Builder has no send method');
                }
                
            } else {
                console.log('❌ No builders available');
            }
        } catch (error) {
            console.log('❌ Builders approach failed:', error.message);
        }
        
        console.log('\n✅ Test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testCreate();
