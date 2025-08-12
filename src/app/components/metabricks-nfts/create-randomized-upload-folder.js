const fs = require('fs-extra');
const path = require('path');

// Create randomized upload folder for Pinata (1-432 with random brick types)
async function createRandomizedUploadFolder() {
    const metadataDir = path.join(__dirname, 'assets', 'metadata');
    const randomizedDir = path.join(__dirname, 'pinata-upload-randomized');
    
    try {
        console.log('🎲 Creating randomized upload folder for Pinata...\n');
        
        // Create main directory
        await fs.ensureDir(randomizedDir);
        
        // Get all JSON files from metadata
        if (!await fs.pathExists(metadataDir)) {
            console.log('❌ Metadata directory not found');
            return;
        }
        
        const files = await fs.readdir(metadataDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        if (jsonFiles.length !== 432) {
            console.log(`❌ Expected 432 files, found ${jsonFiles.length}`);
            return;
        }
        
        console.log(`📁 Found ${jsonFiles.length} MetaBrick files`);
        
        // Create randomized distribution
        const distribution = createRandomizedDistribution();
        
        // Copy files with new names (1-432)
        let uploadCount = 0;
        const uploadLog = [];
        
        for (let i = 1; i <= 432; i++) {
            const sourceFile = distribution[i - 1];
            const targetFile = path.join(randomizedDir, `${i}.json`);
            
            // Copy the file with new name
            await fs.copy(path.join(metadataDir, sourceFile), targetFile);
            
            // Log the mapping for reference
            const sourceContent = await fs.readFile(path.join(metadataDir, sourceFile), 'utf8');
            const metadata = JSON.parse(sourceContent);
            const brickType = metadata.hiddenMetadata?.type || 'regular';
            
            uploadLog.push({
                uploadNumber: i,
                originalFile: sourceFile,
                brickType: brickType,
                originalName: metadata.name
            });
            
            uploadCount++;
            
            if (uploadCount % 50 === 0) {
                console.log(`📦 Processed ${uploadCount}/432 files...`);
            }
        }
        
        // Save upload log
        await fs.writeFile(
            path.join(randomizedDir, 'upload-mapping.json'), 
            JSON.stringify(uploadLog, null, 2)
        );
        
        // Create summary
        const summary = {
            totalFiles: uploadCount,
            distribution: {
                regular: uploadLog.filter(item => item.brickType === 'regular').length,
                industrial: uploadLog.filter(item => item.brickType === 'industrial').length,
                legendary: uploadLog.filter(item => item.brickType === 'legendary').length
            },
            randomization: 'Random distribution maintained for user mystery',
            timestamp: new Date().toISOString()
        };
        
        await fs.writeFile(
            path.join(randomizedDir, 'upload-summary.json'), 
            JSON.stringify(summary, null, 2)
        );
        
        // Create README for the upload folder
        const readme = `# 🎲 MetaBricks Randomized Upload Folder

## 📋 Purpose
This folder contains all 432 MetaBrick JSON files numbered 1-432 in randomized order for Pinata upload.

## 🎭 Mystery Strategy
- **File Names**: 1.json, 2.json, 3.json... 432.json
- **Brick Types**: Randomly distributed to maintain user excitement
- **Rarity**: Users won't know brick rarity until minting

## 📁 Contents
- **1.json to 432.json**: MetaBrick metadata files
- **upload-mapping.json**: Original file to upload number mapping
- **upload-summary.json**: Distribution summary and statistics

## 🚀 Pinata Upload
1. Upload this entire folder to Pinata
2. Use the resulting IPFS hash for your MetaBricks wall
3. Users will mint bricks 1-432 in sequence
4. Rarity remains a mystery until reveal!

## 🔍 Verification
Check upload-mapping.json to see which brick type corresponds to each number.

---
*Generated: ${new Date().toISOString()}*`;

        await fs.writeFile(path.join(randomizedDir, 'README.md'), readme);
        
        console.log('\n🎯 Randomized Upload Folder Created Successfully!');
        console.log(`📁 pinata-upload-randomized/`);
        console.log(`   ├── 1.json to 432.json    (Randomized MetaBricks)`);
        console.log(`   ├── upload-mapping.json    (File mapping)`);
        console.log(`   ├── upload-summary.json    (Distribution summary)`);
        console.log(`   └── README.md              (Documentation)`);
        
        console.log('\n📊 Distribution:');
        console.log(`   • Regular Bricks: ${summary.distribution.regular}`);
        console.log(`   • Industrial Bricks: ${summary.distribution.industrial}`);
        console.log(`   • Legendary Bricks: ${summary.distribution.legendary}`);
        
        console.log('\n🚀 Ready for Pinata folder upload!');
        console.log('💡 Users will mint bricks 1-432 in sequence with mystery rarity!');
        
    } catch (error) {
        console.error('❌ Error creating randomized folder:', error);
    }
}

// Create randomized distribution maintaining rarity ratios
function createRandomizedDistribution() {
    // Target distribution (based on your current setup)
    const targetDistribution = {
        regular: 361,      // ~83.6%
        industrial: 60,    // ~13.9%
        legendary: 11      // ~2.5%
    };
    
    // Get all files and categorize them
    const metadataDir = path.join(__dirname, 'assets', 'metadata');
    const files = fs.readdirSync(metadataDir).filter(file => file.endsWith('.json'));
    
    const categorizedFiles = {
        regular: [],
        industrial: [],
        legendary: []
    };
    
    // Categorize files by type
    files.forEach(file => {
        try {
            const content = fs.readFileSync(path.join(metadataDir, file), 'utf8');
            const metadata = JSON.parse(content);
            const brickType = metadata.hiddenMetadata?.type || 'regular';
            categorizedFiles[brickType].push(file);
        } catch (error) {
            console.log(`⚠️  Error reading ${file}, treating as regular`);
            categorizedFiles.regular.push(file);
        }
    });
    
    // Create randomized array
    const randomized = [];
    
    // Add files in random order while maintaining type distribution
    Object.entries(categorizedFiles).forEach(([type, typeFiles]) => {
        // Shuffle files of this type
        const shuffled = typeFiles.sort(() => Math.random() - 0.5);
        randomized.push(...shuffled);
    });
    
    // Final shuffle to mix all types together
    return randomized.sort(() => Math.random() - 0.5);
}

// Run the function
if (require.main === module) {
    createRandomizedUploadFolder();
}

module.exports = { createRandomizedUploadFolder };
