"use server"

export interface ModerationResponse {
  success: boolean
  flagged: boolean
  reasons: string[]
  error?: string
}

// Basic profanity list as fallback in case the API is unavailable
const PROFANITY_PATTERNS = [
  /\bf+u+c+k+\w*\b/i,
  /\bs+h+i+t+\w*\b/i,
  /\ba+s+s+h+o+l+e+\w*\b/i,
  /\bb+i+t+c+h+\w*\b/i,
  /\bc+u+n+t+\w*\b/i
];

// Gibberish detection - repeated characters, excessive special chars, or random strings
const GIBBERISH_PATTERNS = [
  /(\w)\1{5,}/,  // 6+ of the same character in a row
  /[^\w\s.,!?;:'"()]{5,}/  // 5+ special characters in a row
];

/**
 * Simple local content validation as fallback
 * @param content The content to check
 * @returns Basic validation result
 */
function localContentValidation(content: string): { valid: boolean, reason?: string } {
  // Check for profanity
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(content)) {
      return {
        valid: false,
        reason: "Profanity"
      };
    }
  }
  
  // Check for gibberish
  for (const pattern of GIBBERISH_PATTERNS) {
    if (pattern.test(content)) {
      return {
        valid: false,
        reason: "Gibberish or suspicious patterns"
      };
    }
  }
  
  return { valid: true };
}

/**
 * Moderates content using OpenAI's moderation API with local fallback
 * @param content The text content to be moderated
 * @returns Response object with flagged status and reasons if any
 */
export async function moderateContent(content: string): Promise<ModerationResponse> {
  // Early check for empty content
  if (!content || content.trim().length === 0) {
    return {
      success: true,
      flagged: false,
      reasons: []
    };
  }
  
  // Run local validation first as a quick check
  const localCheck = localContentValidation(content);
  if (!localCheck.valid) {
    console.log(`Content flagged by local validation: ${localCheck.reason}`);
    return {
      success: true,
      flagged: true,
      reasons: [localCheck.reason || "Inappropriate content"]
    };
  }

  // Check if we have an API key
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set in environment variables");
    
    // Even without API key, we've done local validation
    return {
      success: true,
      flagged: false,
      reasons: [],
      error: "API key not configured, using limited local validation only."
    };
  }

  try {
    console.log("Sending to OpenAI moderation API:", content.substring(0, 50) + (content.length > 50 ? "..." : ""));
    
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: content,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Moderation API error:", errorData);
      
      // API failed, but we already ran local validation as backup
      return {
        success: true,
        flagged: false,
        reasons: [],
        error: `API error (using local validation): ${response.status}`
      };
    }

    const data = await response.json();
    console.log("Moderation API response:", JSON.stringify(data));
    
    // Extract moderation results
    const result = data.results[0];
    const flagged = result.flagged;
    
    // Collect flagged categories
    const reasons: string[] = [];
    if (result.categories) {
      Object.entries(result.categories).forEach(([category, isFlagged]) => {
        if (isFlagged) {
          // Convert from snake_case to readable format
          const readableCategory = category
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          reasons.push(readableCategory);
        }
      });
    }

    return {
      success: true,
      flagged,
      reasons,
    };
  } catch (error) {
    console.error("Error calling moderation API:", error);
    
    // Even if API call fails, we've already done local validation
    return {
      success: true,
      flagged: false,
      reasons: [],
      error: "API error (using local validation)"
    };
  }
} 