const { NFTVerificationSystem, PERK_REVEAL_SYSTEM } = require('./perk-reveal-system');

// Demo the verification system
function demoVerificationSystem() {
    console.log('🧱 MetaBricks NFT Verification & Perk Reveal System Demo\n');
    
    // Initialize the verification system
    const verificationSystem = new NFTVerificationSystem();
    
    console.log('🎭 Perk Reveal Thresholds:');
    PERK_REVEAL_SYSTEM.thresholds.forEach(threshold => {
        console.log(`• ${threshold.percentage}% (${threshold.bricksRequired} bricks): Reveal perks ${threshold.perksToReveal.join(', ')}`);
    });
    
    console.log('\n🔐 NFT Verification Process:');
    console.log('1. User purchases brick on MetaBricks wall');
    console.log('2. System assigns random perks + generates verification hash');
    console.log('3. NFT is minted with hidden perk data');
    console.log('4. Perks revealed at thresholds for ALL holders');
    console.log('5. Ownership verified on-chain before perk redemption\n');
    
    // Simulate some NFT minting
    console.log('📱 Simulating NFT Minting Process:\n');
    
    const nftIds = [1, 50, 100, 200, 300, 432];
    const brickTypes = ['regular', 'industrial', 'legendary', 'regular', 'industrial', 'legendary'];
    
    nftIds.forEach((nftId, index) => {
        const brickType = brickTypes[index];
        console.log(`🆔 Minting NFT #${nftId} (${brickType.toUpperCase()})...`);
        
        const { perks, verificationHash } = verificationSystem.assignPerksToNFT(nftId, brickType);
        
        console.log(`   ✅ Perks assigned: ${perks.length} total`);
        console.log(`   🔑 Verification Hash: ${verificationHash.substring(0, 16)}...`);
        console.log(`   🎁 Perks:`);
        perks.forEach(perk => {
            if (perk.id === 'keychain') {
                console.log(`      • ${perk.name} (${perk.rarity}) - ${perk.revealed ? 'REVEALED' : 'HIDDEN'}`);
            } else {
                console.log(`      • ${perk.name} (${perk.rarity}) - ${perk.revealed ? 'REVEALED' : 'HIDDEN'}`);
            }
        });
        console.log('');
    });
    
    // Simulate brick sales and perk reveals
    console.log('🛒 Simulating Brick Sales & Perk Reveals:\n');
    
    const salesSimulation = [25, 43, 75, 108, 150, 216, 250, 324, 350, 432];
    
    salesSimulation.forEach(bricksSold => {
        console.log(`📈 Brick Sale #${bricksSold}...`);
        
        // Record multiple sales to reach this number
        const currentBricks = verificationSystem.bricksSold;
        const salesNeeded = bricksSold - currentBricks;
        
        for (let i = 0; i < salesNeeded; i++) {
            verificationSystem.recordBrickSale();
        }
        
        const status = verificationSystem.getWallStatus();
        console.log(`   🧱 Total bricks sold: ${status.bricksSold}`);
        console.log(`   📊 Wall completion: ${status.percentageComplete}%`);
        
        if (status.nextThreshold) {
            console.log(`   🎯 Next threshold: ${status.nextThreshold.percentage}% (${status.nextThreshold.bricksRemaining} bricks remaining)`);
            console.log(`   🎁 Perks to reveal: ${status.nextThreshold.perksToReveal.join(', ')}`);
        } else {
            console.log(`   🎉 All thresholds reached! All perks revealed!`);
        }
        
        if (status.revealedPerks.length > 0) {
            console.log(`   ✨ Currently revealed perks: ${status.revealedPerks.join(', ')}`);
        }
        console.log('');
    });
    
    // Show final NFT perk status
    console.log('🎭 Final NFT Perk Status:\n');
    
    nftIds.forEach(nftId => {
        const perks = verificationSystem.getNFTPerks(nftId);
        console.log(`🆔 NFT #${nftId}:`);
        perks.forEach(perk => {
            if (perk.revealed) {
                console.log(`   ✅ ${perk.name} (${perk.category}) - ${perk.rarity}`);
            } else {
                console.log(`   ❓ ${perk.name} (${perk.category}) - ${perk.rarity}`);
            }
        });
        console.log('');
    });
    
    // Demonstrate verification process
    console.log('🔍 NFT Ownership Verification Demo:\n');
    
    nftIds.slice(0, 3).forEach(nftId => {
        console.log(`🔐 Verifying NFT #${nftId}...`);
        
        const verification = verificationSystem.verifyNFTOwnership(
            nftId, 
            `user_${nftId}_address`, 
            `signature_${nftId}`
        );
        
        console.log(`   ✅ Verification: ${verification.verified ? 'SUCCESS' : 'FAILED'}`);
        console.log(`   👤 User: ${verification.userAddress}`);
        console.log(`   🔑 Hash: ${verification.verificationHash.substring(0, 16)}...`);
        console.log(`   🎁 Perks: ${verification.perks.length} total`);
        console.log(`   🧱 Wall Progress: ${verification.totalBricksSold}/432 bricks`);
        
        if (verification.nextThreshold) {
            console.log(`   🎯 Next reveal at: ${verification.nextThreshold.percentage}%`);
        }
        console.log('');
    });
    
    // Show how perks are revealed at thresholds
    console.log('🎉 Perk Reveal Timeline:\n');
    console.log('📅 Week 1: First 43 bricks sold → 10% threshold reached');
    console.log('   🎁 Reveals: 🚀 FREE hApp Creation, 🪙 FREE OLAND Airdrop, 🗽 FREE Statue in Our World');
    console.log('');
    console.log('📅 Week 2: Next 65 bricks sold → 25% threshold reached');
    console.log('   🎁 Reveals: Bronze Tier API, Silver Tier API');
    console.log('');
    console.log('📅 Week 3-4: Next 108 bricks sold → 50% threshold reached');
    console.log('   🎁 Reveals: Gold Tier API, Free OAPP Development, Billboard Placement, Landmark Naming');
    console.log('');
    console.log('📅 Week 5-6: Next 108 bricks sold → 75% threshold reached');
    console.log('   🎁 Reveals: Token Integration, Custom AR Experience, Custom Building');
    console.log('');
    console.log('📅 Week 7-8: Final 108 bricks sold → 100% threshold reached');
    console.log('   🎁 Reveals: OASIS Integration Request, Early Access Pass');
    console.log('');
    
    console.log('🚀 Benefits of This System:');
    console.log('• 🎭 Maximum hype: Perks revealed gradually');
    console.log('• 🔐 Secure: Each NFT has unique verification hash');
    console.log('• ⚡ Fair: All holders get same perks at same time');
    console.log('• 📈 Engagement: Users track wall progress');
    console.log('• 💎 Value: Perks become more valuable as they\'re revealed');
    console.log('• 🎯 Marketing: Each threshold is a milestone to celebrate');
}

// Run the demo
if (require.main === module) {
    demoVerificationSystem();
}

module.exports = { demoVerificationSystem };
