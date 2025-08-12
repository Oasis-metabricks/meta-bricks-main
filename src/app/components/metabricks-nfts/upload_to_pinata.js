const fs = require('fs-extra');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');
require('dotenv').config();

// Pinata configuration
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_API_KEY;
const PINATA_BASE_URL = 'https://api.pinata.cloud';

// Check if Pinata credentials are available
if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    console.error('❌ Pinata API credentials not found!');
    console.log('Please create a .env file with:');
    console.log('PINATA_API_KEY=your_api_key_here');
    console.log('PINATA_SECRET_API_KEY=your_secret_key_here');
    process.exit(1);
}

// Upload file to Pinata
async function uploadToPinata(filePath, fileName) {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        
        const response = await fetch(`${PINATA_BASE_URL}/pinning/pinFileToIPFS`, {
            method: 'POST',
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY,
                ...formData.getHeaders()
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Pinata API error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        return result.IpfsHash;
    } catch (error) {
        console.error(`❌ Failed to upload ${fileName}:`, error.message);
        throw error;
    }
}

// Upload metadata to Pinata
async function uploadMetadata(metadataDir) {
    console.log('📤 Uploading metadata files to Pinata...');
    
    const metadataFiles = await fs.readdir(metadataDir);
    const metadataResults = {};
    
    for (const file of metadataFiles) {
        if (file.endsWith('.json')) {
            const filePath = path.join(metadataDir, file);
            const brickId = path.basename(file, '.json');
            
            try {
                console.log(`   📄 Uploading metadata for brick #${brickId}...`);
                const ipfsHash = await uploadToPinata(filePath, file);
                metadataResults[brickId] = ipfsHash;
                console.log(`   ✅ Brick #${brickId} metadata uploaded: ${ipfsHash}`);
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`   ❌ Failed to upload metadata for brick #${brickId}`);
                metadataResults[brickId] = null;
            }
        }
    }
    
    return metadataResults;
}

// Generate brick images (placeholder images for now)
async function generateBrickImages(imagesDir, totalBricks) {
    console.log('🎨 Generating brick images...');
    
    // For now, we'll create placeholder images
    // In a real scenario, you'd have actual brick artwork
    const imageTypes = ['regular', 'industrial', 'legendary'];
    const imageCounts = { regular: 20, industrial: 7, legendary: 3 };
    
    for (let i = 1; i <= totalBricks; i++) {
        // Determine brick type based on ID
        let brickType = 'regular';
        if (i > 360) brickType = 'industrial';
        if (i > 420) brickType = 'legendary';
        
        // Create a simple placeholder image path
        const imageIndex = (i - 1) % imageCounts[brickType];
        const imagePath = path.join(imagesDir, `${i}.png`);
        
        // For now, we'll just create a text file as a placeholder
        // In production, you'd have actual PNG images
        const placeholderContent = `MetaBrick #${i}\nType: ${brickType}\nImage: ${brickType}_${imageIndex}.png`;
        await fs.writeFile(imagePath, placeholderContent);
    }
    
    console.log(`   ✅ Generated ${totalBricks} placeholder images`);
}

// Upload images to Pinata
async function uploadImages(imagesDir) {
    console.log('🖼️  Uploading brick images to Pinata...');
    
    const imageFiles = await fs.readdir(imagesDir);
    const imageResults = {};
    
    for (const file of imageFiles) {
        if (file.endsWith('.png')) {
            const filePath = path.join(imagesDir, file);
            const brickId = path.basename(file, '.png');
            
            try {
                console.log(`   🖼️  Uploading image for brick #${brickId}...`);
                const ipfsHash = await uploadToPinata(filePath, file);
                imageResults[brickId] = ipfsHash;
                console.log(`   ✅ Brick #${brickId} image uploaded: ${ipfsHash}`);
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`   ❌ Failed to upload image for brick #${brickId}`);
                imageResults[brickId] = null;
            }
        }
    }
    
    return imageResults;
}

