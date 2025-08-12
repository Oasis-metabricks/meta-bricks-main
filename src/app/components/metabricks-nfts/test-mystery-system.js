// Test script to verify TGE discount mystery system
const testMetadata = {
  attributes: [
    {
      trait_type: "Token Airdrop",
      value: "Guaranteed",
      description: "Token airdrop on TGE"
    },
    {
      trait_type: "TGE Discount",
      value: "15%",
      description: "Token Generation Event discount"
    },
    {
      trait_type: "Rarity",
      value: "Industrial",
      description: "Brick rarity level"
    }
  ]
};

// Simulate the mystery hiding logic
function hideTGEValues(attributes) {
  return attributes.map(attr => {
    const processedAttr = { ...attr };
    
    // Hide TGE discount values to maintain mystery (only discount, not airdrop)
    if (attr.trait_type === 'TGE Discount' || 
        attr.trait_type === 'Token Generation Event discount' ||
        (attr.description && attr.description.includes('Token Generation Event discount'))) {
      processedAttr.value = '??';
      processedAttr.originalValue = attr.value;
      processedAttr.isHidden = true;
    }
    
    return processedAttr;
  });
}

// Test the mystery system
console.log('🧱 Testing TGE Discount Mystery System...\n');

console.log('📋 Original Attributes:');
testMetadata.attributes.forEach(attr => {
  console.log(`  • ${attr.trait_type}: ${attr.value}`);
});

console.log('\n🔒 Hidden Attributes (Mystery Mode):');
const hiddenAttributes = hideTGEValues(testMetadata.attributes);
hiddenAttributes.forEach(attr => {
  if (attr.isHidden) {
    console.log(`  • ${attr.trait_type}: ${attr.value} (Original: ${attr.originalValue})`);
  } else {
    console.log(`  • ${attr.trait_type}: ${attr.value}`);
  }
});

console.log('\n✅ Mystery System Test Complete!');
console.log('💡 TGE discount values are now hidden as "??"');
console.log('🎁 Values will be revealed after purchase!');
