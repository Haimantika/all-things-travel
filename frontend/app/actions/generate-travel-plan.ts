"use server"

import OpenAI from "openai"

// Environment variables will be accessed from .env.local in Next.js
const SECURE_AGENT_KEY = process.env.SECURE_AGENT_KEY
const AGENT_BASE_URL = "https://inference.do-ai.run/v1"

// Check if we have the required environment variables
const hasRequiredEnvVars = SECURE_AGENT_KEY

// Initialize OpenAI client if we have the required environment variables
const client = hasRequiredEnvVars
  ? new OpenAI({
      apiKey: SECURE_AGENT_KEY,
      baseURL: AGENT_BASE_URL,
    })
  : null

export async function generateTravelPlan(destination: string, duration = 3, visitMonth = "June"): Promise<string> {
  try {
    console.log(`Starting travel plan generation for ${destination}, ${duration} days in ${visitMonth}`)
    console.log("Environment check:", { hasKey: !!SECURE_AGENT_KEY, baseUrl: AGENT_BASE_URL })

    if (!client) {
      console.warn(
        "Missing agent access key! Using mock data. Ensure SECURE_AGENT_KEY is set in .env.local",
      )
      return getMockTravelPlan(destination, duration, visitMonth)
    }

    const prompt = `Your task is to generate a comprehensive travel plan for a ${duration}-day trip to ${destination} in ${visitMonth}. Make sure to bold the headings.
    
    Please provide:
    1. A ${duration}-day itinerary with day-by-day activities
    2. A detailed packing list tailored to this destination in ${visitMonth} (considering the local weather and conditions)
    3. Local customs and cultural tips
    4. Must-try local foods
    5. Transportation recommendations
    
    Format your response in markdown with clear sections.`

    console.log("Making API call with model:", "llama-3.1-8b-instruct")
    
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instruct",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
    })

    console.log("AI response received")
    const content = response.choices[0]?.message?.content || "No response from AI"

    return content
  } catch (error) {
    console.error("Error generating travel plan:", error)
    console.error("Error details:", {
      name: (error as any)?.name,
      message: (error as any)?.message,
      status: (error as any)?.status,
      code: (error as any)?.code
    })

    // For now, let's return mock data instead of throwing an error
    // so we can see what the actual error is
    console.log("Falling back to mock data due to API error")
    return getMockTravelPlan(destination, duration, visitMonth)
  }
}

// Mock function to return pre-generated travel plans when the API is not available
function getMockTravelPlan(destination: string, duration: number, visitMonth: string): string {
  // Simulate a delay to mimic the API call
  return `# Your ${duration}-Day ${destination} Adventure in ${visitMonth}

## Itinerary Overview

### Day 1: Arrival and Orientation
- Morning: Arrive at ${destination} and check into your accommodation
- Afternoon: Take a leisurely walk around your neighborhood to get oriented
- Evening: Enjoy a welcome dinner at a local restaurant to sample the cuisine

${
  duration >= 2
    ? `
### Day 2: Major Attractions
- Morning: Visit the most famous landmark in ${destination}
- Afternoon: Explore the historical district and its cultural sites
- Evening: Enjoy local entertainment or a night market experience
`
    : ""
}

${
  duration >= 3
    ? `
### Day 3: Local Experiences
- Morning: Take a guided tour of a local specialty (museum, natural site, etc.)
- Afternoon: Participate in a local workshop or cooking class
- Evening: Dine at a highly-rated local restaurant
`
    : ""
}

${
  duration >= 4
    ? `
### Day 4: Day Trip
- Full day: Take a day trip to a nearby attraction or neighboring town
- Evening: Relax and enjoy dinner back in ${destination}
`
    : ""
}

${
  duration >= 5
    ? `
### Day 5: Adventure Day
- Morning: Participate in an outdoor activity popular in ${destination}
- Afternoon: Continue exploring or relax at a local park or beach
- Evening: Try another local cuisine experience
`
    : ""
}

${
  duration > 5
    ? `
### Remaining Days: Deeper Exploration
- Mix of cultural sites, local experiences, relaxation, and perhaps another day trip
- Final day: Last-minute shopping, favorite spots revisited, and departure preparations
`
    : ""
}

## Packing List for ${visitMonth}

${
  ["December", "January", "February"].includes(visitMonth)
    ? "### Winter Essentials\n- Warm jacket\n- Sweaters/layers\n- Gloves and hat\n- Warm socks\n- Waterproof boots"
    : ["March", "April", "May"].includes(visitMonth)
      ? "### Spring Essentials\n- Light jacket\n- Layers for changing temperatures\n- Umbrella or rain jacket\n- Comfortable walking shoes\n- Light scarf"
      : ["June", "July", "August"].includes(visitMonth)
        ? "### Summer Essentials\n- Light, breathable clothing\n- Sun hat and sunglasses\n- Sunscreen\n- Swimwear\n- Sandals and comfortable walking shoes"
        : "### Fall Essentials\n- Medium-weight jacket\n- Layers for changing temperatures\n- Light scarf\n- Comfortable walking shoes\n- Umbrella"
}

### General Items
- Passport and travel documents
- Local currency and credit cards
- Phone and charger
- Camera
- Travel adapter
- Toiletries
- First aid kit with basic medications
- Reusable water bottle

## Local Customs and Cultural Tips

- Research local customs and etiquette specific to ${destination}
- Learn a few basic phrases in the local language
- Be aware of appropriate dress codes for religious sites
- Understand tipping customs and local payment methods
- Respect local traditions and customs

## Must-Try Local Foods

${destination} is known for its delicious cuisine. Be sure to try:
- Regional specialties
- Street food favorites
- Traditional desserts
- Local beverages

## Transportation Recommendations

- Research the best ways to get around ${destination}
- Consider public transportation options
- Look into tourist passes that might save money
- Determine if renting a vehicle makes sense for your itinerary
- Download relevant transportation apps before your trip

Enjoy your ${duration}-day adventure in ${destination}!`
}
