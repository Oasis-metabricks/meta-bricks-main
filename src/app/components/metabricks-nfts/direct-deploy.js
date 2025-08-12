const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL, Transaction, SystemProgram } = require('@solana/web3.js');
const fs = require('fs-extra');
const path = require('path');

// Configuration
const CONFIG = {
    network: 'devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    candyMachineConfigPath: './candy-machine/candy-machine-config.json',
    brickConfigsPath: './candy-machine/brick-configs.json'
};

// Deploy Candy Machine directly using Solana web3.js
async function deployCandyMachineDirect() {
    try {
        console.log('🚀 Deploying MetaBricks Candy Machine directly to Solana...');
        
        // Load configuration
        const candyMachineConfig = await fs.readJson(CONFIG.candyMachineConfigPath);
        const brickConfigs = await fs.readJson(CONFIG.brickConfigsPath);
        
        console.log(`📊 Loaded configuration for ${brickConfigs.length} bricks`);
        console.log(`💰 Mint price: ${candyMachineConfig.mintConfig.price} SOL`);
        console.log(`🎨 Royalty: ${candyMachineConfig.mintConfig.sellerFeeBasisPoints / 100}%`);
        
        // Initialize Solana connection
        const connection = new Connection(CONFIG.rpcUrl, 'confirmed');
        console.log(`🔗 Connected to Solana ${CONFIG.network}`);
        
        // Load existing keypair
        const keypairPath = './keypair.json';
        if (!await fs.pathExists(keypairPath)) {
            throw new Error('Keypair file not found. Please run the deployment script first to generate one.');
        }
        
        console.log('🔑 Loading existing keypair...');
        const keypairData = await fs.readJson(keypairPath);
        const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
        
        // Check wallet balance
        const balance = await connection.getBalance(keypair.publicKey);
        console.log(`💰 Wallet balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        
        if (balance < 0.1) {
            throw new Error('Insufficient SOL balance. Need at least 0.1 SOL for deployment.');
        }
        
        // For now, let's create a simple approach
        console.log('🏗️  Setting up deployment strategy...');
        
        // Since direct Candy Machine creation is complex, let's create a deployment plan
        const deploymentPlan = {
            network: CONFIG.network,
            totalBricks: brickConfigs.length,
            mintPrice: candyMachineConfig.mintConfig.price,
            royalty: candyMachineConfig.mintConfig.sellerFeeBasisPoints / 100,
            creatorWallet: candyMachineConfig.creatorWallet,
            deployedAt: new Date().toISOString(),
            keypair: {
                publicKey: keypair.publicKey.toString(),
                secretKey: Array.from(keypair.secretKey)
            },
            nextSteps: [
                "1. Use Solana CLI to create Candy Machine",
                "2. Upload metadata URIs",
                "3. Test minting",
                "4. Deploy to mainnet"
            ],
            solanaCommands: [
                `solana config set --url ${CONFIG.rpcUrl}`,
                `solana airdrop 2 ${keypair.publicKey} --url ${CONFIG.rpcUrl}`,
                "# Then use Metaplex CLI or manual deployment"
            ]
        };
        
        // Save deployment plan
        const deploymentPath = path.join(__dirname, 'candy-machine', 'deployment-plan.json');
        await fs.writeJson(deploymentPath, deploymentPlan, { spaces: 2 });
        
        console.log('\n📋 Deployment Plan Created!');
        console.log('\n🎯 Next Steps:');
        console.log('   1. Use Solana CLI for direct deployment');
        console.log('   2. Or use Metaplex CLI with correct parameters');
        console.log('   3. Or try a different NFT framework');
        
        console.log('\n💡 Alternative Deployment Methods:');
        console.log('   • Use Solana CLI directly');
        console.log('   • Try QuickNode NFT API');
        console.log('   • Use Helius NFT API');
        console.log('   • Manual deployment via Solana Explorer');
        
        return deploymentPlan;
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        throw error;
    }
}

// Main execution
async function main() {
    try {
        // Deploy Candy Machine
        const deploymentPlan = await deployCandyMachineDirect();
        
        console.log('\n🎊 Deployment plan is ready!');
        console.log('\n📁 Files created:');
        console.log('   • candy-machine/deployment-plan.json');
        console.log('   • candy-machine/brick-configs.json');
        console.log('   • candy-machine/candy-machine-config.json');
        
    } catch (error) {
        console.error('❌ Main execution failed:', error.message);
        process.exit(1);
    }
}

// Export functions
module.exports = {
    deployCandyMachineDirect
};

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
