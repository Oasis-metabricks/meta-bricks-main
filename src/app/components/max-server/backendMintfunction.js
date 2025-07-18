const express = require('express');
const { mintNFT } = require('./blockchainService'); // Assumes this handles the blockchain interaction
const cors = require('cors'); // For handling cross-origin requests if your API is public

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS if needed, configure origins based on your requirements

// POST endpoint to mint an NFT
app.post('/mint-nft', async (req, res) => {
    const { walletAddress, metadataUri } = req.body;
    try {
        // Validate input before minting
        if (!walletAddress || !metadataUri) {
            return res.status(400).json({ success: false, message: 'Missing wallet address or metadata URI' });
        }

        // Call the mintNFT function from your blockchain service
        const mintResult = await mintNFT(walletAddress, metadataUri);
        
        // Respond with the result of the minting process
        res.json({ success: true, data: mintResult });
    } catch (error) {
        console.error('Minting error:', error); // Log the error for server-side inspection
        res.status(500).json({ success: false, message: 'Minting failed', error: error.message });
    }
});

// Sample minting function (needs to be replaced with actual blockchain interaction logic)
async function mintNFT(walletAddress, metadataUri) {
    // Simulated response (replace with your smart contract interaction)
    return {
        transactionId: 'simulated_transaction_id',
        walletAddress,
        metadataUri
    };
}

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
