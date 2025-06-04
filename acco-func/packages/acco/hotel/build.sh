#!/bin/bash
set -e

# Create node_modules directory if it doesn't exist
mkdir -p node_modules

# Install dependencies
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    touch .env
    echo "HOTELBEDS_API_KEY=your_api_key_here" >> .env
    echo "HOTELBEDS_SECRET=your_secret_here" >> .env
    echo "HOTELBEDS_API_URL=your_api_url_here" >> .env
    echo "Please update the .env file with your actual credentials"
fi 