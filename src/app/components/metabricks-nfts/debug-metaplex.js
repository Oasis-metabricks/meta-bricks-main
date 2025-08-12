const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');

async function debugMetaplex() {
    try {
        console.log('🔍 Debugging Metaplex Candy Machine API...');
        
        // Initialize Solana connection
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        console.log('🔗 Connected to Solana devnet');
        
        // Generate a test keypair
        const keypair = Keypair.generate();
        console.log('🔑 Generated test keypair');
        
        // Check balance
        const balance = await connection.getBalance(keypair.publicKey);
        console.log(`💰 Wallet balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        
        if (balance < LAMPORTS_PER_SOL) {
            console.log('⚠️  Low balance! Requesting devnet airdrop...');
            const signature = await connection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL);
            await connection.confirmTransaction(signature);
            
            const newBalance = await connection.getBalance(keypair.publicKey);
            console.log(`💰 New balance: ${(newBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        }
        
        // Initialize Metaplex
        const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair));
        console.log('🍬 Metaplex initialized');
        
        // Explore Candy Machine API
        console.log('\n📋 Candy Machine API Structure:');
        
        const candyMachines = metaplex.candyMachines();
        console.log('candyMachines type:', typeof candyMachines);
        console.log('candyMachines methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(candyMachines)));
        
        // Check builders
        if (candyMachines.builders) {
            console.log('\n🔨 Builders available:');
            const builders = candyMachines.builders();
            console.log('builders methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(builders)));
            
            if (builders.create) {
                console.log('\n📝 Create method signature:');
                console.log('create type:', typeof builders.create);
                console.log('create parameters:', builders.create.length);
                
                // Try to inspect the create method
                try {
                    const createMethod = builders.create;
                    console.log('create method:', createMethod.toString().substring(0, 200) + '...');
                } catch (e) {
                    console.log('Could not inspect create method:', e.message);
                }
            }
        }
        
        // Check if there's a direct create method
        if (candyMachines.create) {
            console.log('\n🎯 Direct create method available');
            console.log('create type:', typeof candyMachines.create);
            console.log('create parameters:', candyMachines.create.length);
        }
        
        // Check for other creation methods
        const allMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(candyMachines));
        const createMethods = allMethods.filter(method => method.toLowerCase().includes('create'));
        console.log('\n🔍 Methods containing "create":', createMethods);
        
        console.log('\n✅ Debug completed!');
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

debugMetaplex();
