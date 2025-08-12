const fs = require('fs-extra');
const path = require('path');

// Pinata Configuration
const PINATA_CONFIG = {
    apiKey: '1dc6c563e7dc75a613fb',
    secretKey: '60b8092d4447d11f2cf7e160c2c61e625eba6fd4ac5b1816de98a02dd59eaabc',
    jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmMTg4ODA1Ny0yZDRhLTQ1MzMtOWI4ZS0wZGMxYjEwNmM4YzMiLCJlbWFpbCI6Im1heC5nZXJzaGZpZWxkMUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGU0ExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMWRjNmM1NjNlN2RjNzVhNjEzZmIiLCJzY29wZWRLZXlTZWNyZXQiOiI2MGI4MDkyZDQ0NDdkMTFmMmNmN2UxNjBjMmM2MWU2MjVlYmE2ZmQ0YWM1YjE4MTZkZTk4YTAyZGQ1OWVhYWJjIiwiZXhwIjoxNzg2NTM0NTQ0fQ.564k1VU9XYgOTok3PvnyXg-Hgo4g0p4ZndOGLeZ7KWw'
};

// Brick Images (already on Pinata)
const BRICK_IMAGES = {
    regular: 'https://tomato-calm-flamingo-61.mypinata.cloud/ipfs/bafkreigqsyyi6qumiq544of4kzwfgffohvnvq36usivstvrfyw52u5qxf4?filename=regular_brick.png',
    industrial: 'https://tomato-calm-flamingo-61.mypinata.cloud/ipfs/bafybeia7dnclsgkjh6ugyzdzb3uivkydgozpmnbtpnnu4an3t2fta45ktm/industrial_brick.png',
    legendary: 'https://tomato-calm-flamingo-61.mypinata.cloud/ipfs/bafybeia7dnclsgkjh6ugyzdzb3uivkydgozpmnbtpnnu4an3t2fta45ktm/legendary_brick.png'
};

// Perk System - All perks are mystery except keychain (for hype building)
const PERK_SYSTEM = {
    physical: [
        { name: "MetaBrick Keychain", rarity: "Guaranteed", value: "Keychain" }
    ],
    mystery: [
        { name: "Mystery Perk", rarity: "Mystery", value: "Mystery" },
        { name: "Mystery Perk", rarity: "Mystery", value: "Mystery" },
        { name: "Mystery Perk", rarity: "Mystery", value: "Mystery" },
        { name: "Mystery Perk", rarity: "Mystery", value: "Mystery" },
        { name: "Mystery Perk", rarity: "Mystery", value: "Mystery" },
        { name: "Mystery Perk", rarity: "Mystery", value: "Mystery" },
        { name: "Mystery Perk", rarity: "Mystery", value: "Mystery" },
        { name: "Mystery Perk", rarity: "Mystery", value: "Mystery" },
        { name: "Mystery Perk", rarity: "Mystery", value: "Mystery" },
        { name: "Mystery Perk", rarity: "Mystery", value: "Mystery" },
        { name: "Mystery Perk", rarity: "Mystery", value: "Mystery" },
        { name: "Mystery Perk", rarity: "Mystery", value: "Mystery" },
        { name: "Mystery Perk", rarity: "Mystery", value: "Mystery" },
        { name: "Mystery Perk", rarity: "Mystery", value: "Mystery" },
        { name: "Mystery Perk", rarity: "Mystery", value: "Mystery" }
    ]
};

// Generate brick perks based on rarity
function generateBrickPerks(brickType) {
    const perks = [];
    
    // Add guaranteed physical perk (MetaBrick Keychain)
    perks.push({
        category: "Physical",
        name: "MetaBrick Keychain",
        description: "Exclusive physical MetaBrick keychain - shipped to your address",
        rarity: "Guaranteed",
        value: "Keychain"
    });
    
    // Add random perks based on brick type (excluding physical since it's guaranteed)
    const perkCategories = Object.keys(PERK_SYSTEM).filter(cat => cat !== 'physical');
    const numPerks = Math.floor(Math.random() * 2) + 1; // 1-2 additional perks per brick
    
    for (let i = 0; i < numPerks; i++) {
        const category = perkCategories[Math.floor(Math.random() * perkCategories.length)];
        const categoryPerks = PERK_SYSTEM[category];
        const perk = categoryPerks[Math.floor(Math.random() * categoryPerks.length)];
        
        perks.push({
            category: category.charAt(0).toUpperCase() + category.slice(1),
            name: perk.name,
            description: `Access to ${perk.name.toLowerCase()} benefits`,
            rarity: perk.rarity,
            value: perk.value
        });
    }
    
    return perks;
}

