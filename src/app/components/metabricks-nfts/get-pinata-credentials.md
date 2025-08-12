# 🔑 Getting Fresh Pinata API Credentials

## ❌ Current Issue
The JWT token appears to be expired (HTTP 401 error). We need fresh credentials.

## 🔧 Steps to Get Fresh Credentials

### 1. **Go to Pinata Dashboard**
- Visit: https://app.pinata.cloud/
- Sign in to your account

### 2. **Navigate to API Keys**
- Click on your profile/account menu
- Select "API Keys" or "Developer"

### 3. **Create New API Key**
- Click "Create New Key"
- Give it a name like "MetaBricks Upload"
- Select permissions:
  - ✅ Pin JSON to IPFS
  - ✅ Pin File to IPFS
  - ✅ View pinned items

### 4. **Copy the Credentials**
You'll get:
- **API Key**: (starts with letters/numbers)
- **Secret Key**: (longer string, shown only once)
- **JWT**: (starts with "eyJ...")

### 5. **Update the Script**
Replace these values in `upload-to-pinata-simple.js`:

```javascript
const PINATA_CONFIG = {
    apiKey: 'YOUR_NEW_API_KEY',
    secretKey: 'YOUR_NEW_SECRET_KEY', 
    jwt: 'YOUR_NEW_JWT'
};
```

## 🚀 Alternative: Use API Key + Secret

If JWT doesn't work, we can modify the script to use API Key + Secret instead:

```javascript
const PINATA_CONFIG = {
    apiKey: 'YOUR_API_KEY',
    secretKey: 'YOUR_SECRET_KEY'
};
```

## 📝 What We Need
- Fresh API Key
- Fresh Secret Key  
- Fresh JWT (or we'll use API Key + Secret method)

## 🔍 Quick Test
Once you have new credentials, we can test with:
```bash
node src/app/components/metabricks-nfts/upload-to-pinata-simple.js --test
```

## 💡 Pro Tip
The JWT tokens typically expire after a certain time, so using API Key + Secret is often more reliable for long-term projects.
