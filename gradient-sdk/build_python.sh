#!/bin/bash

# Python build script for flight function using Gradient SDK

echo "Building Python flight function..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Run tests if they exist
if [ -f "test_flight.py" ]; then
    echo "Running tests..."
    python test_flight.py
fi

echo "Build completed successfully!"
echo "To run the function: python flight.py"
