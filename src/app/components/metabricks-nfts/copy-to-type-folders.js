const fs = require('fs-extra');
const path = require('path');

// Copy MetaBrick files to their respective type folders
async function copyToTypeFolders() {
    const metadataDir = path.join(__dirname, 'assets', 'metadata');
    const organizedDir = path.join(__dirname, 'uploaded-metabricks');
    
    try {
        console.log('📁 Copying MetaBrick files to type-specific folders...\n');
        
        if (!await fs.pathExists(metadataDir)) {
            console.log('❌ Metadata directory not found');
            return;
        }
        
        // Get all JSON files
        const files = await fs.readdir(metadataDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        let regularCount = 0;
        let industrialCount = 0;
        let legendaryCount = 0;
        
        for (const file of jsonFiles) {
            const filePath = path.join(metadataDir, file);
            const content = await fs.readFile(filePath, 'utf8');
            const metadata = JSON.parse(content);
            
            // Determine brick type
            const brickType = metadata.hiddenMetadata?.type || 'regular';
            
            // Copy to appropriate directory
            let targetDir;
            switch (brickType) {
                case 'regular':
                    targetDir = path.join(organizedDir, '01-regular-bricks');
                    regularCount++;
                    break;
                case 'industrial':
                    targetDir = path.join(organizedDir, '02-industrial-bricks');
                    industrialCount++;
                    break;
                case 'legendary':
                    targetDir = path.join(organizedDir, '03-legendary-bricks');
                    legendaryCount++;
                    break;
                default:
                    targetDir = path.join(organizedDir, '01-regular-bricks');
                    regularCount++;
            }
            
            const targetFile = path.join(targetDir, file);
            await fs.copy(filePath, targetFile);
        }
        
        console.log('✅ Files copied to type-specific folders!');
        console.log(`📊 Distribution:`);
        console.log(`   • Regular Bricks: ${regularCount} files`);
        console.log(`   • Industrial Bricks: ${industrialCount} files`);
        console.log(`   • Legendary Bricks: ${legendaryCount} files`);
        console.log(`   • Total: ${regularCount + industrialCount + legendaryCount} files`);
        
        // Create a summary file
        const summary = {
            total: regularCount + industrialCount + legendaryCount,
            regular: regularCount,
            industrial: industrialCount,
            legendary: legendaryCount,
            timestamp: new Date().toISOString()
        };
        
        await fs.writeFile(path.join(organizedDir, 'brick-summary.json'), JSON.stringify(summary, null, 2));
        console.log('\n📝 Summary saved to brick-summary.json');
        
    } catch (error) {
        console.error('❌ Error copying files:', error);
    }
}

// Run the function
if (require.main === module) {
    copyToTypeFolders();
}

module.exports = { copyToTypeFolders };
