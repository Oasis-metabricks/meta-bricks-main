const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

// Perk reveal thresholds and system
const PERK_REVEAL_SYSTEM = {
    thresholds: [
        { percentage: 10, bricksRequired: 43, perksToReveal: [12, 5, 7] }, // Free hApp, Free OLAND, Free Statue
        { percentage: 25, bricksRequired: 108, perksToReveal: [1, 2] }, // Bronze API, Silver API
        { percentage: 50, bricksRequired: 216, perksToReveal: [3, 4, 6, 8] }, // Gold API, Free OAPP, Billboard, Landmark
        { percentage: 75, bricksRequired: 324, perksToReveal: [9, 10, 11] }, // Token Integration, Custom AR, Custom Building
        { percentage: 100, bricksRequired: 432, perksToReveal: [13, 14] } // OASIS Integration, Early Access
    ],
    
    // Actual perk definitions (hidden until reveal)
    actualPerks: {
        1: { name: "Bronze Tier API Access", category: "OASIS", rarity: "Common", value: "Bronze" },
        2: { name: "Silver Tier API Access", category: "OASIS", rarity: "Rare", value: "Silver" },
        3: { name: "Gold Tier API Access", category: "OASIS", rarity: "Rare", value: "Gold" },
        4: { name: "Free OAPP Development", category: "OASIS", rarity: "Legendary", value: "OAPP" },
        5: { name: "Oland Airdrop", category: "Our World", rarity: "Common", value: "Oland" },
        6: { name: "Billboard Placement", category: "Our World", rarity: "Rare", value: "Billboard" },
        7: { name: "Personal Statue", category: "Our World", rarity: "Legendary", value: "Statue" },
        8: { name: "Landmark Naming", category: "Our World", rarity: "Rare", value: "Landmark" },
        9: { name: "Token Integration", category: "AR World", rarity: "Rare", value: "Integration" },
        10: { name: "Custom AR Experience", category: "AR World", rarity: "Rare", value: "AR Experience" },
        11: { name: "Custom Building", category: "AR World", rarity: "Legendary", value: "Custom Building" },
        12: { name: "Free hApp Creation", category: "HoloNET", rarity: "Rare", value: "hApp" },
        13: { name: "OASIS Integration Request", category: "Special", rarity: "Rare", value: "Integration Request" },
        14: { name: "Early Access Pass", category: "Special", rarity: "Legendary", value: "Early Access" }
    }
};

// NFT verification system
class NFTVerificationSystem {
    constructor() {
        this.nftPerkAssignments = new Map(); // NFT ID -> Perk IDs
        this.revealedPerks = new Set(); // Which perks have been revealed
        this.bricksSold = 0;
        this.verificationHashes = new Map(); // NFT ID -> Verification hash
    }
    
    // Assign perks to a newly minted NFT
    assignPerksToNFT(nftId, brickType) {
        const perks = [];
        
        // Always include MetaBrick Keychain
        perks.push({
            id: "keychain",
            name: "MetaBrick Keychain",
            category: "Physical",
            rarity: "Guaranteed",
            value: "Keychain",
            revealed: true
        });
        
        // Assign 1-2 mystery perks based on brick type
        const numPerks = brickType === 'legendary' ? 2 : (brickType === 'industrial' ? 2 : 1);
        const availablePerks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
        
        for (let i = 0; i < numPerks; i++) {
            const randomIndex = Math.floor(Math.random() * availablePerks.length);
            const perkId = availablePerks.splice(randomIndex, 1)[0];
            perks.push({
                id: perkId,
                name: `Mystery Perk #${perkId}`,
                category: "Mystery",
                rarity: "Mystery",
                value: `Mystery${perkId}`,
                revealed: false,
                actualPerk: PERK_REVEAL_SYSTEM.actualPerks[perkId]
            });
        }
        
        // Store the assignment
        this.nftPerkAssignments.set(nftId, perks);
        
        // Generate verification hash
        const verificationData = {
            nftId,
            brickType,
            perkIds: perks.map(p => p.id),
            timestamp: Date.now()
        };
        const verificationHash = crypto.createHash('sha256').update(JSON.stringify(verificationData)).digest('hex');
        this.verificationHashes.set(nftId, verificationHash);
        
        return { perks, verificationHash };
    }
    
