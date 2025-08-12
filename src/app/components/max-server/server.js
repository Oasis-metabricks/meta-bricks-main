const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Stripe = require('stripe');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Stripe
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_REPLACE_ME');
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_REPLACE_ME';

// Import brick wall state
const { getBricks, getBrickStats, getBrickById, markBrickAsSold, resetBrickWall } = require('./brickWallState');

// Routes
app.get('/bricks', (req, res) => {
    try {
        const bricks = getBricks();
        res.json(bricks);
    } catch (error) {
        console.error('Error fetching bricks:', error);
        res.status(500).json({ error: 'Failed to fetch bricks' });
    }
});

app.get('/brick-stats', (req, res) => {
    try {
        const stats = getBrickStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching brick stats:', error);
        res.status(500).json({ error: 'Failed to fetch brick stats' });
    }
});

app.get('/brick/:id', (req, res) => {
    try {
        const brick = getBrickById(req.params.id);
        if (brick) {
            res.json(brick);
        } else {
            res.status(404).json({ error: 'Brick not found' });
        }
    } catch (error) {
        console.error('Error fetching brick:', error);
        res.status(500).json({ error: 'Failed to fetch brick' });
    }
});

app.get('/minted-bricks', (req, res) => {
    try {
        const bricks = getBricks();
        const mintedBricks = bricks.filter(brick => brick.sold);
        res.json({ minted: mintedBricks.map(brick => brick.id) });
    } catch (error) {
        console.error('Error fetching minted bricks:', error);
        res.status(500).json({ error: 'Failed to fetch minted bricks' });
    }
});

app.post('/reset-minted-bricks', (req, res) => {
    try {
        resetBrickWall();
        res.json({ message: 'Brick wall reset successfully' });
    } catch (error) {
        console.error('Error resetting brick wall:', error);
        res.status(500).json({ error: 'Failed to reset brick wall' });
    }
});

// Stripe checkout session creation
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { brickId, price, metadataUri, walletAddress } = req.body;
        
        // If brickId is not provided, try to extract it from metadataUri or use a default
        let actualBrickId = brickId;
        let actualPrice = price;
        
        if (!actualBrickId && metadataUri) {
            // Try to extract brick ID from metadataUri
            const match = metadataUri.match(/(\d+)\.json$/);
            if (match) {
                actualBrickId = parseInt(match[1]);
            }
        }
        
        if (!actualPrice && actualBrickId) {
            // Get price from brick data
            const brick = getBrickById(actualBrickId);
            if (brick) {
                actualPrice = brick.price;
            }
        }
        
        if (!actualBrickId || !actualPrice) {
            return res.status(400).json({ error: 'Missing brickId or price' });
        }
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `MetaBrick #${actualBrickId}`,
                            description: `MetaBrick NFT - ${actualBrickId}`,
                        },
                        unit_amount: actualPrice * 100, // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/cancel`,
            metadata: {
                brickId: actualBrickId.toString(),
                metadataUri: metadataUri || '',
                walletAddress: walletAddress || ''
            }
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Check payment status
app.get('/check-payment-status/:sessionId', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
        res.json({ 
            status: session.payment_status,
            metadata: session.metadata
        });
    } catch (error) {
        console.error('Error checking payment status:', error);
        res.status(500).json({ error: 'Failed to check payment status' });
    }
});

// Stripe webhook
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
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
        const brickId = session.metadata.brickId;
        
        if (brickId) {
            try {
                markBrickAsSold(brickId);
                console.log(`Brick ${brickId} marked as sold`);
            } catch (error) {
                console.error('Error marking brick as sold:', error);
            }
        }
    }

    res.json({ received: true });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
    console.log(`MetaBricks backend server running on port ${port}`);
});
