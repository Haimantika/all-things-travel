const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

// Helper function to generate signature for Hotelbeds API
function generateSignature(apiKey, secret, timestamp) {
    const signatureString = apiKey + secret + timestamp;
    return crypto.createHash('sha256').update(signatureString).digest('hex');
}

// Main function to handle Hotelbeds API calls
async function main(args) {
    try {
        const apiKey = process.env.HOTELBEDS_API_KEY;
        const secret = process.env.HOTELBEDS_SECRET;
        const baseUrl = process.env.HOTELBEDS_API_URL;
        
        // Generate timestamp and signature
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = generateSignature(apiKey, secret, timestamp);

        // Set up headers
        const headers = {
            'Api-Key': apiKey,
            'X-Signature': signature,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        // Example: Get hotels list
        // You can modify the endpoint and parameters based on your needs
        const endpoint = '/hotels';
        const response = await axios.get(`${baseUrl}${endpoint}`, {
            headers,
            params: {
                fields: 'all',
                language: args.language || 'ENG',
                from: args.from || 1,
                to: args.to || 100
            },
            timeout: 10000
        });

        return {
            statusCode: 200,
            body: response.data
        };

    } catch (error) {
        console.error('Error calling Hotelbeds API:', error.message);
        return {
            statusCode: error.response?.status || 500,
            body: {
                error: error.message,
                details: error.response?.data
            }
        };
    }
}

module.exports = { main }; 