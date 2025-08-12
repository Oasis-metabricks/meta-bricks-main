const { generateBrickMetadata } = require('./pinata-integration');

// Test all brick type descriptions
function testAllDescriptions() {
    console.log('🧱 Testing All MetaBrick Descriptions...\n');
    
    const testUser = '85ArqfA2fy8spGcMGsSW7cbEJAWj26vewmmoG2bwkgT9';
    
    // Test Regular Brick
    console.log('📋 REGULAR BRICK:');
    const regularMetadata = generateBrickMetadata(1, 'regular', testUser);
    console.log('Description:', regularMetadata.description);
    console.log('---');
    
    // Test Industrial Brick
    console.log('📋 INDUSTRIAL BRICK:');
    const industrialMetadata = generateBrickMetadata(2, 'industrial', testUser);
    console.log('Description:', industrialMetadata.description);
    console.log('---');
    
    // Test Legendary Brick
    console.log('📋 LEGENDARY BRICK:');
    const legendaryMetadata = generateBrickMetadata(3, 'legendary', testUser);
    console.log('Description:', legendaryMetadata.description);
    console.log('---');
    
    console.log('✅ All descriptions generated successfully!');
}

// Run the test
testAllDescriptions();
