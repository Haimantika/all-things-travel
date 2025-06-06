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
    echo "TRIPADVISOR_API_KEY=your_api_key_here" >> .env
    echo "TRIPADVISOR_API_HOST=tripadvisor16.p.rapidapi.com" >> .env
    echo "TRIPADVISOR_API_URL=https://tripadvisor16.p.rapidapi.com/api/v1/flights" >> .env
    echo "Please update the .env file with your actual RapidAPI key"
fi 