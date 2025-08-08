#!/bin/bash

echo "🚀 CryptoAI Platform Starting..."
echo

echo "📦 Installing dependencies..."
npm run install:all

echo
echo "🔧 Setting up environment..."
if [ ! -f "backend/.env" ]; then
    echo "Creating .env file from template..."
    cp backend/env.example backend/.env
fi

echo
echo "🌐 Starting development servers..."
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo

npm run dev
