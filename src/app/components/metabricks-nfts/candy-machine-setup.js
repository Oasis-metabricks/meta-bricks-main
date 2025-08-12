const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { Metaplex } = require('@metaplex-foundation/js');

// Configuration
const CONFIG = {
    // Solana network (devnet for testing, mainnet-beta for production)
    network: 'devnet',
    
    // Your wallet address
    creatorWallet: '85ArqfA2fy8spGcMGsSW7cbEJAWj26vewmmoG2bwkgT9',
    
    // Brick types and their distribution
    brickTypes: {
        regular: {
            count: 360,
            rarity: 'Common',
            imageHash: 'bafkreigqsyyi6qumiq544of4kzwfgffohvnvq36usivstvrfyw52u5qxf4',
            imageFilename: 'regular_brick.png',
            tokenAirdrop: 100,
            tgeDiscount: 10
        },
        industrial: {
            count: 60,
            rarity: 'Rare',
            imageHash: 'bafybeia7dnclsgkjh6ugyzdzb3uivkydgozpmnbtpnnu4an3t2fta45ktm',
            imageFilename: 'industrial_brick.png',
            tokenAirdrop: 200,
            tgeDiscount: 15
        },
        legendary: {
            count: 12,
            rarity: 'Legendary',
            imageHash: 'bafybeia7dnclsgkjh6ugyzdzb3uivkydgozpmnbtpnnu4an3t2fta45ktm',
            imageFilename: 'legendary_brick.png',
            tokenAirdrop: 300,
            tgeDiscount: 20
        }
    },
    
    // Perk system - All perks are now MYSTERY except keychain
    perkSystem: {
        physical: [
            { name: "MetaBrick Keychain", rarity: "Guaranteed", value: "Keychain" }
        ],
        mystery: [
            { name: "Mystery Perk #1", rarity: "Mystery", value: "Mystery1" },
            { name: "Mystery Perk #2", rarity: "Mystery", value: "Mystery2" },
            { name: "Mystery Perk #3", rarity: "Mystery", value: "Mystery3" },
            { name: "Mystery Perk #4", rarity: "Mystery", value: "Mystery4" },
            { name: "Mystery Perk #5", rarity: "Mystery", value: "Mystery5" },
            { name: "Mystery Perk #6", rarity: "Mystery", value: "Mystery6" },
            { name: "Mystery Perk #7", rarity: "Mystery", value: "Mystery7" },
            { name: "Mystery Perk #8", rarity: "Mystery", value: "Mystery8" },
            { name: "Mystery Perk #9", rarity: "Mystery", value: "Mystery9" },
            { name: "Mystery Perk #10", rarity: "Mystery", value: "Mystery10" },
            { name: "Mystery Perk #11", rarity: "Mystery", value: "Mystery11" },
            { name: "Mystery Perk #12", rarity: "Mystery", value: "Mystery12" },
            { name: "Mystery Perk #13", rarity: "Mystery", value: "Mystery13" },
            { name: "Mystery Perk #14", rarity: "Mystery", value: "Mystery14" }
        ]
    },
    
    // Mint configuration
    mintConfig: {
        price: 0.5, // 0.5 SOL (approximately $50)
        symbol: "MBRICK",
        sellerFeeBasisPoints: 700, // 7% royalty
        maxSupply: 432,
        isMutable: true,
        creators: [
            {
                address: '85ArqfA2fy8spGcMGsSW7cbEJAWj26vewmmoG2bwkgT9',
                share: 100
            }
        ]
    }
};

// Generate brick metadata template
function generateBrickMetadata(brickId, brickType, perks, coreBenefits) {
    const type = CONFIG.brickTypes[brickType];
    
    return {
        name: `MetaBrick #${brickId}`,
        symbol: CONFIG.mintConfig.symbol,
        description: `A unique MetaBrick from the MetaBricks collection. Each brick includes exclusive perks and benefits across the OASIS ecosystem. Rarity and type are revealed upon minting!`,
        image: `https://gateway.pinata.cloud/ipfs/${type.imageHash}/${type.imageFilename}`,
        attributes: [
            {
                trait_type: "Token Airdrop",
                value: "Guaranteed",
                description: "Token airdrop on TGE"
            },
            {
                trait_type: "TGE Discount",
                value: `${coreBenefits.tgeDiscount}%`,
                description: "Token Generation Event discount"
            },
            ...perks.map(perk => ({
                trait_type: perk.category,
                value: perk.name,
                description: perk.description,
                rarity: perk.rarity
            }))
        ],
        properties: {
            files: [
                {
                    type: "image/png",
                    uri: `https://gateway.pinata.cloud/ipfs/${type.imageHash}/${type.imageFilename}`
                }
            ],
            category: "image",
            creators: CONFIG.mintConfig.creators
        },
        // Hidden metadata (revealed on mint)
        hiddenMetadata: {
            type: brickType,
            rarity: type.rarity,
            tokenAirdrop: coreBenefits.tokenAirdrop,
            tgeDiscount: coreBenefits.tgeDiscount
        },
        // Extended metadata for perks
        perks: perks,
        coreBenefits: coreBenefits,
        productFocus: perks.filter(p => p.category !== "Special Benefits").map(p => p.category)
    };
}

