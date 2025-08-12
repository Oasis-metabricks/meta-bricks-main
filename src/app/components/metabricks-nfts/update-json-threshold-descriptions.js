const fs = require('fs-extra');
const path = require('path');

// New threshold-based perk reveal system
const THRESHOLD_SYSTEM = {
    10: "10% wall completion (43 bricks sold)",
    25: "25% wall completion (108 bricks sold)",
    50: "50% wall completion (216 bricks sold)",
    75: "75% wall completion (324 bricks sold)",
    100: "100% wall completion (432 bricks sold)"
};

// Function to update a single JSON file
async function updateJsonFile(filePath) {
    try {
        // Read the JSON file
        const content = await fs.readFile(filePath, 'utf8');
        const metadata = JSON.parse(content);
        
        // Update the perks array descriptions
        if (metadata.perks && Array.isArray(metadata.perks)) {
            metadata.perks.forEach(perk => {
                if (perk.name !== "MetaBrick Keychain" && perk.name.includes("Mystery Perk")) {
                    // Extract perk number from name (e.g., "Mystery Perk #12" -> 12)
                    const perkNumber = parseInt(perk.name.match(/\d+/)[0]);
                    
                    // Determine which threshold this perk will be revealed at
                    let threshold = 100; // Default to 100%
                    if ([12, 5, 7].includes(perkNumber)) {
                        threshold = 10;
                    } else if ([1, 2].includes(perkNumber)) {
                        threshold = 25;
                    } else if ([3, 4, 6, 8].includes(perkNumber)) {
                        threshold = 50;
                    } else if ([9, 10, 11].includes(perkNumber)) {
                        threshold = 75;
                    } else if ([13, 14].includes(perkNumber)) {
                        threshold = 100;
                    }
                    
                    // Update the description with threshold information
                    perk.description = `Mystery perk - will be revealed at ${THRESHOLD_SYSTEM[threshold]}`;
                }
            });
        }
        
        // Update the attributes array descriptions (this is where the old language still exists)
        if (metadata.attributes && Array.isArray(metadata.attributes)) {
            metadata.attributes.forEach(attr => {
                if (attr.trait_type === "Mystery" && attr.description && attr.description.includes("wall destruction")) {
                    // Extract perk number from value (e.g., "Mystery Perk #2" -> 2)
                    const perkNumber = parseInt(attr.value.match(/\d+/)[0]);
                    
                    // Determine which threshold this perk will be revealed at
                    let threshold = 100; // Default to 100%
                    if ([12, 5, 7].includes(perkNumber)) {
                        threshold = 10;
                    } else if ([1, 2].includes(perkNumber)) {
                        threshold = 25;
                    } else if ([3, 4, 6, 8].includes(perkNumber)) {
                        threshold = 50;
                    } else if ([9, 10, 11].includes(perkNumber)) {
                        threshold = 75;
                    } else if ([13, 14].includes(perkNumber)) {
                        threshold = 100;
                    }
                    
                    // Update the description with threshold information
                    attr.description = `Mystery perk - will be revealed at ${THRESHOLD_SYSTEM[threshold]}`;
                }
            });
        }
        
        // Update the main description to mention threshold reveals
        if (metadata.description) {
            const descriptions = {
                regular: `You have successfully removed a 'REGULAR' brick from the Metabricks wall. Perks will be revealed at specific destruction thresholds (10%, 25%, 50%, 75%, 100%).`,
                industrial: `Congratulations! You have got your hands on an 'INDUSTRIAL' grade Metabrick from the Metabrick wall. Perks will be revealed at specific destruction thresholds (10%, 25%, 50%, 75%, 100%).`,
                legendary: `CONGRATULATIONS!! You have found a Legendary grade Metabrick, the rarest brick type in Metabricks. Perks will be revealed at specific destruction thresholds (10%, 25%, 50%, 75%, 100%).`
            };
            
            const supportingMessage = `\n\nBy holding this Metabrick you are supporting construction of Metaverse systems via OASISWEB4 - thank you for your service.`;
            
            // Extract brick type from hiddenMetadata
            const brickType = metadata.hiddenMetadata?.type || 'regular';
            metadata.description = descriptions[brickType] + supportingMessage;
        }
        
        // Write the updated content back to the file
        await fs.writeFile(filePath, JSON.stringify(metadata, null, 2), 'utf8');
        
        return {
            success: true,
            file: path.basename(filePath),
            perksUpdated: metadata.perks ? metadata.perks.length : 0
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
        console.log('🧱 Updating MetaBrick JSONs with new Threshold-Based Perk Reveal System...\n');
        
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
        
        // Update each JSON file
        for (const file of jsonFiles) {
            const filePath = path.join(metadataDir, file);
            console.log(`🔄 Updating ${file}...`);
            
            const result = await updateJsonFile(filePath);
            
            if (result.success) {
                successCount++;
                console.log(`✅ ${file} updated successfully (${result.perksUpdated} perks)`);
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
        
        // Show new threshold system
        console.log('\n🎭 New Threshold-Based Perk Reveal System:');
        console.log('• 10% (43 bricks): FREE hApp, FREE OLAND, FREE Statue');
        console.log('• 25% (108 bricks): Bronze API, Silver API');
        console.log('• 50% (216 bricks): Gold API, Free OAPP, Billboard, Landmark');
        console.log('• 75% (324 bricks): Token Integration, Custom AR, Custom Building');
        console.log('• 100% (432 bricks): OASIS Integration, Early Access');
        
        console.log('\n🔐 Updated Descriptions:');
        console.log('• Mystery perks now show specific threshold reveal points');
        console.log('• Main descriptions mention threshold percentages');
        console.log('• No more "wall destruction" language');
        
        if (errorCount === 0) {
            console.log('\n🎉 All JSON files updated with new Threshold-Based Perk Reveal System!');
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
    THRESHOLD_SYSTEM
};