// Update metadata files with real IPFS hashes
async function updateMetadataWithHashes(metadataDir, imageResults) {
    console.log('🔄 Updating metadata with IPFS hashes...');
    
    const metadataFiles = await fs.readdir(metadataDir);
    
    for (const file of metadataFiles) {
        if (file.endsWith('.json')) {
            const filePath = path.join(metadataDir, file);
            const brickId = path.basename(file, '.json');
            
            try {
                const metadata = await fs.readJson(filePath);
                const imageHash = imageResults[brickId];
                
                if (imageHash) {
                    // Update image URL
                    metadata.image = `https://gateway.pinata.cloud/ipfs/${imageHash}/${brickId}.png`;
                    
                    // Update properties.files.uri
                    if (metadata.properties && metadata.properties.files) {
                        metadata.properties.files[0].uri = metadata.image;
                    }
                    
                    // Save updated metadata
                    await fs.writeJson(filePath, metadata, { spaces: 2 });
                    console.log(`   ✅ Updated metadata for brick #${brickId}`);
                }
            } catch (error) {
                console.error(`   ❌ Failed to update metadata for brick #${brickId}:`, error.message);
            }
        }
    }
}

// Generate upload summary
async function generateUploadSummary(metadataResults, imageResults, assetsDir) {
    const summary = {
        uploadDate: new Date().toISOString(),
        totalBricks: Object.keys(metadataResults).length,
        successfulMetadata: Object.values(metadataResults).filter(hash => hash !== null).length,
        successfulImages: Object.values(imageResults).filter(hash => hash !== null).length,
        metadataResults,
        imageResults,
        ipfsUrls: {}
    };
    
    // Generate IPFS URLs for each brick
    for (const [brickId, metadataHash] of Object.entries(metadataResults)) {
        if (metadataHash && imageResults[brickId]) {
            summary.ipfsUrls[brickId] = {
                metadata: `https://gateway.pinata.cloud/ipfs/${metadataHash}/${brickId}.json`,
                image: `https://gateway.pinata.cloud/ipfs/${imageResults[brickId]}/${brickId}.png`
            };
        }
    }
    
    const summaryPath = path.join(assetsDir, 'upload_summary.json');
    await fs.writeJson(summaryPath, summary, { spaces: 2 });
    
    console.log('\n📊 Upload Summary:');
    console.log(`   Total Bricks: ${summary.totalBricks}`);
    console.log(`   Metadata Uploaded: ${summary.successfulMetadata}/${summary.totalBricks}`);
    console.log(`   Images Uploaded: ${summary.successfulImages}/${summary.totalBricks}`);
    console.log(`   Upload Date: ${summary.uploadDate}`);
    
    return summary;
}

// Main upload function
async function mainUpload() {
    try {
        console.log('🚀 Starting MetaBricks upload to Pinata...');
        
        const assetsDir = path.join(__dirname, 'assets');
        const metadataDir = path.join(assetsDir, 'metadata');
        const imagesDir = path.join(assetsDir, 'images');
        
        // Check if assets exist
        if (!await fs.pathExists(assetsDir)) {
            console.error('❌ Assets directory not found! Please run "npm run generate" first.');
            process.exit(1);
        }
        
        // Generate images if they don't exist
        if (!await fs.pathExists(imagesDir) || (await fs.readdir(imagesDir)).length === 0) {
            await generateBrickImages(imagesDir, 432);
        }
        
        // Upload metadata
        const metadataResults = await uploadMetadata(metadataDir);
        
        // Upload images
        const imageResults = await uploadImages(imagesDir);
        
        // Update metadata with real IPFS hashes
        await updateMetadataWithHashes(metadataDir, imageResults);
        
        // Generate upload summary
        const summary = await generateUploadSummary(metadataResults, imageResults, assetsDir);
        
        console.log('\n🎉 Upload completed successfully!');
        console.log('\n🎯 Next steps:');
        console.log('   1. Check upload_summary.json for all IPFS hashes');
        console.log('   2. Update brickWallState.js with real metadata URIs');
        console.log('   3. Test the brick wall with real IPFS content');
        
        return summary;
        
    } catch (error) {
        console.error('❌ Upload failed:', error.message);
        process.exit(1);
    }
}

// Run the upload
if (require.main === module) {
    mainUpload().catch(console.error);
}

module.exports = { mainUpload };
