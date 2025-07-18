// blockchainService.js
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const solanaWeb3 = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

const Connection = solanaWeb3.Connection;
const PublicKey = solanaWeb3.PublicKey;
const Keypair = solanaWeb3.Keypair;

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const keypairPath = path.join(__dirname, '../secrets/my-keypair.json');
const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, 'utf8')));
const wallet = Keypair.fromSecretKey(secretKey);

const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

async function mintNFT(walletAddress, metadataUri) {
    const receiverPublicKey = new PublicKey(walletAddress);
    const { nft } = await metaplex.nfts().create({
        uri: metadataUri,
        name: 'Example NFT Name', // Consider making these dynamic
        sellerFeeBasisPoints: 500, // 5% seller fee
        tokenOwner: receiverPublicKey, // Mint directly to user's wallet
    });
    return nft;
}

module.exports = { mintNFT };
