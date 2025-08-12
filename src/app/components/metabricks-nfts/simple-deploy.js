const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const fs = require('fs-extra');
const path = require('path');

// Configuration
const CONFIG = {
    network: 'devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    candyMachineConfigPath: './candy-machine/candy-machine-config.json',
    brickConfigsPath: './candy-machine/brick-configs.json'
};

// Deploy Candy Machine
async function deployCandyMachine() {
    try {
        console.log('🚀 Deploying MetaBricks Candy Machine to Solana...');
        
        // Load configuration
        const candyMachineConfig = await fs.readJson(CONFIG.candyMachineConfigPath);
        const brickConfigs = await fs.readJson(CONFIG.brickConfigsPath);
        
        console.log(`📊 Loaded configuration for ${brickConfigs.length} bricks`);
        console.log(`💰 Mint price: ${candyMachineConfig.mintConfig.price} SOL`);
        console.log(`🎨 Royalty: ${candyMachineConfig.mintConfig.sellerFeeBasisPoints / 100}%`);
        
        // Initialize Solana connection
        const connection = new Connection(CONFIG.rpcUrl, 'confirmed');
        console.log(`🔗 Connected to Solana ${CONFIG.network}`);
        
        // Check if we have a keypair file
        const keypairPath = path.join(__dirname, 'keypair.json');
        let keypair;
        
        if (await fs.pathExists(keypairPath)) {
            console.log('🔑 Loading existing keypair...');
            const keypairData = await fs.readJson(keypairPath);
            keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
        } else {
            console.log('🔑 Generating new keypair...');
            keypair = Keypair.generate();
            
            // Save keypair for future use
            await fs.writeJson(keypairPath, Array.from(keypair.secretKey), { spaces: 2 });
            console.log('💾 Keypair saved to keypair.json');
        }
        
        // Check wallet balance
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
        
        // Create Candy Machine step by step
        console.log('🏗️  Creating Candy Machine...');
        
        try {
            // First, let's try to create a basic Candy Machine
            const candyMachineBuilder = metaplex.candyMachines().builders().create({
                itemsAvailable: candyMachineConfig.mintConfig.maxSupply,
                sellerFeeBasisPoints: candyMachineConfig.mintConfig.sellerFeeBasisPoints,
                symbol: candyMachineConfig.mintConfig.symbol,
                maxEditionSupply: 0,
                isMutable: candyMachineConfig.mintConfig.isMutable,
                creators: candyMachineConfig.mintConfig.creators.map(creator => ({
                    address: new PublicKey(creator.address),
                    share: creator.share,
                    verified: false
                }))
            });
            
            console.log('🔨 Candy Machine builder created');
            
            // Build and send the transaction
            const { candyMachine } = await candyMachineBuilder.sendAndConfirm(keypair);
            
            console.log('✅ Candy Machine created successfully!');
            console.log(`🔗 Candy Machine address: ${candyMachine.address}`);
            
            // Save deployment info
            const deploymentInfo = {
                candyMachineAddress: candyMachine.address.toString(),
                network: CONFIG.network,
                deployedAt: new Date().toISOString(),
                config: candyMachineConfig,
                keypair: {
                    publicKey: keypair.publicKey.toString(),
                    secretKey: Array.from(keypair.secretKey)
                }
            };
            
            const deploymentPath = path.join(__dirname, 'candy-machine', 'deployment.json');
            await fs.writeJson(deploymentPath, deploymentInfo, { spaces: 2 });
            
            console.log('\n🎉 Deployment completed successfully!');
            console.log('\n🎯 Next steps:');
            console.log('   1. Upload metadata URIs to Candy Machine');
            console.log('   2. Test minting with devnet SOL');
            console.log('   3. Deploy to mainnet when ready');
            console.log('   4. Start selling MetaBricks!');
            
            return candyMachine;
            
        } catch (createError) {
            console.error('❌ Candy Machine creation failed:', createError.message);
            
            // Try alternative approach - create without items first
            console.log('🔄 Trying alternative creation method...');
            
            const { candyMachine } = await metaplex.candyMachines().create({
                itemsAvailable: candyMachineConfig.mintConfig.maxSupply,
                sellerFeeBasisPoints: candyMachineConfig.mintConfig.sellerFeeBasisPoints,
                symbol: candyMachineConfig.mintConfig.symbol,
                maxEditionSupply: 0,
                isMutable: candyMachineConfig.mintConfig.isMutable,
                creators: candyMachineConfig.mintConfig.creators.map(creator => ({
                    address: new PublicKey(creator.address),
                    share: creator.share,
                    verified: false
                }))
            });
            
            console.log('✅ Candy Machine created with alternative method!');
            console.log(`🔗 Candy Machine address: ${candyMachine.address}`);
            
            return candyMachine;
        }
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        throw error;
    }
}

// Main execution
async function main() {
    try {
        // Deploy Candy Machine
        const candyMachine = await deployCandyMachine();
        
        console.log('\n🎊 MetaBricks Candy Machine is ready!');
        
    } catch (error) {
        console.error('❌ Main execution failed:', error.message);
        process.exit(1);
    }
}

// Export functions
module.exports = {
    deployCandyMachine
};

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
