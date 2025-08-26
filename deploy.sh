#!/bin/bash

# Secure Deployment Script for Super Mall Web App
# This script deploys the app using production environment variables
# without exposing secrets in the repository

echo "🚀 Starting deployment process..."

# Check if production environment file exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "Create .env.production with your Firebase credentials before deploying."
    exit 1
fi

# Backup current .env
if [ -f ".env" ]; then
    cp .env .env.backup
    echo "📄 Backed up current .env file"
fi

# Use production environment
cp .env.production .env
echo "🔧 Using production environment variables"

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Firebase
    echo "🚀 Deploying to Firebase Hosting..."
    firebase deploy --only hosting
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment successful!"
        echo "🌐 Live URL: https://super-mall-web-app-32eaf.web.app"
    else
        echo "❌ Deployment failed!"
    fi
else
    echo "❌ Build failed!"
fi

# Restore original .env
if [ -f ".env.backup" ]; then
    mv .env.backup .env
    echo "📄 Restored original .env file"
else
    cp .env.example .env
    echo "📄 Restored placeholder .env file"
fi

echo "🏁 Deployment process completed!"
