# 🍬 MetaBricks Candy Machine Setup

This guide will walk you through setting up and deploying your MetaBricks NFT collection using Metaplex Candy Machine on Solana.

## 🎯 **What This Gives You:**

- **Mystery Box Minting**: Users pay 0.5 SOL and discover their brick rarity upon minting
- **Automatic Rarity Distribution**: 360 Regular, 60 Industrial, 12 Legendary bricks
- **Dynamic Perk System**: Random perks assigned based on brick type
- **Solana Integration**: Built-in marketplace and royalty management
- **Professional Minting Experience**: No manual IPFS uploads needed

## 🚀 **Quick Start:**

### **1. Generate Configuration**
```bash
node candy-machine-setup.js
```
This creates:
- `candy-machine/brick-configs.json` - All 432 brick configurations
- `candy-machine/candy-machine-config.json` - Candy Machine settings

### **2. Deploy to Solana Devnet**
```bash
node deploy-candy-machine.js
```
This will:
- Generate a Solana keypair
- Request devnet SOL airdrop
- Deploy Candy Machine to Solana devnet
- Save deployment information

### **3. Test Minting**
- Connect wallet to devnet
- Mint test bricks with devnet SOL
- Verify rarity distribution and perks

## 📁 **File Structure:**

```
candy-machine/
├── brick-configs.json          # All 432 brick configurations
├── candy-machine-config.json   # Candy Machine settings
└── deployment.json             # Deployment info (after deployment)
```

## ⚙️ **Configuration Options:**

### **Brick Types & Distribution:**
- **Regular**: 360 bricks (83.3%) - Common rarity
- **Industrial**: 60 bricks (13.9%) - Rare rarity  
- **Legendary**: 12 bricks (2.8%) - Legendary rarity

### **Mint Settings:**
- **Price**: 0.5 SOL (~$50)
- **Royalty**: 7% creator share
- **Max Supply**: 432 bricks
- **Symbol**: MBRICK

### **Perk System:**
- **OASIS Platform**: API access tiers, OAPP development
- **Our World**: Oland airdrops, billboards, statues
- **AR World**: Token integration, custom experiences
- **HoloNET**: hApp creation
- **Special Benefits**: Integration requests, mystery perks

## 🔑 **Key Features:**

### **Mystery Box Mechanics:**
1. **All bricks cost the same** (0.5 SOL)
2. **Rarity is hidden** until minting
3. **Perks are randomized** but influenced by rarity
4. **Core benefits are deterministic** by rarity

### **Automatic Metadata Generation:**
- **No manual IPFS uploads** needed
- **Metadata generated on-chain** during minting
- **Images already on IPFS** (your existing brick PNGs)
- **Dynamic perk assignment** for variety

## 🌐 **Networks:**

### **Devnet (Testing):**
- **RPC URL**: `https://api.devnet.solana.com`
- **Bundlr**: `https://devnet.bundlr.network`
- **SOL**: Free airdrops available

### **Mainnet (Production):**
- **RPC URL**: `https://api.mainnet-beta.solana.com`
- **Bundlr**: `https://node1.bundlr.network`
- **SOL**: Real SOL required

## 🚀 **Deployment Steps:**

### **Step 1: Generate Config**
```bash
node candy-machine-setup.js
```

### **Step 2: Deploy to Devnet**
```bash
node deploy-candy-machine.js
```

### **Step 3: Test Minting**
- Use Solana wallet (Phantom, Solflare, etc.)
- Connect to devnet
- Mint test bricks
- Verify functionality

### **Step 4: Deploy to Mainnet**
- Change network in `deploy-candy-machine.js`
- Ensure sufficient SOL balance
- Deploy with real SOL

## 💰 **Costs:**

### **Devnet:**
- **SOL**: Free airdrops
- **Deployment**: Free
- **Testing**: Free

### **Mainnet:**
- **SOL**: ~0.01 SOL for deployment
- **Storage**: ~0.001 SOL per brick
- **Total**: ~0.5 SOL for full deployment

## 🎨 **Customization:**

### **Change Mint Price:**
Edit `candy-machine-config.json`:
```json
{
  "mintConfig": {
    "price": 1.0  // 1 SOL instead of 0.5
  }
}
```

### **Modify Rarity Distribution:**
Edit `candy-machine-setup.js`:
```javascript
brickTypes: {
  regular: { count: 300 },    // Fewer regular
  industrial: { count: 100 }, // More industrial
  legendary: { count: 32 }    // More legendary
}
```

### **Add New Perks:**
Edit the `perkSystem` in `candy-machine-setup.js`

## 🔍 **Troubleshooting:**

### **Common Issues:**

1. **"Cannot find module"**: Run `npm install` first
2. **"Insufficient SOL"**: Request devnet airdrop
3. **"Network error"**: Check RPC URL and internet connection
4. **"Keypair error"**: Delete `keypair.json` and regenerate

### **Debug Mode:**
Add logging to see detailed information:
```javascript
console.log('Debug info:', { brickType, perks, coreBenefits });
```

## 📚 **Next Steps:**

1. **Test on devnet** thoroughly
2. **Customize configuration** as needed
3. **Deploy to mainnet** when ready
4. **Start marketing** your MetaBricks collection
5. **Monitor minting** and adjust pricing if needed

## 🎊 **You're Ready!**

Your MetaBricks Candy Machine is now set up with:
- ✅ **432 unique brick configurations**
- ✅ **Mystery box minting system**
- ✅ **Dynamic perk distribution**
- ✅ **Solana blockchain integration**
- ✅ **Professional minting experience**

**Start deploying and testing!** 🚀🧱✨

