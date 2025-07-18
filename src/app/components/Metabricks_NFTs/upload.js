const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmMTg4ODA1Ny0yZDRhLTQ1MzMtOWI4ZS0wZGMxYjEwNmM4YzMiLCJlbWFpbCI6Im1heC5nZXJzaGZpZWxkMUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMTU4MTU2ZTBjMjdhMDVmMjk2MzYiLCJzY29wZWRLZXlTZWNyZXQiOiI4MDdkMzMwYzg4Mzg0NjRjZGUwNjcxNjg5YTk0ZTBlYTM4NzUyNzIzOGNjOGFjYmU2NDk3MDQxYzU1ZDgyMjI0IiwiaWF0IjoxNzIxOTA0MTQzfQ.a-HQcQLNP-bNH4MQ09WDEizl93q88Jj2Hf50C10shOw';

const uploadFileToPinata = async (filePath, fileName) => {
    const formData = new FormData();
    const file = fs.createReadStream(filePath);
    formData.append('file', file);

    const pinataMetadata = JSON.stringify({
        name: fileName,
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
        cidVersion: 0,
    });
    formData.append('pinataOptions', pinataOptions);

    try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: "Infinity",
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                'Authorization': `Bearer ${JWT}`
            }
        });
        console.log(`Successfully uploaded ${fileName}:`, res.data);
        return res.data.IpfsHash; // Return the IPFS hash of the uploaded file
    } catch (error) {
        console.error(`Error uploading ${fileName}:`, error);
        return null;
    }
};

const uploadAllFiles = async () => {
    const baseDirs = ['Regular_Brick', 'Industrial_Brick', 'Legendary_Brick'];
    for (const baseDir of baseDirs) {
        const imagePath = path.join(__dirname, 'assets', baseDir, `${baseDir}.png`);
        const metadataDir = path.join(__dirname, 'assets', baseDir, 'metadata');
        
        // Upload image and get IPFS hash
        const imageIpfsHash = await uploadFileToPinata(imagePath, `${baseDir}.png`);
        
        if (imageIpfsHash) {
            const files = fs.readdirSync(metadataDir);
            for (const file of files) {
                const filePath = path.join(metadataDir, file);

                try {
                    // Check if file exists and is not empty
                    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
                        const metadataContent = fs.readFileSync(filePath, 'utf-8');

                        // Check for valid JSON content
                        let metadata;
                        try {
                            metadata = JSON.parse(metadataContent);
                        } catch (jsonError) {
                            console.error(`Invalid JSON in file ${filePath}:`, jsonError);
                            continue; // Skip this file and move to the next one
                        }

                        metadata.image = `https://gateway.pinata.cloud/ipfs/${imageIpfsHash}`;
                        metadata.properties.files[0].uri = `https://gateway.pinata.cloud/ipfs/${imageIpfsHash}`;
                        fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
                        
                        // Upload metadata
                        await uploadFileToPinata(filePath, file);
                    } else {
                        console.error(`File ${filePath} is empty or does not exist.`);
                    }
                } catch (fsError) {
                    console.error(`Error processing file ${filePath}:`, fsError);
                }
            }
        }
    }
};

uploadAllFiles();
