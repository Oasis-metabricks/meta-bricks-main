const fs = require('fs');
const https = require('https');

// Function to make HTTPS request
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

// Function to sync Heroku data
async function syncHerokuData() {
    try {
        console.log('🔄 Syncing data from Heroku...');
        
        // Get bricks from Heroku
        const herokuBricks = await makeRequest('https://metabricks-backend-api-66e7d2abb038.herokuapp.com/bricks');
        console.log(`✅ Retrieved ${herokuBricks.bricks.length} bricks from Heroku`);
        
        // Get minted bricks from Heroku
        const herokuMinted = await makeRequest('https://metabricks-backend-api-66e7d2abb038.herokuapp.com/minted-bricks');
        console.log(`✅ Retrieved ${herokuMinted.minted.length} minted bricks from Heroku`);
        
        // Transform Heroku data to match local structure
        const transformedBricks = herokuBricks.bricks.map(brick => ({
            id: brick.id,
            type: brick.type,
            price: brick.price,
            sold: !brick.available,
            name: brick.name,
            seriesNumber: brick.id,
            mintPrice: `$${brick.price}`,
            image: `https://gateway.pinata.cloud/ipfs/bafybeifkewu2rzq7mhit3cw3lhnm3zdfn2c5ijx3zb4t56ued6g5i3msm4/${brick.type}_${brick.id % 20}.png`,
            metadataUri: brick.metadataUri,
            imageUrl: `https://gateway.pinata.cloud/ipfs/bafybeifkewu2rzq7mhit3cw3lhnm3zdfn2c5ijx3zb4t56ued6g5i3msm4/${brick.type}_${brick.id % 20}.png`,
            position: brick.position
        }));
        
        // Update the brickWallState.js file
        const brickWallStatePath = 'src/app/components/max-server/brickWallState.js';
        let brickWallStateContent = fs.readFileSync(brickWallStatePath, 'utf8');
        
        // Replace the generateAllBricks function with the synced data
        const newBricksArray = JSON.stringify(transformedBricks, null, 4);
        
        // Create a new generateAllBricks function that returns the synced data
        const newGenerateFunction = `// Generate all bricks from Heroku sync
function generateAllBricks() {
    return ${newBricksArray};
}`;
        
        // Replace the existing generateAllBricks function
        const functionRegex = /\/\/ Generate all bricks.*?function generateAllBricks\(\) \{[\s\S]*?\n\}/;
        brickWallStateContent = brickWallStateContent.replace(functionRegex, newGenerateFunction);
        
        // Write the updated content
        fs.writeFileSync(brickWallStatePath, brickWallStateContent);
        console.log('✅ Updated brickWallState.js with Heroku data');
        
        // Save the raw Heroku data for reference
        fs.writeFileSync('heroku_sync_data.json', JSON.stringify({
            bricks: herokuBricks,
            minted: herokuMinted,
            syncedAt: new Date().toISOString()
        }, null, 2));
        console.log('✅ Saved Heroku sync data to heroku_sync_data.json');
        
        console.log('🎉 Heroku data sync completed successfully!');
        
    } catch (error) {
        console.error('❌ Error syncing Heroku data:', error.message);
    }
}

// Run the sync
syncHerokuData();


