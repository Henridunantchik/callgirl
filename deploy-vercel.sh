#!/bin/bash

echo "🚀 Deploying to Vercel..."

# Deploy Backend (API) first
echo "📡 Deploying Backend API..."
cd api
vercel --prod --yes

# Get the API URL from the deployment
API_URL=$(vercel ls | grep "api" | head -1 | awk '{print $2}')
echo "✅ API deployed at: $API_URL"

# Deploy Frontend (Client)
echo "🌐 Deploying Frontend..."
cd ../client

# Set environment variable for the API URL
export VITE_API_URL="$API_URL/api"
export VITE_SOCKET_URL="$API_URL"

# Deploy frontend
vercel --prod --yes

echo "🎉 Deployment complete!"
echo "📡 API: $API_URL"
echo "🌐 Frontend: Check Vercel dashboard for URL"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Test all features"
echo "3. Configure custom domain (optional)"
