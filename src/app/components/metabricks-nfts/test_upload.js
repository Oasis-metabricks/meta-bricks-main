require('dotenv').config();
const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs-extra');

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_API_KEY;

console.log('Testing Pinata connection...');
console.log('API Key:', PINATA_API_KEY);
console.log('Secret Key:', PINATA_SECRET_KEY ? 'FOUND' : 'MISSING');

async function testUpload() {
    try {
        // Create a simple test file
        const testContent = '{"test": "data"}';
        const testPath = './test.json';
        await fs.writeFile(testPath, testContent);
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(testPath));
        
        console.log('Attempting to upload test file...');
        
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY,
                ...formData.getHeaders()
            },
            body: formData
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Pinata API error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Success! IPFS Hash:', result.IpfsHash);
        
        // Clean up
        await fs.remove(testPath);
        
    } catch (error) {
        console.error('Upload failed:', error.message);
    }
}

testUpload();

