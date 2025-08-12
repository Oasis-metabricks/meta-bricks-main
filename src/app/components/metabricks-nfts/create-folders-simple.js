const fs = require('fs-extra');
const path = require('path');

// Create organized folder structure for MetaBricks
async function createOrganizedFolders() {
    const baseDir = path.join(__dirname, 'uploaded-metabricks');
    
    try {
        console.log('📁 Creating organized folder structure for MetaBricks...\n');
        
        // Create main directory
        await fs.ensureDir(baseDir);
        
        // Create subdirectories
        const folders = [
            '01-regular-bricks',
            '02-industrial-bricks', 
            '03-legendary-bricks',
            'metadata',
            'images',
            'upload-results'
        ];
        
        // Create all directories
        for (const folder of folders) {
            const folderPath = path.join(baseDir, folder);
            await fs.ensureDir(folderPath);
            console.log(`✅ Created: ${folder}/`);
        }
        
        // Create a simple README
        const readme = `# 🧱 MetaBricks Organization

## 📁 Folder Structure

- **01-regular-bricks/** - Regular brick metadata files
- **02-industrial-bricks/** - Industrial brick metadata files  
- **03-legendary-bricks/** - Legendary brick metadata files
- **metadata/** - All 432 JSON files in one place
- **images/** - Brick image references
- **upload-results/** - Upload logs and IPFS hashes

## 🎯 Usage

1. **For NFT Minting**: Use IPFS hashes from upload-results/
2. **By Brick Type**: Access specific brick types from their folders
3. **All Files**: Check metadata/ for complete collection

---
*Generated: ${new Date().toISOString()}*`;

        await fs.writeFile(path.join(baseDir, 'README.md'), readme);
        
        console.log('\n🎯 Folder Structure Created Successfully!');
        console.log('📁 uploaded-metabricks/');
        console.log('   ├── 01-regular-bricks/     (Regular brick metadata)');
        console.log('   ├── 02-industrial-bricks/  (Industrial brick metadata)');
        console.log('   ├── 03-legendary-bricks/   (Legendary brick metadata)');
        console.log('   ├── metadata/              (All JSON files)');
        console.log('   ├── images/                (Brick image references)');
        console.log('   ├── upload-results/        (Upload logs & results)');
        console.log('   └── README.md              (Documentation)');
        
        console.log('\n🚀 Ready to organize your MetaBricks!');
        
    } catch (error) {
        console.error('❌ Error creating folders:', error);
    }
}

// Run the function
if (require.main === module) {
    createOrganizedFolders();
}

module.exports = { createOrganizedFolders };
