import os
from gradient import Gradient
from typing import Dict, Any, Optional
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def main(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main function to generate flight information using Gradient SDK
    
    Args:
        args: Dictionary containing:
            - fromCity: Source city name
            - toCity: Destination city name  
            - departureDate: Departure date
            - returnDate: Return date (optional)
            - tripType: "one-way" or "round-trip"
    
    Returns:
        Dictionary with statusCode and body containing flight information
    """
    try:
        # Extract parameters from args
        from_city = args.get('fromCity')
        to_city = args.get('toCity')
        departure_date = args.get('departureDate')
        return_date = args.get('returnDate')
        trip_type = args.get('tripType', 'one-way')
        
        # Validate required parameters
        if not all([from_city, to_city, departure_date]):
            raise ValueError('fromCity, toCity, and departureDate are required parameters')
        
        # Get Gradient agent key and base URL from environment
        agent_key = os.getenv('FLIGHT_AGENT_KEY')
        agent_base_url = os.getenv('FLIGHT_AGENT_BASE_URL')
        
        if not agent_key or not agent_base_url:
            raise ValueError('FLIGHT_AGENT_KEY and FLIGHT_AGENT_BASE_URL environment variables are required')
        
        # Initialize Gradient client with agent endpoint
        client = Gradient(
            agent_access_key=agent_key,
            agent_endpoint=agent_base_url
        )
        
        # Create the prompt for flight information
        return_flight_section = ""
        if trip_type == "round-trip" and return_date:
            return_flight_section = f"\nReturn Flights ({to_city} to {from_city} on {return_date}):\nAirline FlightNumber: Departing [Airport] at [Time], arriving [Airport] at [Time] (Flight Duration: [Duration], non-stop/with layover)"
        
        prompt = f"""You are a travel agent and your task is to show users flights along with flight numbers based on the source and destination they input.

Please provide flight information in the following format:

Outbound Flights ({from_city} to {to_city} on {departure_date}):
Airline FlightNumber: Departing [Airport] at [Time], arriving [Airport] at [Time] (Flight Duration: [Duration], non-stop/with layover){return_flight_section}

For each flight, include:
- The type of flight (Boeing 737, Airbus A320, etc.)
- Airline name and flight number
- Airport codes
- Exact departure and arrival times
- Flight duration
- Layover information if applicable
- Direct booking links from Skyscanner, Kayak, or Expedia

Format your response in markdown with clear sections. Do NOT include any extra notes, disclaimers, or introductory text. Only output the flight details as described."""

        # Create messages for the chat completion
        messages = [
            {
                "role": "system",
                "content": "You are an expert travel agent who specializes in finding specific flight information and providing direct booking links. Your responses should be practical and focused on helping travelers find and book their flights easily. Use real-time flight data and provide accurate information."
            },
            {
                "role": "user", 
                "content": prompt
            }
        ]
        
        # Make the API call to Gradient
        completion = client.agents.chat.completions.create(
            messages=messages,
            model="llama3-8b-instruct",
            temperature=0.7,
            max_tokens=2000
        )
        
        # Extract the response content
        flight_info = completion.choices[0].message.content if completion.choices else "No response from AI"
        
        return {
            "statusCode": 200,
            "body": {
                "flightInfo": flight_info,
                "completionId": completion.id,
                "fromCity": from_city,
                "toCity": to_city,
                "departureDate": departure_date,
                "returnDate": return_date,
                "tripType": trip_type
            }
        }
        
    except ValueError as e:
        return {
            "statusCode": 400,
            "body": {
                "error": str(e),
                "type": "validation_error"
            }
        }
    except Exception as e:
        print(f"Error generating flight information: {str(e)}")
        return {
            "statusCode": 500,
            "body": {
                "error": f"Internal server error: {str(e)}",
                "type": "server_error"
            }
        }

# For local testing
if __name__ == "__main__":
    # Example usage
    test_args = {
        "fromCity": "New York",
        "toCity": "London", 
        "departureDate": "2024-03-15",
        "returnDate": "2024-03-22",
        "tripType": "round-trip"
    }
    
    result = main(test_args)
    print(json.dumps(result, indent=2))