// Generate all brick configurations for Candy Machine
function generateAllBrickConfigs() {
    const configs = [];
    let brickId = 1;
    
    // Create distribution pattern for mixed rarities
    const totalBricks = 432;
    const industrialInterval = Math.floor(totalBricks / CONFIG.brickTypes.industrial.count);
    const legendaryInterval = Math.floor(totalBricks / CONFIG.brickTypes.legendary.count);
    
    console.log('🚀 Generating MetaBricks Candy Machine configuration...');
    console.log(`📦 Total Bricks: ${totalBricks}`);
    console.log(`   Regular: ${CONFIG.brickTypes.regular.count} bricks`);
    console.log(`   Industrial: ${CONFIG.brickTypes.industrial.count} bricks (every ~${industrialInterval} bricks)`);
    console.log(`   Legendary: ${CONFIG.brickTypes.legendary.count} bricks (every ~${legendaryInterval} bricks)`);
    
    for (let i = 0; i < totalBricks; i++) {
        let brickType = 'regular';
        let perks, coreBenefits;
        
        // Determine brick type based on position (same logic as before)
        if (i % legendaryInterval === 0 && i > 0) {
            brickType = 'legendary';
        } else if (i % industrialInterval === 0 && i > 0) {
            brickType = 'industrial';
        }
        
        const type = CONFIG.brickTypes[brickType];
        
        // Generate perks based on brick type and rarity
        perks = generateBrickPerks(brickType);
        coreBenefits = {
            tokenAirdrop: type.tokenAirdrop,
            tgeDiscount: type.tgeDiscount
        };
        
        // Generate metadata
        const metadata = generateBrickMetadata(brickId, brickType, perks, coreBenefits);
        
        configs.push({
            brickId,
            brickType,
            metadata,
            perks,
            coreBenefits
        });
        
        brickId++;
    }
    
    return configs;
}

// Generate brick perks (same logic as before)
function generateBrickPerks(brickType) {
    const perks = [];
    const type = CONFIG.brickTypes[brickType];
    
    // Add core benefits as perks
    perks.push({
        category: "Core Benefits",
        name: "Token Airdrop",
        description: `${type.tokenAirdrop} tokens guaranteed on TGE`,
        rarity: type.rarity,
        value: `${type.tokenAirdrop} tokens`
    });
    
    // Add guaranteed physical perk (MetaBrick Keychain)
    perks.push({
        category: "Physical",
        name: "MetaBrick Keychain",
        description: "Exclusive physical MetaBrick keychain - shipped to your address",
        rarity: "Guaranteed",
        value: "Keychain"
    });
    
    // Add random perks based on brick type (excluding physical since it's guaranteed)
    const perkCategories = Object.keys(CONFIG.perkSystem).filter(cat => cat !== 'physical');
    const numPerks = Math.floor(Math.random() * 2) + 1; // 1-2 additional perks per brick
    
    for (let i = 0; i < numPerks; i++) {
        const category = perkCategories[Math.floor(Math.random() * perkCategories.length)];
        const categoryPerks = CONFIG.perkSystem[category];
        const perk = categoryPerks[Math.floor(Math.random() * categoryPerks.length)];
        
        perks.push({
            ...perk,
            category: category.charAt(0).toUpperCase() + category.slice(1)
        });
    }
    
    return perks;
}

// Main function
async function setupCandyMachine() {
    try {
        console.log('🍬 Setting up MetaBricks Candy Machine...');
        
        // Generate all brick configurations
        const brickConfigs = generateAllBrickConfigs();
        
        // Save configurations
        const fs = require('fs-extra');
        const path = require('path');
        
        const candyMachineDir = path.join(__dirname, 'candy-machine');
        await fs.ensureDir(candyMachineDir);
        
        // Save brick configurations
        const configsPath = path.join(candyMachineDir, 'brick-configs.json');
        await fs.writeJson(configsPath, brickConfigs, { spaces: 2 });
        
        // Save Candy Machine configuration
        const candyMachineConfig = {
            ...CONFIG,
            totalBricks: brickConfigs.length,
            generatedAt: new Date().toISOString()
        };
        
        const configPath = path.join(candyMachineDir, 'candy-machine-config.json');
        await fs.writeJson(configPath, candyMachineConfig, { spaces: 2 });
        
        console.log('✅ Candy Machine configuration generated!');
        console.log(`📁 Files saved in: ${candyMachineDir}`);
        console.log(`📊 Total bricks configured: ${brickConfigs.length}`);
        
        console.log('\n🎯 Next steps:');
        console.log('   1. Review the configuration files');
        console.log('   2. Set up Solana wallet and devnet SOL');
        console.log('   3. Deploy Candy Machine to Solana');
        console.log('   4. Test minting with devnet');
        
        return brickConfigs;
        
    } catch (error) {
        console.error('❌ Candy Machine setup failed:', error.message);
        throw error;
    }
}

// Export functions
module.exports = {
    setupCandyMachine,
    generateAllBrickConfigs,
    CONFIG
};

// Run if called directly
if (require.main === module) {
    setupCandyMachine().catch(console.error);
}

