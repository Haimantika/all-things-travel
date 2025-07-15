"use server"

import OpenAI from "openai"

// Ensure we have the API key from environment
const apiKey = process.env.SECURE_AGENT_KEY
if (!apiKey) {
  throw new Error("SECURE_AGENT_KEY environment variable is required")
}

const client = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://inference.do-ai.run/v1",
  timeout: 30000, // 30 second timeout
  maxRetries: 3
})

export async function generateTravelPlan(destination: string, duration = 3, visitMonth = "June"): Promise<string> {
  try {
    const prompt = `Your task is to generate a comprehensive travel plan for a ${duration}-day trip to ${destination} in ${visitMonth}. Make sure to bold the headings.

Please provide:
1. A ${duration}-day itinerary with day-by-day activities
2. A packing list tailored to this destination in ${visitMonth} (considering the local weather and conditions)
3. Must-try local foods
4. Local tansportation recommendations

Format your response in markdown with clear sections.`

    const response = await client.chat.completions.create({
      model: "llama3-8b-instruct",
      messages: [
        {
          role: "developer",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_completion_tokens: 1000,
      temperature: 0.7,
    })
    
    // Handle the response properly
    let choices: any[] = []
    
    if (typeof response === 'string') {
      // If response is a string, try to parse it
      try {
        const parsedResponse = JSON.parse(response)
        choices = parsedResponse.choices || []
      } catch (parseError) {
        return "Travel plan generation is currently unavailable. Please try again later."
      }
    } else if (response && typeof response === 'object') {
      // If response is already an object
      choices = response.choices || []
    }

    // Extract content from choices
    if (choices.length > 0 && choices[0]?.message?.content) {
      return choices[0].message.content
    }

    // If no content in choices, return a fallback message
    return "Travel plan generation is currently unavailable. Please try again later."
      } catch (error) {
      console.error("Error generating travel plan:", error)
      throw new Error(`Failed to generate travel plan: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
    }
}
