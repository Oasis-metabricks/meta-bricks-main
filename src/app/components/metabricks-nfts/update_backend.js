const fs = require('fs-extra');
const path = require('path');

// Paths
const ASSETS_DIR = path.join(__dirname, 'assets');
const BACKEND_DIR = path.join(__dirname, '../../max-server');
const UPLOAD_SUMMARY_PATH = path.join(ASSETS_DIR, 'upload_summary.json');

async function updateBackendBrickWallState() {
    try {
        console.log('🔄 Updating backend brickWallState.js with real IPFS hashes...');
        
        // Check if upload summary exists
        if (!await fs.pathExists(UPLOAD_SUMMARY_PATH)) {
            console.error('❌ Upload summary not found! Please run "npm run upload" first.');
            process.exit(1);
        }
        
        // Read upload summary
        const uploadSummary = await fs.readJson(UPLOAD_SUMMARY_PATH);
        console.log(`📊 Found upload summary for ${uploadSummary.totalBricks} bricks`);
        
        // Read current backend brickWallState.js
        const backendBrickWallPath = path.join(BACKEND_DIR, 'brickWallState.js');
        if (!await fs.pathExists(backendBrickWallPath)) {
            console.error('❌ Backend brickWallState.js not found!');
            process.exit(1);
        }
        
        let brickWallContent = await fs.readFile(backendBrickWallPath, 'utf8');
        
        // Update the generateAllBricks function with real IPFS hashes
        console.log('📝 Updating brickWallState.js...');
        
        // Create updated brick data
        const updatedBricks = [];
        for (let i = 1; i <= uploadSummary.totalBricks; i++) {
            const brickId = i.toString();
            const metadataHash = uploadSummary.metadataResults[brickId];
            const imageHash = uploadSummary.imageResults[brickId];
            
            if (metadataHash && imageHash) {
                // Determine brick type and price
                let brickType = 'regular';
                let price = 10;
                if (i > 360) {
                    brickType = 'industrial';
                    price = 25;
                }
                if (i > 420) {
                    brickType = 'legendary';
                    price = 100;
                }
                
                updatedBricks.push({
                    id: i,
                    type: brickType,
                    price: price,
                    sold: false,
                    name: `MetaBrick #${i}`,
                    seriesNumber: i,
                    mintPrice: `$${price}`,
                    image: `https://gateway.pinata.cloud/ipfs/${imageHash}/${i}.png`,
                    metadataUri: `https://gateway.pinata.cloud/ipfs/${metadataHash}/${i}.json`,
                    imageUrl: `https://gateway.pinata.cloud/ipfs/${imageHash}/${i}.png`,
                    position: {
                        row: Math.floor((i - 1) / 24),
                        col: (i - 1) % 24
                    }
                });
            }
        }
        
        // Generate the new generateAllBricks function content
        const newBricksArray = JSON.stringify(updatedBricks, null, 4);
        
        // Replace the generateAllBricks function
        const functionStart = 'function generateAllBricks() {';
        const functionEnd = '    return bricks;';
        
        const newFunctionContent = `function generateAllBricks() {
    const bricks = ${newBricksArray};
    return bricks;
}`;
        
        // Find and replace the function
        const functionRegex = /function generateAllBricks\(\) \{[\s\S]*?return bricks;\s*\}/;
        if (functionRegex.test(brickWallContent)) {
            brickWallContent = brickWallContent.replace(functionRegex, newFunctionContent);
            console.log('✅ Updated generateAllBricks function');
        } else {
            console.error('❌ Could not find generateAllBricks function in brickWallState.js');
            process.exit(1);
        }
        
        // Write updated content back to file
        await fs.writeFile(backendBrickWallPath, brickWallContent, 'utf8');
        console.log('💾 Updated brickWallState.js successfully');
        
        // Create a backup of the original
        const backupPath = path.join(BACKEND_DIR, 'brickWallState.js.backup');
        await fs.copy(backendBrickWallPath, backupPath);
        console.log('💾 Created backup: brickWallState.js.backup');
        
        // Generate updated brick wall state JSON for frontend
        const frontendBrickWallPath = path.join(ASSETS_DIR, 'updated_brickWallState.json');
        await fs.writeJson(frontendBrickWallPath, updatedBricks, { spaces: 2 });
        console.log('💾 Created updated frontend brick wall state');
        
        console.log('\n🎉 Backend update completed successfully!');
        console.log('\n🎯 Next steps:');
        console.log('   1. Restart your backend server');
        console.log('   2. Test the brick wall with real IPFS content');
        console.log('   3. Verify all bricks are displaying correctly');
        
        return updatedBricks;
        
    } catch (error) {
        console.error('❌ Failed to update backend:', error.message);
        process.exit(1);
    }
}

// Run the update
if (require.main === module) {
    updateBackendBrickWallState().catch(console.error);
}

module.exports = { updateBackendBrickWallState };

