const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const purchaseHandler = require('./purchaseHandler');
const brickWallState = require('./brickWallState');
const { mintNFT } = require('./blockchainService');
const fs = require('fs');
const path = require('path');

// --- STRIPE INTEGRATION ---
const Stripe = require('stripe');
const stripe = Stripe('sk_test_REPLACE_ME'); // TODO: Replace with your real Stripe secret key

const MINTED_BRICKS_FILE = path.join(__dirname, 'mintedBricks.json');

function readMintedBricks() {
    try {
        if (!fs.existsSync(MINTED_BRICKS_FILE)) return [];
        const data = fs.readFileSync(MINTED_BRICKS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error('Error reading mintedBricks.json:', e);
        return [];
    }
}

function writeMintedBricks(list) {
    try {
        fs.writeFileSync(MINTED_BRICKS_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch (e) {
        console.error('Error writing mintedBricks.json:', e);
    }
}

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

app.post('/purchase', purchaseHandler);
app.get('/bricks', brickWallState.getBricks);

// Add /minted-bricks endpoint
app.get('/minted-bricks', (req, res) => {
    const minted = readMintedBricks();
    res.json({ minted });
});

// Add /reset-minted-bricks endpoint
app.post('/reset-minted-bricks', (req, res) => {
    writeMintedBricks([]);
    res.json({ success: true });
});

// Add /mint-nft endpoint
app.post('/mint-nft', async (req, res) => {
    const { walletAddress, metadataUri } = req.body;
    try {
        if (!walletAddress || !metadataUri) {
            return res.status(400).json({ success: false, message: 'Missing wallet address or metadata URI' });
        }

        // Check if already minted
        const minted = readMintedBricks();
        if (minted.includes(metadataUri)) {
            return res.status(409).json({ success: false, message: 'This brick has already been minted.' });
        }

        // Validate metadataUri is accessible and valid JSON
        const response = await fetch(metadataUri);
        if (!response.ok) {
            return res.status(400).json({ success: false, message: 'Metadata URI is not accessible.' });
        }
        let metadata;
        try {
            metadata = await response.json();
        } catch (e) {
            return res.status(400).json({ success: false, message: 'Metadata URI does not contain valid JSON.' });
        }
        if (!metadata || !metadata.name || !metadata.image) {
            return res.status(400).json({ success: false, message: 'Metadata JSON is invalid or missing required fields.' });
        }

        const mintResult = await mintNFT(walletAddress, metadataUri);
        // Add to minted list
        minted.push(metadataUri);
        writeMintedBricks(minted);
        res.json({ success: true, data: mintResult });
    } catch (error) {
        console.error('Minting error:', error);
        res.status(500).json({ success: false, message: 'Minting failed', error: error.message });
    }
});

app.post('/create-checkout-session', async (req, res) => {
    const { walletAddress, metadataUri } = req.body;
    if (!walletAddress || !metadataUri) {
        return res.status(400).json({ error: 'Missing walletAddress or metadataUri' });
    }
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: 'Metabrick NFT' },
                    unit_amount: 1000, // $10.00 (in cents) - adjust as needed
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'http://localhost:4200/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:4200/cancel',
            metadata: {
                walletAddress,
                metadataUri
            }
        });
        res.json({ id: session.id });
    } catch (err) {
        console.error('Stripe session error:', err);
        res.status(500).json({ error: 'Failed to create Stripe session' });
    }
});

// --- STRIPE WEBHOOK ENDPOINT ---
const endpointSecret = 'whsec_REPLACE_ME'; // TODO: Replace with your Stripe webhook secret
app.post('/webhook', bodyParser.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const walletAddress = session.metadata.walletAddress;
        const metadataUri = session.metadata.metadataUri;
        if (walletAddress && metadataUri) {
            try {
                // Reuse minting logic from /mint-nft
                const minted = readMintedBricks();
                if (!minted.includes(metadataUri)) {
                    const mintResult = await mintNFT(walletAddress, metadataUri);
                    minted.push(metadataUri);
                    writeMintedBricks(minted);
                    console.log('NFT minted via Stripe for', walletAddress, metadataUri);
                } else {
                    console.log('NFT already minted for', metadataUri);
                }
            } catch (err) {
                console.error('Error minting NFT via Stripe:', err);
            }
        }
    }
    res.json({received: true});
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
