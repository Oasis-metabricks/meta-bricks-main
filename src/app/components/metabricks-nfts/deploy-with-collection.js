const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const fs = require('fs-extra');
const path = require('path');

// Configuration
const CONFIG = {
    network: 'devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    candyMachineConfigPath: './candy-machine/candy-machine-config.json',
    brickConfigsPath: './candy-machine/brick-configs.json',
    collectionPath: './candy-machine/collection.json'
};

// Deploy Candy Machine with Collection
async function deployCandyMachineWithCollection() {
    try {
        console.log('🚀 Deploying MetaBricks Candy Machine with Collection...');
        
        // Load configuration
        const candyMachineConfig = await fs.readJson(CONFIG.candyMachineConfigPath);
        const brickConfigs = await fs.readJson(CONFIG.brickConfigsPath);
        const collectionInfo = await fs.readJson(CONFIG.collectionPath);
        
        console.log(`📊 Loaded configuration for ${brickConfigs.length} bricks`);
        console.log(`💰 Mint price: ${candyMachineConfig.mintConfig.price} SOL`);
        console.log(`🎨 Royalty: ${candyMachineConfig.mintConfig.sellerFeeBasisPoints / 100}%`);
        console.log(`🎨 Collection: ${collectionInfo.collectionAddress}`);
        
        // Initialize Solana connection
        const connection = new Connection(CONFIG.rpcUrl, 'confirmed');
        console.log(`🔗 Connected to Solana ${CONFIG.network}`);
        
        // Load existing keypair
        const keypairPath = './keypair.json';
        const keypairData = await fs.readJson(keypairPath);
        const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
        
        // Check wallet balance
        const balance = await connection.getBalance(keypair.publicKey);
        console.log(`💰 Wallet balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        
        if (balance < 0.1) {
            throw new Error('Insufficient SOL balance. Need at least 0.1 SOL for deployment.');
        }
        
        // Initialize Metaplex
        const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair));
        console.log('🍬 Metaplex initialized');
        
        // Create Candy Machine with Collection
        console.log('🏗️  Creating Candy Machine with Collection...');
        
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
            })),
            collection: {
                address: new PublicKey(collectionInfo.collectionAddress),
                updateAuthority: keypair.publicKey
            }
        });
        
        console.log('✅ Candy Machine created successfully!');
        console.log(`🔗 Candy Machine address: ${candyMachine.address}`);
        
        // Save deployment info
        const deploymentInfo = {
            candyMachineAddress: candyMachine.address.toString(),
            collectionAddress: collectionInfo.collectionAddress,
            collectionMint: collectionInfo.collectionMint,
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
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        throw error;
    }
}

// Main execution
async function main() {
    try {
        // Deploy Candy Machine with Collection
        const candyMachine = await deployCandyMachineWithCollection();
        
        console.log('\n🎊 MetaBricks Candy Machine is ready!');
        
    } catch (error) {
        console.error('❌ Main execution failed:', error.message);
        process.exit(1);
    }
}

// Export functions
module.exports = {
    deployCandyMachineWithCollection
};

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
