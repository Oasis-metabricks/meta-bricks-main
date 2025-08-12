# 🧱 MetaBricks Perks & System Reference

## 📋 **Complete Perk System Overview**

### **🎁 Physical Perks (Guaranteed for Every Brick)**
- **MetaBrick Keychain** - Exclusive physical keychain shipped to your address
  - Rarity: Guaranteed
  - Value: Keychain
  - Description: Exclusive physical MetaBrick keychain - shipped to your address

---

### **🌐 OASIS Platform Perks**
- **Bronze Tier API Access** - Free 1-year access
  - Rarity: Common
  - Value: Bronze
  - Description: Free 1-year access to OASIS Bronze Tier API

- **Silver Tier API Access** - Free 1-year access
  - Rarity: Rare
  - Value: Silver
  - Description: Free 1-year access to OASIS Silver Tier API

- **Gold Tier API Access** - Free 1-year access
  - Rarity: Rare
  - Value: Gold
  - Description: Free 1-year access to OASIS Gold Tier API

- **Free OAPP Development** - Free decentralized app development
  - Rarity: Legendary
  - Value: OAPP
  - Description: Free OAPP (OASIS Application) development

---

### **🌍 Our World Perks**
- **Free Oland Airdrops** - Virtual land tokens
  - Rarity: Common
  - Value: Oland
  - Description: Free Oland virtual land tokens

- **Free Billboard in Our World** - Advertising space
  - Rarity: Rare
  - Value: Billboard
  - Description: Free billboard advertising space in Our World

- **Statue in Our World** - Personal monument/statue
  - Rarity: Legendary
  - Value: Statue
  - Description: Personal statue/monument in Our World

---

### **🔮 AR World Perks**
- **Token Integration in AR World** - Integrate your token
  - Rarity: Common
  - Value: Integration
  - Description: Integrate your own token using AR World

- **Custom Building in AR World** - Custom AR experience
  - Rarity: Rare
  - Value: CustomBuilding
  - Description: Customized AR brick experience

---

### **🔗 HoloNET Perks**
- **Free hApp Creation** - Decentralized app hosting
  - Rarity: Rare
  - Value: hApp
  - Description: Free decentralized application hosting on HoloNET

---

### **⭐ Special Perks**
- **Free OASIS Integration Request** - Priority consideration
  - Rarity: Rare
  - Value: OASISRequest
  - Description: Priority consideration for OASIS integration

- **Mystery Perk** - Surprise benefit
  - Rarity: Legendary
  - Value: Mystery
  - Description: Mystery perk - surprise benefit

---

## 🎯 **Perk Distribution System**

### **Per Brick:**
1. **✅ MetaBrick Keychain** (Guaranteed - 100% of bricks)
2. **✅ 1-2 Random Additional Perks** (Based on brick type)

### **Rarity Distribution:**
- **Common**: 60% chance
- **Rare**: 30% chance  
- **Legendary**: 10% chance

### **Perk Categories Available for Random Selection:**
- OASIS Platform
- Our World
- AR World
- HoloNET
- Special

---

## 🧱 **Brick Type Benefits**

### **Regular Bricks:**
- Base Airdrop Rate: **100**
- TGE Discount: **10%**
- Description: "You have successfully removed a 'REGULAR' brick from the Metabricks wall. Upon full destruction of the Metabricks wall, this will unlock the following perks and benefits across the OASIS ecosystem:"

### **Industrial Bricks:**
- Base Airdrop Rate: **250**
- TGE Discount: **15%**
- Description: "Congratulations! You have got your hands on an 'INDUSTRIAL' grade Metabrick from the Metabrick wall. This brick comes with the following enhanced perks and benefits, which activate upon full destruction of the wall."

### **Legendary Bricks:**
- Base Airdrop Rate: **500**
- TGE Discount: **20%**
- Description: "CONGRATULATIONS!! You have found a Legendary grade Metabrick, the rarest brick type in Metabricks. Legendary bricks command the following high-tier perks, which activate upon destruction of the wall."

---

## 🎲 **Mystery Box Experience**

### **What Users Know Before Purchase:**
- All bricks cost the same ($50)
- Every brick gets a MetaBrick Keychain
- Rarity and specific perks are hidden until minting

### **What Users Discover After Purchase:**
- Brick type (Regular/Industrial/Legendary)
- Specific perks assigned to their brick
- Airdrop and discount rates
- All hidden metadata

---

## 🔧 **Technical Implementation**

### **Files:**
- **Perk System**: `pinata-integration.js` (lines 20-50)
- **Perk Generation**: `generateBrickPerks()` function
- **Metadata Generation**: `generateBrickMetadata()` function

### **Perk Generation Logic:**
```javascript
// Add guaranteed physical perk
perks.push({
    category: "Physical",
    name: "MetaBrick Keychain",
    description: "Exclusive physical MetaBrick keychain - shipped to your address",
    rarity: "Guaranteed",
    value: "Keychain"
});

// Add 1-2 random additional perks
const numPerks = Math.floor(Math.random() * 2) + 1;
// Randomly select from available categories
```

---

## 📊 **Perk Statistics**

### **Total Unique Perks:** 15
- Physical: 1
- OASIS Platform: 4
- Our World: 3
- AR World: 2
- HoloNET: 1
- Special: 2

### **Rarity Breakdown:**
- Guaranteed: 1 (MetaBrick Keychain)
- Common: 3
- Rare: 8
- Legendary: 3

---

## 🚀 **Future Expansion Ideas**

### **Potential New Perk Categories:**
- **Gaming**: In-game rewards, exclusive items
- **Events**: VIP access, exclusive meetups
- **Merchandise**: Limited edition physical items
- **Staking**: Yield farming opportunities
- **Governance**: Voting rights in DAO

### **Perk Tiers:**
- **Bronze**: Basic access
- **Silver**: Enhanced benefits
- **Gold**: Premium features
- **Platinum**: Exclusive access
- **Diamond**: VIP treatment

---

## 📝 **Notes**

- **Last Updated**: [Current Date]
- **Total Bricks**: 432
- **Perk System Version**: 1.0
- **Mystery Box**: Active
- **Physical Delivery**: MetaBrick Keychain included

---

*This reference document contains all the perks and system details for the MetaBricks collection. Use this for future development, marketing, and system updates.*
