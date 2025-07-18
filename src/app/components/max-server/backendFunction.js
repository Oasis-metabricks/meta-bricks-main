const express = require('express');
const { Connection, PublicKey, clusterApiUrl, Transaction, sendAndConfirmTransaction } = require('@solana/web3.js');

const app = express();
app.use(express.json());

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

app.post('/mint-nft', async (req, res) => {
    const { walletAddress, metadataUri } = req.body;
    try {
        const publicKey = new PublicKey(walletAddress);
        // Assuming the minting logic is encapsulated in a separate function
        const result = await mintNFT(publicKey, metadataUri);
        res.json({ success: true, transactionId: result });
    } catch (error) {
        console.error('Minting failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

async function mintNFT(publicKey, metadataUri) {
    const transaction = new Transaction();
    // Add transaction instructions for minting
    // Here you would typically interact with a smart contract
    return await sendAndConfirmTransaction(connection, transaction, [publicKey]);
}

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
