# MetaBricks Backend Server

This is the Node.js backend server for the MetaBricks NFT platform.

## Features

- **Brick Management**: Manages 432 bricks (24x18 wall) with different types (regular, industrial, legendary)
- **Stripe Integration**: Handles payment processing for brick purchases
- **REST API**: Provides endpoints for frontend communication
- **Webhook Support**: Processes Stripe webhooks for payment confirmation

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   - Copy `env.example` to `.env`
   - Fill in your Stripe keys and other configuration

3. **Start the Server**:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Bricks
- `GET /bricks` - Get all bricks
- `GET /brick-stats` - Get brick statistics
- `GET /brick/:id` - Get specific brick by ID
- `GET /minted-bricks` - Get list of minted brick IDs
- `POST /reset-minted-bricks` - Reset all bricks to unsold state

### Payments
- `POST /create-checkout-session` - Create Stripe checkout session
- `GET /check-payment-status/:sessionId` - Check payment status
- `POST /webhook` - Stripe webhook endpoint

### Health
- `GET /health` - Health check endpoint

## Brick Types

- **Regular**: 360 bricks, $10 each
- **Industrial**: 60 bricks, $25 each  
- **Legendary**: 12 bricks, $100 each

## Environment Variables

See `env.example` for all required environment variables.

## Development

The server runs on port 3001 by default (configurable via PORT environment variable).
