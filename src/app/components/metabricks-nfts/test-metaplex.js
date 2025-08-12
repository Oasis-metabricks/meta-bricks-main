const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');

async function testMetaplex() {
    try {
        console.log('🧪 Testing Metaplex connection...');
        
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
        
        // Test what's available
        console.log('📋 Available Metaplex modules:');
        console.log('- Candy Machines:', !!metaplex.candyMachines);
        console.log('- NFTs:', !!metaplex.nfts);
        console.log('- Tokens:', !!metaplex.tokens);
        
        if (metaplex.candyMachines) {
            console.log('🎯 Candy Machine methods available:');
            const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(metaplex.candyMachines()));
            console.log(methods);
        }
        
        console.log('✅ Metaplex test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testMetaplex();
