#!/bin/bash
echo "⚡ Personal Brand OS — Setup Script"
echo "===================================="

# Check Node version
node_version=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$node_version" ] || [ "$node_version" -lt "18" ]; then
  echo "❌ Node.js 18+ required. Please install from https://nodejs.org"
  exit 1
fi
echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
echo "✅ Dependencies installed"

# Setup env files
echo ""
echo "⚙️  Setting up environment files..."
if [ ! -f "server/.env" ]; then
  cp server/.env.example server/.env
  echo "📝 Created server/.env — Please edit with your credentials"
fi
if [ ! -f "client/.env" ]; then
  cp client/.env.example client/.env
  echo "📝 Created client/.env"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit server/.env with your MongoDB URI and API keys"
echo "  2. Run: npm run dev"
echo "  3. Open: http://localhost:5173"
echo ""
echo "Get your free API keys:"
echo "  MongoDB:   https://www.mongodb.com/cloud/atlas (free tier)"
echo "  Groq AI:    https://console.groq.com/keys"
echo "  Cloudinary: https://cloudinary.com (free tier)"
