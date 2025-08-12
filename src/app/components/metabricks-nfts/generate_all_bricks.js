const fs = require('fs-extra');
const path = require('path');

// Brick configuration
const BRICK_TYPES = {
    regular: { count: 360, price: 50, rarity: 'Common' },
    industrial: { count: 60, price: 50, rarity: 'Rare' },
    legendary: { count: 12, price: 50, rarity: 'Legendary' }
};

// Brick attributes and variations
const BRICK_ATTRIBUTES = {
    regular: {
        colors: ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Brown', 'Gray', 'Black'],
        patterns: ['Solid', 'Striped', 'Dotted', 'Gradient', 'Metallic'],
        materials: ['Clay', 'Concrete', 'Stone', 'Metal', 'Plastic']
    },
    industrial: {
        colors: ['Steel', 'Iron', 'Copper', 'Bronze', 'Silver', 'Gold', 'Chrome'],
        patterns: ['Riveted', 'Welded', 'Machined', 'Textured', 'Industrial'],
        materials: ['Steel', 'Iron', 'Aluminum', 'Titanium', 'Carbon Fiber']
    },
    legendary: {
        colors: ['Diamond', 'Emerald', 'Ruby', 'Sapphire', 'Amethyst', 'Opal'],
        patterns: ['Crystalline', 'Prismatic', 'Ethereal', 'Cosmic', 'Mystical'],
        materials: ['Diamond', 'Crystal', 'Ethereal Matter', 'Cosmic Energy', 'Mystical Essence']
    }
};

// Perk system configuration
const PERK_SYSTEM = {
    // Core benefits for all bricks
    core: {
        tokenAirdrop: {
            regular: 100,      // Base airdrop amount
            industrial: 100,   // Same airdrop amount
            legendary: 100     // Same airdrop amount
        },
        tgeDiscount: {
            regular: 10,       // Base discount percentage
            industrial: 15,    // Medium discount percentage
            legendary: 20      // Higher discount percentage
        }
    },
    
    // Product-specific perks
    products: {
        oasis: {
            name: "OASIS Platform",
            description: "Decentralized API and integration platform",
            perks: [
                { name: "Bronze Tier API Access", description: "Free 1-year access to OASIS Bronze Tier API", rarity: "Common", value: "Bronze" },
                { name: "Silver Tier API Access", description: "Free 1-year access to OASIS Silver Tier API", rarity: "Rare", value: "Silver" },
                { name: "Gold Tier API Access", description: "Free 1-year access to OASIS Gold Tier API", rarity: "Rare", value: "Gold" },
                { name: "Free OAPP Development", description: "Free OASIS App development and deployment", rarity: "Legendary", value: "OAPP" }
            ]
        },
        ourWorld: {
            name: "Our World",
            description: "Virtual world and metaverse platform",
            perks: [
                { name: "Oland Airdrop", description: "Free Oland virtual land tokens", rarity: "Common", value: "Oland" },
                { name: "Billboard Placement", description: "Free advertising space in Our World", rarity: "Rare", value: "Billboard" },
                { name: "Personal Statue", description: "Personal statue/monument in Our World", rarity: "Legendary", value: "Statue" },
                { name: "Landmark Naming", description: "Name a landmark or location in Our World", rarity: "Rare", value: "Landmark" }
            ]
        },
        arWorld: {
            name: "AR World",
            description: "Augmented reality and token integration platform",
            perks: [
                { name: "Token Integration", description: "Integrate your own token into AR World", rarity: "Rare", value: "Integration" },
                { name: "Custom AR Experience", description: "Customized AR brick experience", rarity: "Rare", value: "AR Experience" },
                { name: "Custom Building", description: "Design and build your own structure in AR World", rarity: "Legendary", value: "Custom Building" }
            ]
        },
        holoNet: {
            name: "HoloNET",
            description: "Decentralized hosting and application platform",
            perks: [
                { name: "Free hApp Creation", description: "Free decentralized application hosting on HoloNET", rarity: "Rare", value: "hApp" }
            ]
        },
        special: {
            name: "Special Benefits",
            description: "Exclusive and mystery perks",
            perks: [
                { name: "OASIS Integration Request", description: "Priority consideration for OASIS integration", rarity: "Rare", value: "Integration Request" },
                { name: "Mystery Perk", description: "Undisclosed special benefit to be revealed", rarity: "Legendary", value: "Mystery" },
                { name: "Early Access", description: "Priority access to new features and updates", rarity: "Rare", value: "Early Access" }
            ]
        }
    }
};

