# Flight Information Generator - Gradient SDK

This Python function generates detailed flight information using the Gradient SDK and your custom agent endpoint.

## Quick Start

1. **Setup** (one-time):
   ```bash
   ./setup.sh
   ```

2. **Set Environment Variables**:
   ```bash
   export FLIGHT_AGENT_KEY="your_agent_key"
   export FLIGHT_AGENT_BASE_URL="your_agent_url"
   ```

3. **Test**:
   ```bash
   python3 test_flight.py
   ```

4. **Run**:
   ```bash
   python3 flight.py
   ```

## Features

- Generate flight information for one-way and round-trip flights
- Uses Gradient SDK for AI-powered flight recommendations
- Provides detailed flight information including:
  - Airline names and flight numbers
  - Aircraft types
  - Airport codes
  - Departure and arrival times
  - Flight duration
  - Layover information
  - Direct booking links

## Setup

### Option 1: Automated Setup (Recommended)
```bash
./setup.sh
```

### Option 2: Manual Setup
1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set your Gradient agent credentials:
   ```bash
   export FLIGHT_AGENT_KEY="your_agent_key"
   export FLIGHT_AGENT_BASE_URL="your_agent_url"
   ```

## Usage

### Function Parameters

The `main()` function accepts a dictionary with the following parameters:

- `fromCity` (required): Source city name
- `toCity` (required): Destination city name  
- `departureDate` (required): Departure date in YYYY-MM-DD format
- `returnDate` (optional): Return date for round-trip flights
- `tripType` (optional): "one-way" or "round-trip" (default: "one-way")

### Example Usage

```python
from flight import main

# One-way flight
args = {
    "fromCity": "New York",
    "toCity": "London",
    "departureDate": "2024-03-15",
    "tripType": "one-way"
}

result = main(args)
print(result['body']['flightInfo'])

# Round-trip flight
args = {
    "fromCity": "San Francisco",
    "toCity": "Tokyo",
    "departureDate": "2024-04-01",
    "returnDate": "2024-04-15",
    "tripType": "round-trip"
}

result = main(args)
print(result['body']['flightInfo'])
```

## Response Format

The function returns a dictionary with:

```json
{
  "statusCode": 200,
  "body": {
    "flightInfo": "Markdown formatted flight information",
    "completionId": "gradient_completion_id",
    "fromCity": "New York",
    "toCity": "London",
    "departureDate": "2024-03-15",
    "returnDate": "2024-04-15",
    "tripType": "round-trip"
  }
}
```

## Testing

Run the test suite:

```bash
python3 test_flight.py
```

Or run the build script:

```bash
./build_python.sh
```

## Environment Variables

- `FLIGHT_AGENT_KEY`: Your Gradient agent access key (required)
- `FLIGHT_AGENT_BASE_URL`: Your Gradient agent endpoint URL (required)

## Error Handling

The function handles various error scenarios:

- **400**: Validation errors (missing required parameters)
- **500**: Server errors (API failures, network issues)

## Project Structure

```
gradient-sdk/
├── flight.py              # Main flight information generator
├── test_flight.py         # Test suite
├── requirements.txt       # Python dependencies
├── setup.sh              # Automated setup script
├── build_python.sh       # Build and test script
├── package.json          # Project metadata
└── README.md             # This file
```

## Migration from JavaScript

This Python implementation replaces the previous JavaScript version that used the TripAdvisor API. The new version:

- Uses AI-powered flight recommendations instead of real-time API data
- Provides more detailed and contextual flight information
- Supports both one-way and round-trip flights
- Includes booking links and comprehensive flight details
- Integrates with your custom Gradient agent endpoint