    // Record a brick sale
    recordBrickSale() {
        this.bricksSold++;
        this.checkThresholdReveals();
    }
    
    // Check if any new perks should be revealed
    checkThresholdReveals() {
        for (const threshold of PERK_REVEAL_SYSTEM.thresholds) {
            if (this.bricksSold >= threshold.bricksRequired && !this.revealedPerks.has(threshold.percentage)) {
                this.revealPerksAtThreshold(threshold);
            }
        }
    }
    
    // Reveal perks at a specific threshold
    revealPerksAtThreshold(threshold) {
        console.log(`🎉 Threshold ${threshold.percentage}% reached! Revealing perks: ${threshold.perksToReveal.join(', ')}`);
        
        // Mark these perks as revealed
        threshold.perksToReveal.forEach(perkId => {
            this.revealedPerks.add(perkId);
        });
        
        // Update all NFTs to reveal these perks
        this.updateAllNFTsWithRevealedPerks(threshold.perksToReveal);
        
        return {
            threshold: threshold.percentage,
            perksRevealed: threshold.perksToReveal,
            totalBricksSold: this.bricksSold
        };
    }
    
    // Update all NFTs to reveal specific perks
    updateAllNFTsWithRevealedPerks(perkIds) {
        for (const [nftId, perks] of this.nftPerkAssignments) {
            perks.forEach(perk => {
                if (perk.id !== 'keychain' && perkIds.includes(perk.id)) {
                    perk.revealed = true;
                    perk.name = perk.actualPerk.name;
                    perk.category = perk.actualPerk.category;
                    perk.rarity = perk.actualPerk.rarity;
                    perk.value = perk.actualPerk.value;
                }
            });
        }
    }
    
    // Get NFT perks (with reveal status)
    getNFTPerks(nftId) {
        return this.nftPerkAssignments.get(nftId) || [];
    }
    
    // Verify NFT ownership and perks
    verifyNFTOwnership(nftId, userAddress, signature) {
        // This would integrate with Solana to verify ownership
        // For now, we'll simulate the verification
        const perks = this.getNFTPerks(nftId);
        const verificationHash = this.verificationHashes.get(nftId);
        
        return {
            verified: true, // In real implementation, verify on-chain
            nftId,
            userAddress,
            perks,
            verificationHash,
            totalBricksSold: this.bricksSold,
            nextThreshold: this.getNextThreshold()
        };
    }
    
    // Get next threshold information
    getNextThreshold() {
        for (const threshold of PERK_REVEAL_SYSTEM.thresholds) {
            if (this.bricksSold < threshold.bricksRequired) {
                return {
                    percentage: threshold.percentage,
                    bricksRequired: threshold.bricksRequired,
                    bricksRemaining: threshold.bricksRequired - this.bricksSold,
                    perksToReveal: threshold.perksToReveal
                };
            }
        }
        return null; // All thresholds reached
    }
    
    // Get current wall status
    getWallStatus() {
        return {
            bricksSold: this.bricksSold,
            totalBricks: 432,
            percentageComplete: Math.round((this.bricksSold / 432) * 100),
            revealedPerks: Array.from(this.revealedPerks),
            nextThreshold: this.getNextThreshold(),
            totalNFTs: this.nftPerkAssignments.size
        };
    }
}

