const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'assets');
const IPFS_CID = 'bafybeia7dnclsgkjh6ugyzdzb3uivkydgozpmnbtpnnu4an3t2fta45ktm';
const GATEWAY_URL = `https://gateway.pinata.cloud/ipfs/${IPFS_CID}`;

for (let i = 0; i < 30; i++) {
  const jsonFile = path.join(ASSETS_DIR, `${i}.json`);
  const pngFile = `${i}.png`;
  if (!fs.existsSync(jsonFile)) {
    console.warn(`Missing: ${jsonFile}`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  // Update image field
  data.image = `${GATEWAY_URL}/${pngFile}`;
  // Update properties.files[0].uri if present
  if (data.properties && data.properties.files && data.properties.files[0]) {
    data.properties.files[0].uri = `${GATEWAY_URL}/${pngFile}`;
  }
  fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2));
  console.log(`Updated: ${jsonFile}`);
}
console.log('Batch update complete.'); 