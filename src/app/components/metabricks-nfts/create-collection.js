const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const fs = require('fs-extra');
const path = require('path');

async function createCollection() {
    try {
        console.log('🎨 Creating MetaBricks Collection NFT...');
        
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
        
        // Create collection NFT
        console.log('🏗️  Creating collection NFT...');
        
        const { nft: collection } = await metaplex.nfts().create({
            name: "MetaBricks Collection",
            symbol: "MBRICK",
            sellerFeeBasisPoints: 700, // 7%
            creators: [{
                address: keypair.publicKey,
                share: 100,
                verified: true
            }],
            isMutable: true,
            isCollection: true,
            // Use a placeholder image for now
            uri: "https://gateway.pinata.cloud/ipfs/bafkreigqsyyi6qumiq544of4kzwfgffohvnvq36usivstvrfyw52u5qxf4/regular_brick.png"
        });
        
        console.log('✅ Collection NFT created successfully!');
        console.log(`🔗 Collection address: ${collection.address}`);
        console.log(`🔗 Collection mint: ${collection.mint.address}`);
        
        // Save collection info
        const collectionInfo = {
            collectionAddress: collection.address.toString(),
            collectionMint: collection.mint.address.toString(),
            network: 'devnet',
            createdAt: new Date().toISOString(),
            keypair: {
                publicKey: keypair.publicKey.toString(),
                secretKey: Array.from(keypair.secretKey)
            }
        };
        
        const collectionPath = path.join(__dirname, 'candy-machine', 'collection.json');
        await fs.ensureDir(path.dirname(collectionPath));
        await fs.writeJson(collectionPath, collectionInfo, { spaces: 2 });
        
        console.log('\n🎉 Collection NFT is ready!');
        console.log('\n🎯 Next steps:');
        console.log('   1. Use this collection for Candy Machine creation');
        console.log('   2. Deploy Candy Machine to devnet');
        console.log('   3. Test minting with devnet SOL');
        
        return collection;
        
    } catch (error) {
        console.error('❌ Collection creation failed:', error.message);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    createCollection().catch(console.error);
}

module.exports = { createCollection };
