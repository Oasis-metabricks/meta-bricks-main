const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setupPinata() {
    console.log('🔧 MetaBricks Pinata Setup Wizard');
    console.log('=====================================\n');
    
    console.log('To complete your MetaBricks setup, you need Pinata API keys.');
    console.log('Pinata is an IPFS pinning service that will host your brick images and metadata.\n');
    
    console.log('📋 Steps to get your Pinata API keys:');
    console.log('1. Go to https://pinata.cloud');
    console.log('2. Sign up for a free account');
    console.log('3. Go to your API Keys section');
    console.log('4. Create a new API key');
    console.log('5. Copy the API Key and Secret Key\n');
    
    const hasKeys = await question('Do you already have your Pinata API keys? (y/n): ');
    
    if (hasKeys.toLowerCase() === 'y' || hasKeys.toLowerCase() === 'yes') {
        console.log('\nGreat! Let\'s set up your environment file.\n');
        
        const apiKey = await question('Enter your Pinata API Key: ');
        const secretKey = await question('Enter your Pinata Secret Key: ');
        
        // Optional configurations
        const solanaAddress = await question('Enter your Solana wallet address (or press Enter to skip): ');
        const customGateway = await question('Enter custom IPFS gateway URL (or press Enter for default): ');
        
        // Create .env file
        const envContent = `# Pinata Configuration (for IPFS)
PINATA_API_KEY=${apiKey}
PINATA_SECRET_KEY=${secretKey}

# Solana Configuration
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
${solanaAddress ? `SOLANA_WALLET_ADDRESS=${solanaAddress}` : 'SOLANA_WALLET_ADDRESS=your_solana_wallet_address_here'}

# Optional: Custom IPFS Gateway
IPFS_GATEWAY=${customGateway || 'https://gateway.pinata.cloud/ipfs/'}
`;
        
        const envPath = path.join(__dirname, '.env');
        await fs.writeFile(envPath, envContent);
        
        console.log('\n✅ Environment file created successfully!');
        console.log(`📁 Location: ${envPath}`);
        
        // Test the configuration
        console.log('\n🧪 Testing your Pinata configuration...');
        try {
            process.env.PINATA_API_KEY = apiKey;
            process.env.PINATA_SECRET_KEY = secretKey;
            
            // Test with a simple API call
            const testResponse = await fetch('https://api.pinata.cloud/data/testAuthentication', {
                headers: {
                    'pinata_api_key': apiKey
                }
            });
            
            if (testResponse.ok) {
                console.log('✅ Pinata API connection successful!');
                console.log('\n🎯 You\'re ready to upload your MetaBricks!');
                console.log('\nNext steps:');
                console.log('1. Run: npm run upload');
                console.log('2. Wait for all 432 bricks to upload');
                console.log('3. Run: node update_backend.js');
                console.log('4. Test your brick wall!');
            } else {
                console.log('❌ Pinata API connection failed. Please check your keys.');
            }
        } catch (error) {
            console.log('❌ Error testing Pinata connection:', error.message);
        }
        
    } else {
        console.log('\n📚 No problem! Here\'s what you need to do:\n');
        console.log('1. Visit https://pinata.cloud');
        console.log('2. Create a free account');
        console.log('3. Get your API keys from the dashboard');
        console.log('4. Come back and run this script again\n');
        
        console.log('💡 Why Pinata?');
        console.log('- Free IPFS hosting for your NFT metadata');
        console.log('- Reliable pinning service');
        console.log('- Easy API integration');
        console.log('- Perfect for NFT projects\n');
        
        console.log('🔗 Alternative IPFS services:');
        console.log('- Infura IPFS');
        console.log('- Web3.Storage');
        console.log('- NFT.Storage');
        console.log('- Fleek\n');
    }
    
    rl.close();
}

// Run the setup
if (require.main === module) {
    setupPinata().catch(console.error);
}

module.exports = { setupPinata };

