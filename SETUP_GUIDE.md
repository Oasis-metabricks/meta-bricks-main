# MetaBricks Setup Guide

## 🚀 Quick Start Checklist

### Phase 1: Environment Setup (Day 1)

#### 1.1 Stripe Configuration
- [ ] Get Stripe account and API keys
- [ ] Create `.env` file in `src/app/components/max-server/`
- [ ] Add your Stripe keys:
  ```
  STRIPE_SECRET_KEY=sk_test_your_key_here
  STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
  ```

#### 1.2 Pinata Configuration
- [ ] Get Pinata account and API keys
- [ ] Add Pinata keys to `.env`:
  ```
  PINATA_API_KEY=your_pinata_api_key
  PINATA_SECRET_KEY=your_pinata_secret_key
  ```

#### 1.3 Solana Wallet Setup
- [ ] Create or use existing Solana wallet
- [ ] Ensure wallet has SOL for transactions
- [ ] Update `my-keypair.json` in `src/app/components/secrets/`

### Phase 2: Asset Generation & Upload (Day 2)

#### 2.1 Generate All Bricks
```bash
cd src/app/components/Metabricks_NFTs
npm install
npm run generate
```

#### 2.2 Upload to Pinata
```bash
npm run upload
```

#### 2.3 Update Metadata
- [ ] Update all metadata files with correct IPFS hashes
- [ ] Upload metadata files to Pinata
- [ ] Update `brickWallState.js` with correct metadata URIs

### Phase 3: Testing & Development (Day 3)

#### 3.1 Start Development Servers
```bash
# Terminal 1: Start Angular frontend
npm start

# Terminal 2: Start Node.js backend
npm run start:server
```

#### 3.2 Test Payment Flow
- [ ] Test Stripe checkout integration
- [ ] Test NFT minting on Solana devnet
- [ ] Verify brick wall updates correctly

### Phase 4: Production Deployment (Day 4)

#### 4.1 Build for Production
```bash
./deploy.sh
```

#### 4.2 Choose Hosting Platform

**Frontend Options:**
- **Vercel** (Recommended): `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **Firebase**: `firebase deploy`

**Backend Options:**
- **Railway** (Recommended): `railway up`
- **Heroku**: `git push heroku main`
- **DigitalOcean App Platform**

#### 4.3 Configure Production Environment
- [ ] Set production environment variables
- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Test production deployment

## 📋 Detailed Steps

### Step 1: Environment Variables

Create `.env` file in `src/app/components/max-server/`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Solana Configuration
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com

# Server Configuration
PORT=3001
NODE_ENV=development

# Pinata Configuration
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here
```

### Step 2: Generate All 432 Bricks

```bash
cd src/app/components/Metabricks_NFTs
npm install
node generate_all_bricks.js
```

This will create:
- 432 metadata files (0.json to 431.json)
- Brick distribution configuration
- All brick images (cycling through existing 30 images)

### Step 3: Upload to Pinata

```bash
node upload_to_pinata.js
```

This will:
- Upload all brick images to Pinata
- Update metadata files with IPFS hashes
- Create upload results file

### Step 4: Update Server Configuration

After uploading to Pinata, update the metadata URIs in:
- `src/app/components/max-server/brickWallState.js`
- All metadata files in `src/app/components/Metabricks_NFTs/assets/`

### Step 5: Test Locally

```bash
# Terminal 1
npm start

# Terminal 2
npm run start:server
```

Visit `http://localhost:4200` to test the application.

### Step 6: Deploy to Production

```bash
./deploy.sh
```

Choose your hosting platform and follow their deployment instructions.

## 🔧 Troubleshooting

### Common Issues

1. **Stripe Webhook Errors**
   - Ensure webhook URL is correct
   - Verify webhook secret matches
   - Test with Stripe CLI

2. **Solana Transaction Failures**
   - Check wallet has sufficient SOL
   - Verify network (devnet vs mainnet)
   - Check transaction logs

3. **Pinata Upload Failures**
   - Verify API keys are correct
   - Check file size limits
   - Ensure proper file format

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check Angular version compatibility
   - Verify all dependencies are installed

## 📊 Monitoring & Analytics

### Key Metrics to Track
- Total bricks sold
- Revenue by brick type
- User engagement
- Transaction success rate
- Error rates

### Tools to Set Up
- Google Analytics
- Sentry (error tracking)
- Stripe Dashboard
- Solana Explorer

## 🚀 Launch Checklist

### Pre-Launch
- [ ] All 432 bricks generated and uploaded
- [ ] Payment flow tested and working
- [ ] NFT minting tested on devnet
- [ ] Production environment configured
- [ ] Domain and SSL certificate set up
- [ ] Error monitoring configured

### Launch Day
- [ ] Deploy to production
- [ ] Test all functionality
- [ ] Monitor for errors
- [ ] Announce launch
- [ ] Monitor user feedback

### Post-Launch
- [ ] Monitor performance
- [ ] Collect user feedback
- [ ] Fix any issues quickly
- [ ] Plan feature updates

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review error logs
3. Test on devnet first
4. Contact support if needed

---

**Ready to launch MetaBricks! 🧱** 