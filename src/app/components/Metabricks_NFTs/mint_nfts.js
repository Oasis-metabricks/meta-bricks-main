const fetch = require('node-fetch');  // Ensure you have this package installed
const { Keypair, Connection, clusterApiUrl, PublicKey } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js'); // Adjust import as needed
const fs = require('fs');
const path = require('path');

// Load your keypair
const keypairPath = path.join(__dirname, 'new-wallet.json');
const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, 'utf8'))));

// Connect to Solana devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(keypair));

// Function to fetch metadata from a given URL
const fetchMetadata = async (uri) => {
    const response = await fetch(uri);
    if (!response.ok) {
        throw new Error(`Failed to fetch metadata from ${uri}`);
    }
    return await response.json();
};

// Function to mint an NFT
const mintNFT = async (metadataUri) => {
    try {
        // Fetch the metadata
        const metadata = await fetchMetadata(metadataUri);
        
        // Prepare creators
        const creators = [
            {
                address: keypair.publicKey, // This should be a PublicKey instance
                share: 100 // Full share for the creator
            }
        ];
        
        // Create the NFT
        const { nft } = await metaplex.nfts().create({
            uri: metadataUri,
            name: metadata.name || 'MetaBrick',
            symbol: metadata.symbol || '',
            sellerFeeBasisPoints: metadata.seller_fee_basis_points || 500,  // 5% royalty fee
            creators: creators.map(creator => ({
                address: new PublicKey(creator.address), // Ensure address is a PublicKey
                share: creator.share
            })),
        });

        console.log(`Minted NFT: ${nft.address.toBase58()}`);
    } catch (error) {
        console.error(`Failed to mint NFT from ${metadataUri}:`, error);
    }
};

// List of metadata URIs to mint
const metadataUris = [
    'https://tomato-calm-flamingo-61.mypinata.cloud/ipfs/QmYxjTdT2QSvjeougQPDUPL6a3PWKCEJj7gwSXPGRkeK1w',
    'https://tomato-calm-flamingo-61.mypinata.cloud/ipfs/QmYZTeoM1QhRn8YTeLxhu16xp1fx7Rn8XFL3gd5RFb8K2C',
    'https://tomato-calm-flamingo-61.mypinata.cloud/ipfs/QmPXbWeqYon7UUJmpima7uxjPC6edVDx5zuvYxf8Guc6d8',
    'https://tomato-calm-flamingo-61.mypinata.cloud/ipfs/QmahWNqKYq4oc9xfWP6vmQLxCgCKUznDMi3ubSkG1UpNkF',
    'https://tomato-calm-flamingo-61.mypinata.cloud/ipfs/Qmbw5rYUe5Gid9BPSV62jiBy5A96QVKNMDXXdsx4NggxiM',
    'https://tomato-calm-flamingo-61.mypinata.cloud/ipfs/QmY3j6roPE3d3YdFA1fYRSLSzMNsyJY14S7jqkU5iadP8s',
    'https://tomato-calm-flamingo-61.mypinata.cloud/ipfs/QmRJCU25R3WQfGQ7A3XimeLQcvYQQc718iT1hnKECUjczJ',
    'https://tomato-calm-flamingo-61.mypinata.cloud/ipfs/QmfWPoSkYDEFXqA3A8cTcUKPMGWbiUUNvcsPMv5PrdG3uP',
    'https://tomato-calm-flamingo-61.mypinata.cloud/ipfs/Qma2NFn74iW1fYzyskf2Kq9uDcZMHEeSQ1q9KYq8CCXrfe',

    // Add other metadata URIs here
];

// Mint all NFTs
const mintAllNFTs = async () => {
    for (const metadataUri of metadataUris) {
        await mintNFT(metadataUri);
    }
};

mintAllNFTs().then(() => console.log('All NFTs minted')).catch(console.error);
