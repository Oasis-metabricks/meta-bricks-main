const fs = require('fs-extra');
const path = require('path');

// New descriptions for each brick type
const NEW_DESCRIPTIONS = {
    regular: `You have successfully removed a 'REGULAR' brick from the Metabricks wall. Upon full destruction of the Metabricks wall, this will unlock the following perks and benefits across the OASIS ecosystem:`,
    industrial: `Congratulations! You have got your hands on an 'INDUSTRIAL' grade Metabrick from the Metabrick wall. This brick comes with the following enhanced perks and benefits, which activate upon full destruction of the wall.`,
    legendary: `CONGRATULATIONS!! You have found a Legendary grade Metabrick, the rarest brick type in Metabricks. Legendary bricks command the following high-tier perks, which activate upon destruction of the wall.`
};

// Supporting message to add to all bricks
const SUPPORTING_MESSAGE = `\n\nBy holding this Metabrick you are supporting construction of Metaverse systems via OASISWEB4 - thank you for your service.`;

// Function to determine brick type from hiddenMetadata
function getBrickType(metadata) {
    if (metadata.hiddenMetadata && metadata.hiddenMetadata.type) {
        return metadata.hiddenMetadata.type;
    }
    
    // Fallback: check if it's a regular brick (most common)
    return 'regular';
}

// Function to update a single JSON file
async function updateJsonFile(filePath) {
    try {
        // Read the JSON file
        const content = await fs.readFile(filePath, 'utf8');
        const metadata = JSON.parse(content);
        
        // Get the brick type
        const brickType = getBrickType(metadata);
        
        // Create the new description
        const newDescription = NEW_DESCRIPTIONS[brickType] + SUPPORTING_MESSAGE;
        
        // Update the description
        metadata.description = newDescription;
        
        // Write the updated content back to the file
        await fs.writeFile(filePath, JSON.stringify(metadata, null, 2), 'utf8');
        
        return {
            success: true,
            file: path.basename(filePath),
            brickType: brickType,
            oldDescription: metadata.description.replace(SUPPORTING_MESSAGE, '').substring(0, 100) + '...',
            newDescription: newDescription.substring(0, 100) + '...'
        };
    } catch (error) {
        return {
            success: false,
            file: path.basename(filePath),
            error: error.message
        };
    }
}

// Main function to update all JSON files
async function updateAllJsonFiles() {
    const metadataDir = path.join(__dirname, 'assets', 'metadata');
    
    try {
        console.log('🧱 Updating all MetaBrick JSON descriptions...\n');
        
        // Check if metadata directory exists
        if (!await fs.pathExists(metadataDir)) {
            console.log('❌ Metadata directory not found:', metadataDir);
            return;
        }
        
        // Get all JSON files
        const files = await fs.readdir(metadataDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        console.log(`📁 Found ${jsonFiles.length} JSON files to update\n`);
        
        let successCount = 0;
        let errorCount = 0;
        const results = [];
        
        // Update each JSON file
        for (const file of jsonFiles) {
            const filePath = path.join(metadataDir, file);
            console.log(`🔄 Updating ${file}...`);
            
            const result = await updateJsonFile(filePath);
            results.push(result);
            
            if (result.success) {
                successCount++;
                console.log(`✅ ${file} updated successfully (${result.brickType})`);
            } else {
                errorCount++;
                console.log(`❌ ${file} failed: ${result.error}`);
            }
        }
        
        // Summary
        console.log('\n📊 Update Summary:');
        console.log(`✅ Successfully updated: ${successCount} files`);
        console.log(`❌ Failed to update: ${errorCount} files`);
        console.log(`📁 Total files processed: ${jsonFiles.length}`);
        
        // Show some examples of updated descriptions
        console.log('\n📝 Example Updated Descriptions:');
        const successfulUpdates = results.filter(r => r.success);
        if (successfulUpdates.length > 0) {
            const example = successfulUpdates[0];
            console.log(`\n${example.file} (${example.brickType}):`);
            console.log(`Old: ${example.oldDescription}`);
            console.log(`New: ${example.newDescription}`);
        }
        
        if (errorCount === 0) {
            console.log('\n🎉 All JSON files updated successfully!');
        } else {
            console.log('\n⚠️ Some files failed to update. Check the errors above.');
        }
        
    } catch (error) {
        console.error('❌ Error updating JSON files:', error);
    }
}

// Run the update if this file is executed directly
if (require.main === module) {
    updateAllJsonFiles();
}

module.exports = {
    updateAllJsonFiles,
    updateJsonFile,
    NEW_DESCRIPTIONS,
    SUPPORTING_MESSAGE
};