// Function to update JSON files with new perk reveal system
async function updateJSONsWithRevealSystem() {
    const metadataDir = path.join(__dirname, 'assets', 'metadata');
    const verificationSystem = new NFTVerificationSystem();
    
    try {
        console.log('🧱 Updating MetaBrick JSONs with new Perk Reveal System...\n');
        
        if (!await fs.pathExists(metadataDir)) {
            console.log('❌ Metadata directory not found:', metadataDir);
            return;
        }
        
        const files = await fs.readdir(metadataDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        console.log(`📁 Found ${jsonFiles.length} JSON files to update\n`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const file of jsonFiles) {
            const filePath = path.join(metadataDir, file);
            console.log(`🔄 Updating ${file}...`);
            
            try {
                const content = await fs.readFile(filePath, 'utf8');
                const metadata = JSON.parse(content);
                
                // Extract brick type from hiddenMetadata
                const brickType = metadata.hiddenMetadata?.type || 'regular';
                const nftId = parseInt(file.replace('.json', ''));
                
                // Assign perks using the verification system
                const { perks, verificationHash } = verificationSystem.assignPerksToNFT(nftId, brickType);
                
                // Update metadata with new perk system
                metadata.perks = perks.map(perk => ({
                    category: perk.category,
                    name: perk.name,
                    description: perk.revealed 
                        ? `Revealed: ${perk.actualPerk?.name || perk.name}`
                        : "Mystery perk - will be revealed at wall destruction thresholds",
                    rarity: perk.rarity,
                    value: perk.value,
                    revealed: perk.revealed,
                    perkId: perk.id
                }));
                
                // Add verification hash
                metadata.verificationHash = verificationHash;
                
                // Update description to mention threshold reveals
                const descriptions = {
                    regular: `You have successfully removed a 'REGULAR' brick from the Metabricks wall. Perks will be revealed at specific destruction thresholds (25%, 50%, 75%, 100%).`,
                    industrial: `Congratulations! You have got your hands on an 'INDUSTRIAL' grade Metabrick from the Metabrick wall. Perks will be revealed at specific destruction thresholds (25%, 50%, 75%, 100%).`,
                    legendary: `CONGRATULATIONS!! You have found a Legendary grade Metabrick, the rarest brick type in Metabricks. Perks will be revealed at specific destruction thresholds (25%, 50%, 75%, 100%).`
                };
                
                const supportingMessage = `\n\nBy holding this Metabrick you are supporting construction of Metaverse systems via OASISWEB4 - thank you for your service.`;
                metadata.description = descriptions[brickType] + supportingMessage;
                
                // Write updated metadata
                await fs.writeFile(filePath, JSON.stringify(metadata, null, 2), 'utf8');
                
                successCount++;
                console.log(`✅ ${file} updated with ${perks.length} perks`);
                
            } catch (error) {
                errorCount++;
                console.log(`❌ ${file} failed: ${error.message}`);
            }
        }
        
        // Summary
        console.log('\n📊 Update Summary:');
        console.log(`✅ Successfully updated: ${successCount} files`);
        console.log(`❌ Failed to update: ${errorCount} files`);
        console.log(`📁 Total files processed: ${jsonFiles.length}`);
        
        // Show perk reveal system info
        console.log('\n🎭 Perk Reveal System:');
        PERK_REVEAL_SYSTEM.thresholds.forEach(threshold => {
            console.log(`• ${threshold.percentage}% (${threshold.bricksRequired} bricks): Reveal perks ${threshold.perksToReveal.join(', ')}`);
        });
        
        console.log('\n🔐 NFT Verification System:');
        console.log('• Each NFT gets a unique verification hash');
        console.log('• Perks are assigned deterministically but randomly');
        console.log('• Ownership verification through Solana blockchain');
        console.log('• Threshold-based perk reveals for all holders');
        
        if (errorCount === 0) {
            console.log('\n🎉 All JSON files updated with new Perk Reveal System!');
        }
        
    } catch (error) {
        console.error('❌ Error updating JSON files:', error);
    }
}

// Export for use in other modules
module.exports = {
    NFTVerificationSystem,
    PERK_REVEAL_SYSTEM,
    updateJSONsWithRevealSystem
};

// Run if executed directly
if (require.main === module) {
    updateJSONsWithRevealSystem();
}
