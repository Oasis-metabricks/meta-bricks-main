#!/bin/bash

echo "🚀 Deploying MetaBricks to GitHub Pages"
echo "=========================================="

# Install gh-pages if not already installed
if ! npm list -g gh-pages > /dev/null 2>&1; then
    echo "📦 Installing gh-pages..."
    npm install -g gh-pages
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to GitHub Pages
echo "🌐 Deploying to GitHub Pages..."
gh-pages -d dist/meta-bricks

echo "✅ Deployment complete!"
echo "🌍 Your site should be available at: https://[your-username].github.io/[repo-name]"
echo ""
echo "📋 Next steps:"
echo "1. Go to your GitHub repository settings"
echo "2. Enable GitHub Pages"
echo "3. Set source to 'gh-pages' branch"
echo "4. Your site will be live in a few minutes" 