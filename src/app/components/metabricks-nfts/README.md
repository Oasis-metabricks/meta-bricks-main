# MetaBricks NFT Generation & Upload System

This directory contains all the scripts needed to generate and upload MetaBricks to Pinata IPFS, completing your brick wall for sale.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd src/app/components/metabricks-nfts
npm install
```

### 2. Configure Environment
Copy the environment template and add your Pinata API keys:
```bash
cp env.example .env
# Edit .env with your actual Pinata API keys
```

### 3. Generate All Bricks
```bash
npm run generate
```
This will create:
- 432 brick metadata files (1.json to 432.json)
- Placeholder images for each brick
- Complete brick data structure
- Brick wall state for backend integration

### 4. Upload to Pinata
```bash
npm run upload
```
This will:
- Upload all metadata files to Pinata IPFS
- Upload all brick images to Pinata IPFS
- Update metadata with real IPFS hashes
- Generate upload summary

### 5. Update Backend
```bash
node update_backend.js
```
This will:
- Update `brickWallState.js` with real IPFS hashes
- Create backup of original file
- Generate updated frontend brick wall state

## 📁 File Structure

```
metabricks-nfts/
├── package.json              # Dependencies and scripts
├── generate_all_bricks.js    # Brick generation script
├── upload_to_pinata.js       # Pinata upload script
├── update_backend.js         # Backend update script
├── env.example               # Environment template
├── README.md                 # This file
└── assets/                   # Generated assets (after running scripts)
    ├── metadata/             # Individual brick metadata files
    ├── images/               # Brick images
    ├── all_bricks.json       # Complete brick data
    ├── brickWallState.json   # Backend-compatible format
    ├── generation_summary.json # Generation statistics
    └── upload_summary.json   # Upload results and IPFS hashes
```

## 🧱 Brick Types & Distribution

- **Regular Bricks**: 360 bricks at $10 each (Common rarity)
- **Industrial Bricks**: 60 bricks at $25 each (Rare rarity)  
- **Legendary Bricks**: 12 bricks at $100 each (Legendary rarity)

**Total**: 432 bricks (24x18 wall layout)

## 🎨 Brick Attributes

Each brick has unique attributes:
- **Type**: Regular, Industrial, or Legendary
- **Rarity**: Common, Rare, or Legendary
- **Color**: Various colors based on brick type
- **Pattern**: Visual patterns and textures
- **Material**: Material composition
- **Price**: Minting price in USD
- **Position**: Row and column on the brick wall

## 🔧 Scripts

### `npm run generate`
Generates all 432 MetaBricks with:
- Unique metadata for each brick
- Proper NFT structure for Solana
- Position calculations for 24x18 wall
- Attribute randomization for variety

### `npm run upload`
Uploads all assets to Pinata IPFS:
- Metadata files (JSON)
- Brick images (PNG placeholders)
- Updates metadata with real IPFS hashes
- Generates comprehensive upload summary

### `node update_backend.js`
Updates the backend system:
- Replaces placeholder IPFS hashes with real ones
- Updates `brickWallState.js` automatically
- Creates backup of original files
- Generates frontend-compatible data

## 🌐 Pinata Configuration

You need a Pinata account with API access:

1. **Sign up** at [pinata.cloud](https://pinata.cloud)
2. **Get API keys** from your dashboard
3. **Add to .env file**:
   ```
   PINATA_API_KEY=your_api_key_here
   PINATA_SECRET_KEY=your_secret_key_here
   ```

## 📊 Output Files

After running all scripts, you'll have:

- **432 metadata files** ready for NFT minting
- **432 brick images** on IPFS
- **Updated backend** with real IPFS hashes
- **Complete brick wall** ready for sale
- **Upload summaries** for verification

## 🚨 Important Notes

1. **Backup**: Always backup your original files before running updates
2. **Rate Limiting**: Pinata has rate limits, scripts include delays
3. **API Keys**: Never commit your .env file to version control
4. **Testing**: Test on devnet before mainnet deployment
5. **Verification**: Verify all IPFS hashes are accessible after upload

## 🔍 Troubleshooting

### Common Issues

**Pinata API Errors**
- Verify API keys are correct
- Check rate limits and account status
- Ensure files are under size limits

**Generation Failures**
- Check Node.js version (>=16.0.0)
- Verify all dependencies are installed
- Check file permissions

**Backend Update Failures**
- Ensure upload completed successfully
- Check file paths and permissions
- Verify brickWallState.js structure

### Getting Help

1. Check the console output for specific error messages
2. Verify all environment variables are set
3. Ensure Pinata account is active and has credits
4. Check file permissions in the project directory

## 🎯 Next Steps After Completion

1. **Test the brick wall** with real IPFS content
2. **Verify all bricks** are displaying correctly
3. **Test payment flow** with Stripe integration
4. **Deploy to production** when ready
5. **Start selling MetaBricks!**

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review console output and error messages
3. Verify all configuration steps were completed
4. Check Pinata account status and API limits

---

**Ready to complete your MetaBricks collection! 🧱✨**