// Generate random perks for a brick with rarity-based distribution
function generateBrickPerks(brickType) {
    const perks = [];
    const productKeys = Object.keys(PERK_SYSTEM.products);
    
    // Determine base perk count based on brick type
    let perkCount = 2; // Regular bricks
    if (brickType === 'industrial') perkCount = 3;
    if (brickType === 'legendary') perkCount = 4;
    
    // Always include at least one special perk
    const specialPerk = PERK_SYSTEM.products.special.perks[Math.floor(Math.random() * PERK_SYSTEM.products.special.perks.length)];
    perks.push({
        category: "Special Benefits",
        name: specialPerk.name,
        description: specialPerk.description,
        rarity: specialPerk.rarity,
        value: specialPerk.value
    });
    
    // Add product-specific perks
    const availableProducts = productKeys.filter(key => key !== 'special');
    const selectedProducts = [];
    
    // Select products based on perk count
    if (perkCount === 2) {
        // Regular brick: 1 product + 1 special
        const product = availableProducts[Math.floor(Math.random() * availableProducts.length)];
        selectedProducts.push(product);
    } else if (perkCount === 3) {
        // Industrial brick: 2 products + 1 special
        const shuffled = availableProducts.sort(() => 0.5 - Math.random());
        selectedProducts.push(shuffled[0], shuffled[1]);
    } else if (perkCount === 4) {
        // Legendary brick: 3 products + 1 special
        const shuffled = availableProducts.sort(() => 0.5 - Math.random());
        selectedProducts.push(shuffled[0], shuffled[1], shuffled[2]);
    }
    
    // Add perks from selected products with rarity-based weighting
    selectedProducts.forEach(productKey => {
        const product = PERK_SYSTEM.products[productKey];
        let availablePerks = product.perks;
        
        // Apply rarity-based filtering with some randomness
        if (brickType === 'regular') {
            // Regular bricks: 70% Common, 25% Rare, 5% Legendary (lucky!)
            availablePerks = availablePerks.filter(perk => {
                if (perk.rarity === 'Common') return Math.random() < 0.70;
                if (perk.rarity === 'Rare') return Math.random() < 0.25;
                if (perk.rarity === 'Legendary') return Math.random() < 0.05; // 5% chance for legendary!
                return true;
            });
        } else if (brickType === 'industrial') {
            // Industrial bricks: 40% Common, 45% Rare, 15% Legendary
            availablePerks = availablePerks.filter(perk => {
                if (perk.rarity === 'Common') return Math.random() < 0.40;
                if (perk.rarity === 'Rare') return Math.random() < 0.45;
                if (perk.rarity === 'Legendary') return Math.random() < 0.15;
                return true;
            });
        } else if (brickType === 'legendary') {
            // Legendary bricks: 20% Common, 30% Rare, 50% Legendary
            availablePerks = availablePerks.filter(perk => {
                if (perk.rarity === 'Common') return Math.random() < 0.20;
                if (perk.rarity === 'Rare') return Math.random() < 0.30;
                if (perk.rarity === 'Legendary') return Math.random() < 0.50;
                return true;
            });
        }
        
        if (availablePerks.length > 0) {
            const selectedPerk = availablePerks[Math.floor(Math.random() * availablePerks.length)];
            perks.push({
                category: product.name,
                name: selectedPerk.name,
                description: selectedPerk.description,
                rarity: selectedPerk.rarity,
                value: selectedPerk.value
            });
        }
    });
    
    return perks;
}

// Generate random attributes for a brick
function generateBrickAttributes(brickType) {
    const attributes = BRICK_ATTRIBUTES[brickType];
    return {
        color: attributes.colors[Math.floor(Math.random() * attributes.colors.length)],
        pattern: attributes.patterns[Math.floor(Math.random() * attributes.patterns.length)],
        material: attributes.materials[Math.floor(Math.random() * attributes.materials.length)]
    };
}

