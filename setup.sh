#!/bin/bash

# Calmish AI Setup Script
# This script helps you set up the Calmish AI integration

echo "🌸 Welcome to Calmish AI Setup! 🌸"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if Google Cloud SDK is installed
if ! command -v gcloud &> /dev/null; then
    echo ""
    echo "⚠️  Google Cloud SDK not found."
    echo "   You can install it later from: https://cloud.google.com/sdk/docs/install"
else
    echo "✅ Google Cloud SDK found: $(gcloud version | head -1)"
fi

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create environment file
echo ""
echo "🔧 Creating environment configuration..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo ""
    echo "⚠️  IMPORTANT: You need to update the .env file with your configuration:"
    echo "   - GOOGLE_CLOUD_PROJECT: Your Google Cloud project ID"
    echo "   - FRONTEND_URL: Your frontend URL (for CORS)"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Check for service account key
echo ""
echo "🔑 Checking for Google Cloud service account key..."
if [ -f "calmish-ai-key.json" ]; then
    echo "✅ Service account key found"
    export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/calmish-ai-key.json"
elif [ -f "$HOME/calmish-ai-key.json" ]; then
    echo "✅ Service account key found in home directory"
    export GOOGLE_APPLICATION_CREDENTIALS="$HOME/calmish-ai-key.json"
else
    echo "⚠️  No service account key found."
    echo "   You'll need to create one and download it."
    echo "   See the deployment guide for instructions."
fi

# Test the setup
echo ""
echo "🧪 Testing the setup..."
node -e "
const { VertexAI } = require('@google-cloud/vertexai');
try {
    const vertexAI = new VertexAI({
        project: process.env.GOOGLE_CLOUD_PROJECT || 'test',
        location: 'us-central1'
    });
    console.log('✅ Google Cloud Vertex AI SDK loaded successfully');
} catch (error) {
    console.log('⚠️  Google Cloud SDK test failed (this is normal if not configured yet)');
}
"

# Create a simple test script
cat > test-connection.js << 'EOF'
const express = require('express');
const { VertexAI } = require('@google-cloud/vertexai');

console.log('Testing Calmish AI Setup...');
console.log('================================');

// Test 1: Check environment
console.log('\n1. Environment Check:');
console.log('   Node.js version:', process.version);
console.log('   Google Cloud Project:', process.env.GOOGLE_CLOUD_PROJECT || 'Not set');
console.log('   Service Account:', process.env.GOOGLE_APPLICATION_CREDENTIALS || 'Not set');

// Test 2: Check dependencies
console.log('\n2. Dependencies Check:');
try {
    require('@google-cloud/vertexai');
    console.log('   ✅ @google-cloud/vertexai');
} catch (e) {
    console.log('   ❌ @google-cloud/vertexai');
}

try {
    require('express');
    console.log('   ✅ express');
} catch (e) {
    console.log('   ❌ express');
}

try {
    require('cors');
    console.log('   ✅ cors');
} catch (e) {
    console.log('   ❌ cors');
}

// Test 3: Google Cloud Connection
console.log('\n3. Google Cloud Connection:');
if (process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
        const vertexAI = new VertexAI({
            project: process.env.GOOGLE_CLOUD_PROJECT,
            location: 'us-central1'
        });
        console.log('   ✅ Can initialize Vertex AI');
    } catch (error) {
        console.log('   ❌ Cannot initialize Vertex AI:', error.message);
    }
} else {
    console.log('   ⚠️  Missing configuration for Google Cloud test');
}

console.log('\n================================');
console.log('Setup test complete!');
EOF

echo ""
echo "🎯 Setup Summary:"
echo "=================="
echo "✅ Backend dependencies installed"
echo "✅ Environment file created"
echo "✅ Test script created"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Update your .env file with your Google Cloud project ID"
echo "2. Create and download your service account key"
echo "3. Run: npm start (to start the backend)"
echo "4. Test with: node test-connection.js"
echo "5. Update support-ai.html with your backend URL"
echo ""
echo "📚 Documentation:"
echo "================"
echo "- google-ai-integration-guide.md: Complete integration guide"
echo "- deployment-guide.md: Production deployment instructions"
echo "- server.js: Backend server code"
echo "- support-ai.html: Frontend with AI integration"
echo ""
echo "🌸 Thank you for choosing Calmish! 🌸"