#!/bin/bash

echo "🧪 Testing Metabricks build..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this from the meta-bricks-main directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! All compilation errors resolved."
else
    echo "❌ Build failed. There are still compilation errors."
    exit 1
fi

echo "🎉 Metabricks wallet integration complete!"
echo "🚀 You can now navigate to /wallet to see your new wallet!"


