const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

// Pinata configuration
const PINATA_CONFIG = {
    apiKey: '1dc6c563e7dc75a613fb',
    secretKey: '60b8092d4447d11f2cf7e160c2c61e625eba6fd4ac5b1816de98a02dd59eaabc',
    jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmMTg4ODA1Ny0yZDRhLTQ1MzMtOWI4ZS0wZGMxYjEwNmM4YzMiLCJlbWFpbCI6Im1heC5nZXJzaGZpZWxkMUBnbWFpbC5jb20iLCJlbWFxYWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMiJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIiwidGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjFkYzZjNTYzZTdkYzc1YTYxM2ZiIiwic2NvcGVkS2V5U2VjcmV0IjoiNjBiODA5MmQ0NDQ3ZDExZjJjZjdlMTYwYzJjNjFlNjI1ZWJhNmZkNGFjNWIxODE2ZGU5OGEwMmRkNTllYWFkYyIsImV4cCI6MTc4NjUzNDU0NH0.564k1VU9XYgOTok3PvnyXg-Hgo4g0p4ZndOGLeZ7KWw'
};

// Brick image URLs (your existing Pinata hashes)
const BRICK_IMAGES = {
    regular: 'https://tomato-calm-flamingo-61.mypinata.cloud/ipfs/bafkreigqsyyi6qumiq544of4kzwfgffohvnvq36usivstvrfyw52u5qxf4?filename=regular_brick.png',
    industrial: 'https://tomato-calm-flamingo-61.mypinata.cloud/ipfs/bafybeia7dnclsgkjh6ugyzdzb3uivkydgozpmnbtpnnu4an3t2fta45ktm/industrial_brick.png',
    legendary: 'https://tomato-calm-flamingo-61.mypinata.cloud/ipfs/bafybeia7dnclsgkjh6ugyzdzb3uivkydgozpmnbtpnnu4an3t2fta45ktm/legendary_brick.png'
};

// Pinata API functions
class PinataAPI {
    constructor(config) {
        this.config = config;
        this.baseURL = 'https://api.pinata.cloud';
    }

    // Upload JSON metadata to Pinata
    async uploadJSON(metadata) {
        try {
            const response = await axios.post(
                `${this.baseURL}/pinning/pinJSONToIPFS`,
                metadata,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.jwt}`
                    }
                }
            );
            
            return {
                success: true,
                ipfsHash: response.data.IpfsHash,
                url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    // Upload file to Pinata
    async uploadFile(filePath) {
        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));
            
            const response = await axios.post(
                `${this.baseURL}/pinning/pinFileToIPFS`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.jwt}`,
                        ...formData.getHeaders()
                    }
                }
            );
            
            return {
                success: true,
                ipfsHash: response.data.IpfsHash,
                url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }
}

