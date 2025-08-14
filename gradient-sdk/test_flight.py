#!/usr/bin/env python3
"""
Test script for the flight information generation function
"""

import os
import json
from flight import main

def test_flight_generation():
    """Test the flight information generation function"""
    
    # Set up test environment variable (you'll need to set your actual token)
    if not os.getenv('GRADIENT_ACCESS_TOKEN'):
        print("Warning: GRADIENT_ACCESS_TOKEN not set. Set it to test with real API calls.")
        print("You can set it with: export GRADIENT_ACCESS_TOKEN='your_token_here'")
        return
    
    # Test cases
    test_cases = [
        {
            "name": "One-way flight",
            "args": {
                "fromCity": "New York",
                "toCity": "London",
                "departureDate": "2024-03-15",
                "tripType": "one-way"
            }
        },
        {
            "name": "Round-trip flight",
            "args": {
                "fromCity": "San Francisco",
                "toCity": "Tokyo",
                "departureDate": "2024-04-01",
                "returnDate": "2024-04-15",
                "tripType": "round-trip"
            }
        }
    ]
    
    for test_case in test_cases:
        print(f"\n=== Testing: {test_case['name']} ===")
        try:
            result = main(test_case['args'])
            print(f"Status Code: {result['statusCode']}")
            
            if result['statusCode'] == 200:
                print("✅ Success!")
                print(f"Completion ID: {result['body']['completionId']}")
                print("Flight Info Preview:")
                flight_info = result['body']['flightInfo']
                print(flight_info[:200] + "..." if len(flight_info) > 200 else flight_info)
            else:
                print("❌ Error:")
                print(json.dumps(result['body'], indent=2))
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")

def test_validation():
    """Test input validation"""
    print("\n=== Testing Input Validation ===")
    
    # Test missing required parameters
    test_args = {
        "fromCity": "New York"
        # Missing toCity and departureDate
    }
    
    result = main(test_args)
    print(f"Missing parameters test - Status: {result['statusCode']}")
    if result['statusCode'] == 400:
        print("✅ Validation working correctly")
    else:
        print("❌ Validation failed")

if __name__ == "__main__":
    print("Starting flight function tests...")
    test_validation()
    test_flight_generation()
    print("\nTests completed!")
