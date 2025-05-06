#!/bin/bash

# Print colorful welcome message
echo -e "\033[1;34m🚀 Welcome to the Event Parking App Setup! 🚀\033[0m"
echo -e "\033[1;36mThis script will help you set up the development environment.\033[0m\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "\033[1;31m❌ Node.js is not installed. Please install Node.js first.\033[0m"
    exit 1
fi

# Install dependencies
echo -e "\033[1;33m📦 Installing dependencies...\033[0m"
npm install

# Copy environment files
echo -e "\033[1;33m🔧 Setting up environment variables...\033[0m"
cp .env.example .env

echo -e "\033[1;32m✅ Setup complete! You can now run the application with:\033[0m"
echo -e "\033[1;35m   npm run dev\033[0m\n"

echo -e "\033[1;36mTest Payment Card:\033[0m"
echo -e "Card Number: 4242 4242 4242 4242"
echo -e "Any future expiry date"
echo -e "Any 3-digit CVC"
echo -e "Any postal code" 