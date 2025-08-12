const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const fs = require('fs-extra');
const path = require('path');

async function minimalDeploy() {
    try {
        console.log('🚀 Minimal MetaBricks Candy Machine Deployment...');
        
        // Initialize Solana connection
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        console.log('🔗 Connected to Solana devnet');
        
        // Load existing keypair
        const keypairPath = './keypair.json';
        const keypairData = await fs.readJson(keypairPath);
        const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
        
        // Check wallet balance
        const balance = await connection.getBalance(keypair.publicKey);
        console.log(`💰 Wallet balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        
        // Initialize Metaplex
        const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair));
        console.log('🍬 Metaplex initialized');
        
        // Try to create a very basic Candy Machine
        console.log('🏗️  Creating basic Candy Machine...');
        
        try {
            // Method 1: Try with minimal parameters
            const { candyMachine } = await metaplex.candyMachines().create({
                itemsAvailable: 432,
                sellerFeeBasisPoints: 700,
                symbol: "MBRICK"
            });
            
            console.log('✅ Candy Machine created with minimal params!');
            console.log(`🔗 Address: ${candyMachine.address}`);
            
        } catch (error1) {
            console.log('❌ Minimal create failed:', error1.message);
            
            try {
                // Method 2: Try with builders
                console.log('🔄 Trying builders approach...');
                
                const builder = metaplex.candyMachines().builders().create({
                    itemsAvailable: 432,
                    sellerFeeBasisPoints: 700,
                    symbol: "MBRICK"
                });
                
                console.log('✅ Builder created');
                
                // Try to send the builder
                if (typeof builder.then === 'function') {
                    // It's a promise, wait for it
                    const result = await builder;
                    console.log('✅ Builder resolved:', result);
                    
                    if (result && result.candyMachine) {
                        console.log('🎉 Candy Machine created via builder!');
                        console.log(`🔗 Address: ${result.candyMachine.address}`);
                    }
                } else {
                    console.log('❓ Builder is not a promise');
                }
                
            } catch (error2) {
                console.log('❌ Builders approach failed:', error2.message);
                
                // Method 3: Try to inspect what's available
                console.log('🔍 Inspecting available methods...');
                
                const candyMachines = metaplex.candyMachines();
                console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(candyMachines)));
                
                if (candyMachines.builders) {
                    const builders = candyMachines.builders();
                    console.log('Builder methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(builders)));
                }
            }
        }
        
        console.log('\n✅ Minimal deployment test completed!');
        
    } catch (error) {
        console.error('❌ Minimal deployment failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run if called directly
if (require.main === module) {
    minimalDeploy().catch(console.error);
}

module.exports = { minimalDeploy };
