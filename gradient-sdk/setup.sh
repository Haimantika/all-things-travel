#!/bin/bash

# Setup script for Gradient SDK Flight Information Generator

echo "🚀 Setting up Gradient SDK Flight Information Generator..."

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "To get started:"
echo "1. Activate the virtual environment: source venv/bin/activate"
echo "2. Set your environment variables:"
echo "   export FLIGHT_AGENT_KEY='your_agent_key'"
echo "   export FLIGHT_AGENT_BASE_URL='your_agent_url'"
echo "3. Run tests: python3 test_flight.py"
echo "4. Run the main function: python3 flight.py"
echo ""
echo "Or use the build script: ./build_python.sh"