// Generate brick metadata
function generateBrickMetadata(brickId, brickType, attributes, perks, coreBenefits) {
    const brickConfig = BRICK_TYPES[brickType];
    
    // Create perk attributes for NFT metadata
    const perkAttributes = perks.map(perk => ({
        trait_type: perk.category,
        value: perk.name,
        description: perk.description,
        rarity: perk.rarity
    }));
    
    // Add core benefit attributes
    const coreAttributes = [
        {
            trait_type: "Token Airdrop",
            value: "Guaranteed",
            description: "Token airdrop on TGE"
        },
        {
            trait_type: "TGE Discount",
            value: `${coreBenefits.tgeDiscount}%`,
            description: "Token Generation Event discount"
        }
    ];
    
    // Hidden attributes (not visible in marketplace)
    const hiddenAttributes = [
        {
            trait_type: "Type",
            value: brickType.charAt(0).toUpperCase() + brickType.slice(1)
        },
        {
            trait_type: "Rarity",
            value: attributes.rarity
        }
    ];
    
    // Visible attributes (what buyers see)
    const visibleAttributes = [
        {
            trait_type: "Token Airdrop",
            value: "Guaranteed",
            description: "Token airdrop on TGE"
        },
        {
            trait_type: "TGE Discount",
            value: `${coreBenefits.tgeDiscount}%`,
            description: "Token Generation Event discount"
        }
    ];
    
    // Determine the correct image based on brick type
    let imageHash, imageFilename;
    switch(brickType) {
        case 'regular':
            imageHash = 'bafkreigqsyyi6qumiq544of4kzwfgffohvnvq36usivstvrfyw52u5qxf4';
            imageFilename = 'regular_brick.png';
            break;
        case 'industrial':
            imageHash = 'bafybeia7dnclsgkjh6ugyzdzb3uivkydgozpmnbtpnnu4an3t2fta45ktm';
            imageFilename = 'industrial_brick.png';
            break;
        case 'legendary':
            imageHash = 'bafybeia7dnclsgkjh6ugyzdzb3uivkydgozpmnbtpnnu4an3t2fta45ktm';
            imageFilename = 'legendary_brick.png';
            break;
        default:
            imageHash = 'bafkreigqsyyi6qumiq544of4kzwfgffohvnvq36usivstvrfyw52u5qxf4'; // fallback to regular
            imageFilename = 'regular_brick.png';
    }

    return {
        name: `MetaBrick #${brickId}`,
        symbol: "MBRICK",
        description: `A unique MetaBrick from the MetaBricks collection. Each brick includes exclusive perks and benefits across the OASIS ecosystem. Rarity and type are revealed upon minting!`,
        image: `https://gateway.pinata.cloud/ipfs/${imageHash}/${imageFilename}`,
        attributes: [...visibleAttributes, ...perkAttributes],
        // Hidden metadata for backend use
        hiddenMetadata: {
            type: brickType,
            rarity: attributes.rarity,
            hiddenAttributes: hiddenAttributes
        },
        properties: {
            files: [
                {
                    type: "image/png",
                    uri: `https://gateway.pinata.cloud/ipfs/${imageHash}/${imageFilename}`
                }
            ],
            category: "image",
            creators: [
                {
                    address: "85ArqfA2fy8spGcMGsSW7cbEJAWj26vewmmoG2bwkgT9",
                    share: 7
                }
            ]
        },
        // Extended metadata for perks
        perks: perks,
        coreBenefits: coreBenefits,
        productFocus: perks.filter(p => p.category !== "Special Benefits").map(p => p.category)
    };
}

// Generate all bricks with mixed rarities
function generateAllBricks() {
    const bricks = [];
    let brickId = 1;
    
    console.log('🚀 Starting MetaBricks generation with mixed rarities...');
    
    // Create distribution pattern for mixed rarities
    const totalBricks = 432;
    const regularCount = BRICK_TYPES.regular.count;
    const industrialCount = BRICK_TYPES.industrial.count;
    const legendaryCount = BRICK_TYPES.legendary.count;
    
    // Calculate distribution intervals
    const industrialInterval = Math.floor(totalBricks / industrialCount); // ~7 bricks apart
    const legendaryInterval = Math.floor(totalBricks / legendaryCount);   // ~36 bricks apart
    
    console.log(`📦 Generating ${totalBricks} bricks with mixed rarities...`);
    console.log(`   Regular: ${regularCount} bricks`);
    console.log(`   Industrial: ${industrialCount} bricks (every ~${industrialInterval} bricks)`);
    console.log(`   Legendary: ${legendaryCount} bricks (every ~${legendaryInterval} bricks)`);
    
    // Generate all bricks with mixed distribution
    for (let i = 0; i < totalBricks; i++) {
        let brickType = 'regular';
        let attributes, perks, coreBenefits;
        
        // Determine brick type based on position
        if (i % legendaryInterval === 0 && i > 0) {
            // Place legendary bricks at intervals
            brickType = 'legendary';
            attributes = generateBrickAttributes('legendary');
            attributes.rarity = BRICK_TYPES.legendary.rarity;
            perks = generateBrickPerks('legendary');
            coreBenefits = {
                tokenAirdrop: PERK_SYSTEM.core.tokenAirdrop.legendary,
                tgeDiscount: PERK_SYSTEM.core.tgeDiscount.legendary
            };
        } else if (i % industrialInterval === 0 && i > 0) {
            // Place industrial bricks at intervals
            brickType = 'industrial';
            attributes = generateBrickAttributes('industrial');
            attributes.rarity = BRICK_TYPES.industrial.rarity;
            perks = generateBrickPerks('industrial');
            coreBenefits = {
                tokenAirdrop: PERK_SYSTEM.core.tokenAirdrop.industrial,
                tgeDiscount: PERK_SYSTEM.core.tgeDiscount.industrial
            };
        } else {
            // Regular bricks fill the rest
            brickType = 'regular';
            attributes = generateBrickAttributes('regular');
            attributes.rarity = BRICK_TYPES.regular.rarity;
            perks = generateBrickPerks('regular');
            coreBenefits = {
                tokenAirdrop: PERK_SYSTEM.core.tokenAirdrop.regular,
                tgeDiscount: PERK_SYSTEM.core.tgeDiscount.regular
            };
        }
        
        bricks.push({
            id: brickId,
            type: brickType,
            price: BRICK_TYPES[brickType].price,
            sold: false,
            metadata: generateBrickMetadata(brickId, brickType, attributes, perks, coreBenefits),
            position: {
                row: Math.floor((brickId - 1) / 24),
                col: (brickId - 1) % 24
            },
            perks: perks,
            coreBenefits: coreBenefits
        });
        brickId++;
    }
    
    console.log(`✅ Generated ${bricks.length} bricks total!`);
    return bricks;
}

