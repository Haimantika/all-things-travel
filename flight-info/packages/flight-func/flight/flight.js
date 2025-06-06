import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Main function to handle TripAdvisor API calls
export async function main(args) {
    try {
        // Take sourceAirportCode and destinationAirportCode from user input
        const sourceAirportCode = args.sourceAirportCode;
        const destinationAirportCode = args.destinationAirportCode;

        // Validate required parameters
        if (!sourceAirportCode || !destinationAirportCode) {
            throw new Error('sourceAirportCode and destinationAirportCode are required parameters');
        }

        const apiKey = process.env.TRIPADVISOR_API_KEY;
        const apiHost = process.env.TRIPADVISOR_API_HOST;
        const baseUrl = process.env.TRIPADVISOR_API_URL;

        // Set up headers
        const headers = {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': apiHost,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        // Use the parameters provided by the user
        const params = {
            sourceAirportCode,
            destinationAirportCode,
            itineraryType: args.itineraryType,
            sortOrder: args.sortOrder,
            numAdults: args.numAdults,
            numSeniors: args.numSeniors,
            classOfService: args.classOfService,
            pageNumber: args.pageNumber,
            nearby: args.nearby,
            nonstop: args.nonstop,
            currencyCode: args.currencyCode,
            region: args.region
        };

        // Remove undefined parameters
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

        // Make the API call
        const response = await axios.get(`${baseUrl}/searchFlights`, {
            headers,
            params,
            timeout: 10000
        });

        // Remove purchaseLinks from each flight
        if (response.data && Array.isArray(response.data.flights)) {
            response.data.flights.forEach(flight => {
                delete flight.purchaseLinks;
            });
        }

        return {
            statusCode: 200,
            body: response.data
        };

    } catch (error) {
        console.error('Error calling TripAdvisor API:', error.message);
        return {
            statusCode: error.response?.status || 500,
            body: {
                error: error.message,
                details: error.response?.data
            }
        };
    }
}