// Generate NFT metadata for a specific brick
function generateBrickMetadata(brickId, brickType, userAddress) {
    const perks = generateBrickPerks(brickType);
    
    // Base airdrop and discount rates based on brick type
    const baseRates = {
        regular: { airdrop: 100, discount: 10 },
        industrial: { airdrop: 250, discount: 15 },
        legendary: { airdrop: 500, discount: 20 }
    };
    
    const rates = baseRates[brickType];
    
    // Generate description based on brick type
    const descriptions = {
        regular: `You have successfully removed a 'REGULAR' brick from the Metabricks wall. Upon full destruction of the Metabricks wall, this will unlock the following perks and benefits across the OASIS ecosystem:`,
        industrial: `Congratulations! You have got your hands on an 'INDUSTRIAL' grade Metabrick from the Metabrick wall. This brick comes with the following enhanced perks and benefits, which activate upon full destruction of the wall.`,
        legendary: `CONGRATULATIONS!! You have found a Legendary grade Metabrick, the rarest brick type in Metabricks. Legendary bricks command the following high-tier perks, which activate upon destruction of the wall.`
    };

    // Add supporting message to all descriptions
    const supportingMessage = `\n\nBy holding this Metabrick you are supporting construction of Metaverse systems via OASISWEB4 - thank you for your service.`;
    
    const finalDescription = descriptions[brickType] + supportingMessage;

    return {
        name: `MetaBrick #${brickId}`,
        symbol: "MBRICK",
        description: finalDescription,
        image: BRICK_IMAGES[brickType],
        external_url: "https://metabricks.com",
        attributes: [
            {
                trait_type: "Type",
                value: brickType.charAt(0).toUpperCase() + brickType.slice(1)
            },
            {
                trait_type: "Base Airdrop Rate",
                value: rates.airdrop
            },
            {
                trait_type: "Base Discount Rate",
                value: `${rates.discount}%`
            }
        ],
        properties: {
            files: [
                {
                    type: "image/png",
                    uri: BRICK_IMAGES[brickType]
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
        // Hidden metadata for mystery box reveal
        hiddenMetadata: {
            perks: perks,
            rarity: brickType,
            airdropRate: rates.airdrop,
            discountRate: rates.discount,
            owner: userAddress,
            mintDate: new Date().toISOString()
        }
    };
}

// Upload metadata to Pinata
async function uploadMetadataToPinata(metadata) {
    try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pinata_api_key': PINATA_CONFIG.apiKey,
                'pinata_secret_api_key': PINATA_CONFIG.secretKey
            },
            body: JSON.stringify({
                pinataMetadata: {
                    name: metadata.name,
                    keyvalues: {
                        type: "metabrick",
                        rarity: metadata.hiddenMetadata.rarity
                    }
                },
                pinataContent: metadata
            })
        });
        
        if (!response.ok) {
            throw new Error(`Pinata upload failed: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        return {
            success: true,
            ipfsHash: result.IpfsHash,
            pinataUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
        };
    } catch (error) {
        console.error('Error uploading to Pinata:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Main function to process a brick purchase
async function processBrickPurchase(brickId, brickType, userAddress) {
    console.log(`Processing MetaBrick #${brickId} (${brickType}) for ${userAddress}`);
    
    try {
        // Generate metadata
        const metadata = generateBrickMetadata(brickId, brickType, userAddress);
        console.log('Generated metadata:', metadata.name);
        
        // Upload to Pinata
        const uploadResult = await uploadMetadataToPinata(metadata);
        
        if (uploadResult.success) {
            console.log('✅ Successfully uploaded to Pinata!');
            console.log('IPFS Hash:', uploadResult.ipfsHash);
            console.log('Pinata URL:', uploadResult.pinataUrl);
            
            return {
                success: true,
                brickId: brickId,
                brickType: brickType,
                metadata: metadata,
                ipfsHash: uploadResult.ipfsHash,
                pinataUrl: uploadResult.pinataUrl,
                userAddress: userAddress
            };
        } else {
            throw new Error(uploadResult.error);
        }
    } catch (error) {
        console.error('❌ Error processing brick purchase:', error);
        return {
            success: false,
            error: error.message,
            brickId: brickId,
            userAddress: userAddress
        };
    }
}

// Test the integration
async function testIntegration() {
    console.log('🧱 Testing MetaBricks Pinata Integration...\n');
    
    const testBrick = await processBrickPurchase(
        1, 
        'legendary', 
        '85ArqfA2fy8spGcMGsSW7cbEJAWj26vewmmoG2bwkgT9'
    );
    
    if (testBrick.success) {
        console.log('\n🎉 Integration test successful!');
        console.log('Your MetaBricks are ready to be minted!');
    } else {
        console.log('\n❌ Integration test failed:', testBrick.error);
    }
}

// Export functions for use in your backend
module.exports = {
    processBrickPurchase,
    generateBrickMetadata,
    uploadMetadataToPinata,
    testIntegration,
    PINATA_CONFIG,
    BRICK_IMAGES
};

// Run test if this file is executed directly
if (require.main === module) {
    testIntegration();
}
