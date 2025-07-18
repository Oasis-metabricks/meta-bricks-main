const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'assets');
const IMAGES_CID = 'bafybeig4zh7265n7s4i5dxmq7zhcscdzg5cybd4jdwe2kloe4wmvnjvfja';
const GATEWAY_URL = `https://gateway.pinata.cloud/ipfs/${IMAGES_CID}`;

for (let i = 0; i < 30; i++) {
  const jsonFile = path.join(ASSETS_DIR, `${i}.json`);
  if (!fs.existsSync(jsonFile)) {
    console.warn(`Missing: ${jsonFile}`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  // Update image field
  if (data.image && data.image.startsWith('TO_BE_REPLACED/')) {
    const filename = data.image.replace('TO_BE_REPLACED/', '');
    data.image = `${GATEWAY_URL}/${filename}`;
  }
  // Update properties.files[0].uri if present
  if (data.properties && data.properties.files && data.properties.files[0] && data.properties.files[0].uri.startsWith('TO_BE_REPLACED/')) {
    const filename = data.properties.files[0].uri.replace('TO_BE_REPLACED/', '');
    data.properties.files[0].uri = `${GATEWAY_URL}/${filename}`;
  }
  fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2));
  console.log(`Updated: ${jsonFile}`);
}
console.log('Metadata image URLs updated.'); 