// Create directories and save files
async function createBrickFiles() {
    const bricks = generateAllBricks();
    
    // Create directories
    const assetsDir = path.join(__dirname, 'assets');
    const metadataDir = path.join(assetsDir, 'metadata');
    const imagesDir = path.join(assetsDir, 'images');
    
    await fs.ensureDir(assetsDir);
    await fs.ensureDir(metadataDir);
    await fs.ensureDir(imagesDir);
    
    console.log('📁 Created asset directories');
    
    // Save individual metadata files
    console.log('💾 Saving metadata files...');
    for (const brick of bricks) {
        const metadataPath = path.join(metadataDir, `${brick.id}.json`);
        await fs.writeJson(metadataPath, brick.metadata, { spaces: 2 });
    }
    
    // Save complete brick data
    const brickDataPath = path.join(assetsDir, 'all_bricks.json');
    await fs.writeJson(brickDataPath, bricks, { spaces: 2 });
    
    // Save brick wall state for backend
    const brickWallState = bricks.map(brick => ({
        id: brick.id,
        type: brick.type,
        price: brick.price,
        sold: brick.sold,
        name: brick.metadata.name,
        seriesNumber: brick.id,
        mintPrice: `$${brick.price}`,
        image: brick.metadata.image,
        metadataUri: `https://gateway.pinata.cloud/ipfs/PINATA_HASH_PLACEHOLDER/${brick.id}.json`,
        imageUrl: brick.metadata.image,
        position: brick.position,
        perks: brick.perks,
        coreBenefits: brick.coreBenefits
    }));
    
    const brickWallPath = path.join(assetsDir, 'brickWallState.json');
    await fs.writeJson(brickWallPath, brickWallState, { spaces: 2 });
    
    console.log('💾 Saved all brick data files');
    
    // Generate summary
    const summary = {
        totalBricks: bricks.length,
        brickTypes: {
            regular: bricks.filter(b => b.type === 'regular').length,
            industrial: bricks.filter(b => b.type === 'industrial').length,
            legendary: bricks.filter(b => b.type === 'legendary').length
        },
        totalValue: bricks.reduce((sum, brick) => sum + brick.price, 0),
        perkDistribution: {
            totalPerks: bricks.reduce((sum, brick) => sum + brick.perks.length, 0),
            averagePerksPerBrick: (bricks.reduce((sum, brick) => sum + brick.perks.length, 0) / bricks.length).toFixed(2)
        },
        generatedAt: new Date().toISOString()
    };
    
    const summaryPath = path.join(assetsDir, 'generation_summary.json');
    await fs.writeJson(summaryPath, summary, { spaces: 2 });
    
    console.log('📊 Generation Summary:');
    console.log(`   Total Bricks: ${summary.totalBricks}`);
    console.log(`   Regular: ${summary.brickTypes.regular}`);
    console.log(`   Industrial: ${summary.brickTypes.industrial}`);
    console.log(`   Legendary: ${summary.brickTypes.legendary}`);
    console.log(`   Total Value: $${summary.totalValue}`);
    console.log(`   Total Perks: ${summary.perkDistribution.totalPerks}`);
    console.log(`   Average Perks per Brick: ${summary.perkDistribution.averagePerksPerBrick}`);
    
    console.log('\n🎯 Next steps:');
    console.log('   1. Update your .env file with Pinata API keys');
    console.log('   2. Run: npm run upload');
    console.log('   3. Update brickWallState.js with real IPFS hashes');
    
    return bricks;
}

// Run the generation
if (require.main === module) {
    createBrickFiles().catch(console.error);
}

module.exports = { generateAllBricks, createBrickFiles };
