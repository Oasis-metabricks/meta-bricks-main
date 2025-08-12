const fs = require('fs-extra');
const path = require('path');

// Mystery perk system
const MYSTERY_PERKS = [
    { name: "Mystery Perk #1", rarity: "Mystery", value: "Mystery1" },
    { name: "Mystery Perk #2", rarity: "Mystery", value: "Mystery2" },
    { name: "Mystery Perk #3", rarity: "Mystery", value: "Mystery3" },
    { name: "Mystery Perk #4", rarity: "Mystery", value: "Mystery4" },
    { name: "Mystery Perk #5", rarity: "Mystery", value: "Mystery5" },
    { name: "Mystery Perk #6", rarity: "Mystery", value: "Mystery6" },
    { name: "Mystery Perk #7", rarity: "Mystery", value: "Mystery7" },
    { name: "Mystery Perk #8", rarity: "Mystery", value: "Mystery8" },
    { name: "Mystery Perk #9", rarity: "Mystery", value: "Mystery9" },
    { name: "Mystery Perk #10", rarity: "Mystery", value: "Mystery10" },
    { name: "Mystery Perk #11", rarity: "Mystery", value: "Mystery11" },
    { name: "Mystery Perk #12", rarity: "Mystery", value: "Mystery12" },
    { name: "Mystery Perk #13", rarity: "Mystery", value: "Mystery13" },
    { name: "Mystery Perk #14", rarity: "Mystery", value: "Mystery14" }
];

// Function to update a single JSON file
async function updateJsonFile(filePath) {
    try {
        // Read the JSON file
        const content = await fs.readFile(filePath, 'utf8');
        const metadata = JSON.parse(content);
        
        // Update the perks array to use mystery perks
        if (metadata.perks && Array.isArray(metadata.perks)) {
            const updatedPerks = [];
            
            // Keep the MetaBrick Keychain if it exists
            const keychainPerk = metadata.perks.find(p => p.name === "MetaBrick Keychain");
            if (keychainPerk) {
                updatedPerks.push({
                    category: "Physical",
                    name: "MetaBrick Keychain",
                    description: "Exclusive physical MetaBrick keychain - shipped to your address",
                    rarity: "Guaranteed",
                    value: "Keychain"
                });
            }
            
            // Add mystery perks (1-2 additional perks)
            const numAdditionalPerks = Math.min(metadata.perks.length - (keychainPerk ? 1 : 0), 2);
            for (let i = 0; i < numAdditionalPerks; i++) {
                const mysteryPerk = MYSTERY_PERKS[Math.floor(Math.random() * MYSTERY_PERKS.length)];
                updatedPerks.push({
                    category: "Mystery",
                    name: mysteryPerk.name,
                    description: "Mystery perk - details revealed upon wall destruction",
                    rarity: "Mystery",
                    value: mysteryPerk.value
                });
            }
            
            metadata.perks = updatedPerks;
        }
        
        // Update attributes to use mystery perks
        if (metadata.attributes && Array.isArray(metadata.attributes)) {
            const updatedAttributes = [];
            
            // Keep core attributes (Token Airdrop, TGE Discount)
            const coreAttributes = metadata.attributes.filter(attr => 
                attr.trait_type === "Token Airdrop" || 
                attr.trait_type === "TGE Discount"
            );
            updatedAttributes.push(...coreAttributes);
            
            // Add mystery perk attributes
            if (metadata.perks) {
                metadata.perks.forEach(perk => {
                    if (perk.name !== "MetaBrick Keychain") {
                        updatedAttributes.push({
                            trait_type: perk.category,
                            value: perk.name,
                            description: perk.description,
                            rarity: perk.rarity
                        });
                    }
                });
            }
            
            metadata.attributes = updatedAttributes;
        }
        
        // Update hiddenMetadata if it exists
        if (metadata.hiddenMetadata) {
            // Keep the type and rarity, but remove specific perk details
            metadata.hiddenMetadata = {
                type: metadata.hiddenMetadata.type || "regular",
                rarity: metadata.hiddenMetadata.rarity || "Common"
            };
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
        console.log('🧱 Updating all MetaBrick JSON files to use Mystery Perks...\n');
        
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
        
        // Show example of updated perks
        console.log('\n📝 Example Updated Perks:');
        if (successCount > 0) {
            console.log('• MetaBrick Keychain (Guaranteed)');
            console.log('• Mystery Perk #1 (Mystery)');
            console.log('• Mystery Perk #2 (Mystery)');
            console.log('\nAll specific perk names have been replaced with mystery perks!');
        }
        
        if (errorCount === 0) {
            console.log('\n🎉 All JSON files updated successfully to Mystery Perks!');
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
    MYSTERY_PERKS
};
