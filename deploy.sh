#!/bin/bash

echo "🚀 MetaBricks Deployment Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd src/app/components/max-server
npm install
cd ../../../

# Build the Angular application
echo "🔨 Building Angular application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build files are in the 'dist/meta-bricks' directory"
else
    echo "❌ Build failed!"
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deployment
cp -r dist/meta-bricks/* deployment/
cp -r src/app/components/max-server deployment/server/
cp src/app/components/max-server/env.example deployment/server/.env.example

# Create deployment configuration
cat > deployment/deployment-config.json << EOF
{
  "frontend": {
    "buildPath": "dist/meta-bricks",
    "deployPath": "./",
    "environment": "production"
  },
  "backend": {
    "serverPath": "server",
    "port": 3001,
    "environment": "production"
  },
  "requirements": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  }
}
EOF

echo "✅ Deployment package created in 'deployment' directory"
echo ""
echo "📋 Next steps:"
echo "1. Upload the 'deployment' folder to your hosting platform"
echo "2. Set up environment variables for Stripe and Pinata"
echo "3. Configure your domain and SSL certificate"
echo "4. Start the server and test the application"
echo ""
echo "🌐 For frontend hosting options:"
echo "   - Vercel: vercel --prod"
echo "   - Netlify: netlify deploy --prod"
echo "   - AWS S3 + CloudFront"
echo "   - Firebase Hosting"
echo ""
echo "🖥️  For backend hosting options:"
echo "   - Heroku: git push heroku main"
echo "   - Railway: railway up"
echo "   - AWS EC2"
echo "   - DigitalOcean App Platform" 