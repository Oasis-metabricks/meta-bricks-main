const bs58 = require('bs58');

// Replace this array with the actual array from your id.json
const privateKeyArray = 
  [213,54,74,83,152,186,232,208,190,144,47,16,45,107,212,13,63,251,182,74,15,112,115,166,127,53,222,162,163,115,188,170,68,27,213,64,89,134,247,69,169,98,251,204,119,255,144,53,92,25,199,196,248,19,190,125,95,234,89,199,11,2,223,191
];

const privateKeyBuffer = Buffer.from(privateKeyArray);
const privateKeyBase58 = bs58.encode(privateKeyBuffer);

console.log(privateKeyBase58);