// Main upload function
async function uploadAllMetaBricks() {
    const pinata = new PinataAPI(PINATA_CONFIG);
    const metadataDir = path.join(__dirname, 'src', 'app', 'components', 'metabricks-nfts', 'assets', 'metadata');
    
    try {
        console.log('🚀 Starting MetaBricks upload to Pinata...\n');
        
        // Check if metadata directory exists
        if (!await fs.pathExists(metadataDir)) {
            console.log('❌ Metadata directory not found:', metadataDir);
            return;
        }
        
        // Get all JSON files
        const files = await fs.readdir(metadataDir);
        const jsonFiles = files.filter(file => file.endsWith('.json')).sort((a, b) => {
            const numA = parseInt(a.replace('.json', ''));
            const numB = parseInt(b.replace('.json', ''));
            return numA - numB;
        });
        
        console.log(`📁 Found ${jsonFiles.length} JSON files to upload\n`);
        
        let successCount = 0;
        let errorCount = 0;
        const uploadResults = [];
        
        // Process each JSON file
        for (const file of jsonFiles) {
            const filePath = path.join(metadataDir, file);
            const brickId = parseInt(file.replace('.json', ''));
            
            console.log(`🔄 Processing ${file} (Brick #${brickId})...`);
            
            try {
                // Read and parse the JSON
                const content = await fs.readFile(filePath, 'utf8');
                const metadata = JSON.parse(content);
                
                // Determine brick type from hiddenMetadata
                const brickType = metadata.hiddenMetadata?.type || 'regular';
                
                // Update the image URL to use the correct brick type
                metadata.image = BRICK_IMAGES[brickType];
                
                // Add upload timestamp and brick info
                metadata.uploadTimestamp = new Date().toISOString();
                metadata.brickId = brickId;
                metadata.brickType = brickType;
                
                // Upload to Pinata
                console.log(`   📤 Uploading to Pinata...`);
                const uploadResult = await pinata.uploadJSON(metadata);
                
                if (uploadResult.success) {
                    successCount++;
                    console.log(`   ✅ Upload successful! IPFS Hash: ${uploadResult.ipfsHash}`);
                    console.log(`   🔗 URL: ${uploadResult.url}`);
                    
                    uploadResults.push({
                        brickId,
                        brickType,
                        ipfsHash: uploadResult.ipfsHash,
                        url: uploadResult.url,
                        file: file
                    });
                    
                    // Add delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    errorCount++;
                    console.log(`   ❌ Upload failed: ${uploadResult.error}`);
                }
                
            } catch (error) {
                errorCount++;
                console.log(`   ❌ Processing failed: ${error.message}`);
            }
            
            console.log('');
        }
        
        // Summary
        console.log('📊 Upload Summary:');
        console.log(`✅ Successfully uploaded: ${successCount} files`);
        console.log(`❌ Failed to upload: ${errorCount} files`);
        console.log(`📁 Total files processed: ${jsonFiles.length}`);
        
        // Save upload results to file
        const resultsFile = path.join(__dirname, 'pinata-upload-results.json');
        await fs.writeFile(resultsFile, JSON.stringify(uploadResults, null, 2));
        console.log(`\n📝 Upload results saved to: ${resultsFile}`);
        
        // Show sample results
        if (uploadResults.length > 0) {
            console.log('\n🎯 Sample Upload Results:');
            uploadResults.slice(0, 5).forEach(result => {
                console.log(`• Brick #${result.brickId} (${result.brickType}): ${result.ipfsHash}`);
            });
            
            if (uploadResults.length > 5) {
                console.log(`   ... and ${uploadResults.length - 5} more`);
            }
        }
        
        // Show next steps
        console.log('\n🚀 Next Steps:');
        console.log('1. All MetaBricks are now on IPFS via Pinata');
        console.log('2. Each JSON is linked to the correct brick image');
        console.log('3. Use the IPFS hashes for your NFT minting');
        console.log('4. The verificationHash ensures authenticity');
        console.log('5. Ready for your MetaBricks wall launch!');
        
        if (errorCount === 0) {
            console.log('\n🎉 All MetaBricks successfully uploaded to Pinata!');
        } else {
            console.log('\n⚠️ Some uploads failed. Check the errors above.');
        }
        
    } catch (error) {
        console.error('❌ Error during upload process:', error);
    }
}

// Test Pinata connection
async function testPinataConnection() {
    const pinata = new PinataAPI(PINATA_CONFIG);
    
    console.log('🔗 Testing Pinata connection...\n');
    
    const testMetadata = {
        name: "Test MetaBrick",
        description: "Testing Pinata connection",
        timestamp: new Date().toISOString()
    };
    
    const result = await pinata.uploadJSON(testMetadata);
    
    if (result.success) {
        console.log('✅ Pinata connection successful!');
        console.log(`🔗 Test upload: ${result.url}`);
        console.log(`🔑 IPFS Hash: ${result.ipfsHash}`);
        console.log('\n🚀 Ready to upload MetaBricks!');
    } else {
        console.log('❌ Pinata connection failed:');
        console.log(`   Error: ${result.error}`);
        console.log('\n🔧 Please check your API keys and try again.');
    }
}

// Export functions
module.exports = {
    PinataAPI,
    uploadAllMetaBricks,
    testPinataConnection
};

// Run if executed directly
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--test')) {
        testPinataConnection();
    } else {
        uploadAllMetaBricks();
    }
}
