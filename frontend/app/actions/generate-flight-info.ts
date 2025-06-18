"use server"

import OpenAI from "openai"

// Environment variables will be accessed from .env.local in Next.js
const FLIGHT_AGENT_KEY = process.env.FLIGHT_AGENT_KEY
const FLIGHT_AGENT_BASE_URL = process.env.FLIGHT_AGENT_BASE_URL
const FLIGHT_AGENT_ENDPOINT = FLIGHT_AGENT_BASE_URL ? `${FLIGHT_AGENT_BASE_URL}/api/v1/` : undefined

// Check if we have the required environment variables
const hasRequiredEnvVars = FLIGHT_AGENT_KEY && FLIGHT_AGENT_BASE_URL

// Initialize OpenAI client if we have the required environment variables
const client = hasRequiredEnvVars
  ? new OpenAI({
      apiKey: FLIGHT_AGENT_KEY,
      baseURL: FLIGHT_AGENT_ENDPOINT,
    })
  : null

export async function generateFlightInfo(
  fromCity: string,
  toCity: string,
  departureDate: string,
  returnDate: string | null,
  tripType: "one-way" | "round-trip"
): Promise<string> {
  try {
    console.log(`Starting flight info generation for ${fromCity} to ${toCity}, ${tripType} trip`)

    if (!client) {
      throw new Error("Flight information service is not available. Please try again later.")
    }

    const prompt = `You are a travel agent and your task is to show users flights along with flight numbers based on the source and destination they input.

    Please provide flight information in the following format:

    Outbound Flights (${fromCity} to ${toCity} on ${departureDate}):
    Airline FlightNumber: Departing [Airport] at [Time], arriving [Airport] at [Time] (Flight Duration: [Duration], non-stop/with layover)

    ${tripType === "round-trip" ? `Return Flights (${toCity} to ${fromCity} on ${returnDate}):
    Airline FlightNumber: Departing [Airport] at [Time], arriving [Airport] at [Time] (Flight Duration: [Duration], non-stop/with layover)` : ""}

    For each flight, include:
    - The type of flight (Boeing 737, Airbus A320, etc.)
    - Airline name and flight number
    - Airport codes
    - Exact departure and arrival times
    - Flight duration
    - Layover information if applicable
    - Direct booking links from Skyscanner, Kayak, or Expedia

    Format your response in markdown with clear sections. Do NOT include any extra notes, disclaimers, or introductory text. Only output the flight details as described.`

    const response = await client.chat.completions.create({
      model: "Llama 3.3 Instruct",
      messages: [
        {
          role: "system",
          content:
            "You are an expert travel agent who specializes in finding specific flight information and providing direct booking links. Your responses should be practical and focused on helping travelers find and book their flights easily. Use real-time flight data and provide accurate information.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    console.log("AI response received")
    const content = response.choices[0]?.message?.content || "No response from AI"

    return content
  } catch (error) {
    console.error("Error generating flight information:", error)

    let errorMessage = "Unknown error occurred."

    if (error instanceof OpenAI.RateLimitError) {
      errorMessage = "Rate limit exceeded. Please try again later."
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    throw new Error(`AI Agent Error: ${errorMessage}`)
  }
} 