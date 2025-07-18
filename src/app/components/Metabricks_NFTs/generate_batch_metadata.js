const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'assets');

const regularCount = 20;
const industrialCount = 7;
const legendaryCount = 3;

let index = 0;

// Generate Regular Bricks
for (let i = 0; i < regularCount; i++, index++) {
  const data = {
    name: `Regular Brick #${index + 1}`,
    symbol: 'MBRK',
    description: 'A Regular Brick from the Metabricks collection.',
    seller_fee_basis_points: 500,
    image: `TO_BE_REPLACED/regular_${i}.png`,
    attributes: [
      { trait_type: 'Type', value: 'Regular' }
    ],
    properties: {
      files: [
        { uri: `TO_BE_REPLACED/regular_${i}.png`, type: 'image/png' }
      ],
      category: 'image'
    }
  };
  fs.writeFileSync(path.join(ASSETS_DIR, `${index}.json`), JSON.stringify(data, null, 2));
}

// Generate Industrial Bricks
for (let i = 0; i < industrialCount; i++, index++) {
  const data = {
    name: `Industrial Brick #${index + 1}`,
    symbol: 'MBRK',
    description: 'A Industrial Brick from the Metabricks collection.',
    seller_fee_basis_points: 500,
    image: `TO_BE_REPLACED/industrial_${i}.png`,
    attributes: [
      { trait_type: 'Type', value: 'Industrial' }
    ],
    properties: {
      files: [
        { uri: `TO_BE_REPLACED/industrial_${i}.png`, type: 'image/png' }
      ],
      category: 'image'
    }
  };
  fs.writeFileSync(path.join(ASSETS_DIR, `${index}.json`), JSON.stringify(data, null, 2));
}

// Generate Legendary Bricks
for (let i = 0; i < legendaryCount; i++, index++) {
  const data = {
    name: `Legendary Brick #${index + 1}`,
    symbol: 'MBRK',
    description: 'A Legendary Brick from the Metabricks collection.',
    seller_fee_basis_points: 500,
    image: `TO_BE_REPLACED/legendary_${i}.png`,
    attributes: [
      { trait_type: 'Type', value: 'Legendary' }
    ],
    properties: {
      files: [
        { uri: `TO_BE_REPLACED/legendary_${i}.png`, type: 'image/png' }
      ],
      category: 'image'
    }
  };
  fs.writeFileSync(path.join(ASSETS_DIR, `${index}.json`), JSON.stringify(data, null, 2));
}

console.log('Batch metadata generated.'); 