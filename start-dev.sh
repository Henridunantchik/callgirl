#!/bin/bash

# Escort Directory - Development Startup Script

echo "🚀 Starting Escort Directory Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Start Backend (API)
echo "🔧 Starting Backend API..."
cd api
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found in api directory. Please create it with required environment variables."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start the API server in background
echo "🚀 Starting API server on port 5000..."
npm start &
API_PID=$!
cd ..

# Wait a moment for API to start
sleep 3

# Start Frontend (Client)
echo "🌐 Starting Frontend Client..."
cd client

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start the development server
echo "🚀 Starting frontend development server on port 5173..."
npm run dev &
CLIENT_PID=$!
cd ..

echo ""
echo "🎉 Development environment started!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:5000"
echo "🧪 Test Page: http://localhost:5173/test"
echo ""
echo "📋 Available Routes:"
echo "   - /signin - User authentication"
echo "   - /signup - User registration"
echo "   - /escort/registration - Escort registration"
echo "   - /escort/list - Browse escorts"
echo "   - /test - API testing page"
echo ""
echo "🛑 To stop the servers, press Ctrl+C"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $API_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    echo "✅ Servers stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
