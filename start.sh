#!/bin/bash

echo "🛸 PIDTUNEAI: Starting Local Environment..."

# Check for Node
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install it from https://nodejs.org"
    exit 1
fi

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node dependencies..."
    npm install
fi

# Install python requirements
echo "🐍 Checking Python dependencies..."
pip3 install -q -r requirements.txt

echo "🚀 Launching Application..."
echo "🔗 Once ready, open http://localhost:3000 in your browser."
npm run dev
