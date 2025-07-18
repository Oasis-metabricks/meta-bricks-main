const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Your Pinata JWT token
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmMTg4ODA1Ny0yZDRhLTQ1MzMtOWI4ZS0wZGMxYjEwNmM4YzMiLCJlbWFpbCI6Im1heC5nZXJzaGZpZWxkMUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMTU4MTU2ZTBjMjdhMDVmMjk2MzYiLCJzY29wZWRLZXlTZWNyZXQiOiI4MDdkMzMwYzg4Mzg0NjRjZGUwNjcxNjg5YTk0ZTBlYTM4NzUyNzIzOGNjOGFjYmU2NDk3MDQxYzU1ZDgyMjI0IiwiaWF0IjoxNzIxOTA0MTQzfQ.a-HQcQLNP-bNH4MQ09WDEizl93q88Jj2Hf50C10shOw';

// Function to upload a single metadata file
const uploadMetadataToPinata = async (filePath, fileName) => {
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);
    formData.append('file', fileStream);

    try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: "Infinity",
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                'Authorization': `Bearer ${JWT}`
            }
        });
        console.log(`Successfully uploaded ${fileName}:`, res.data);
    } catch (error) {
        console.error(`Error uploading ${fileName}:`, error);
    }
};

// Function to upload all metadata files
const uploadAllMetadata = async () => {
    const baseDirs = ['Regular_Brick', 'Industrial_Brick', 'Legendary_Brick'];
    for (const baseDir of baseDirs) {
        const fullDirPath = path.join(__dirname, baseDir, 'metadata'); // Path to metadata directory
        const files = fs.readdirSync(fullDirPath);
        for (const file of files) {
            const filePath = path.join(fullDirPath, file);
            await uploadMetadataToPinata(filePath, file);
        }
    }
};

uploadAllMetadata();
