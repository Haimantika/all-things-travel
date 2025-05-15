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

// Obvious gibberish patterns
const GIBBERISH_PATTERNS = [
  /(\w)\1{5,}/,                   // 6+ of the same character in a row
  /[^\w\s.,!?;:'"()]{4,}/,        // 4+ special characters in a row
  /[qwfpgjluyxzcbnm]{6,}/i,       // 6+ keyboard mash characters in a row
  /^[a-z]{1,2}[a-z0-9]{6,}$/i,    // Random short word followed by random characters
  /^[^\s]{1,2}[^\s]{6,}$/         // Any short prefix followed by gibberish
];

// Known good phrases that should never be flagged
const ALLOWED_PHRASES = [
  "lovely city",
  "what a vibe",
  "great place",
  "beautiful"
];

/**
 * Check if content is most likely gibberish based on simplified rules
 * @param content Text to check
 * @param fieldType Type of field being checked
 * @returns Object with validation result
 */
function validateContent(content: string, fieldType: string): { valid: boolean, reason?: string } {
  // Allow very short content
  if (content.length <= 3) {
    return { valid: true };
  }
  
  // Check for profanity in all fields
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(content)) {
      return {
        valid: false,
        reason: "Profanity"
      };
    }
  }
  
  // For name and location fields, only check for obvious problems
  if (fieldType === 'country' || fieldType === 'name') {
    // For country names, basic validations are enough
    if (content.length > 40) {
      return {
        valid: false,
        reason: "Name too long"
      };
    }
    
    // Very simple gibberish check for location/name
    if (/^[a-z]{1,2}[a-z]{5,}$/i.test(content) && !/\s/.test(content)) {
      return {
        valid: false,
        reason: "Invalid text pattern"
      };
    }
    
    // Otherwise consider it valid
    return { valid: true };
  }
  
  // For experiences, check known good phrases first
  const lowercaseContent = content.toLowerCase();
  for (const phrase of ALLOWED_PHRASES) {
    if (lowercaseContent.includes(phrase)) {
      return { valid: true };
    }
  }
  
  // If it's a normal-looking short sentence with punctuation, consider it valid
  if (/^[A-Z][^.!?]*[.!?](\s+[A-Z][^.!?]*[.!?])*$/.test(content)) {
    return { valid: true };
  }
  
  // For obvious gibberish in experience field
  for (const pattern of GIBBERISH_PATTERNS) {
    if (pattern.test(content)) {
      return {
        valid: false,
        reason: "Gibberish detected"
      };
    }
  }
  
  // Check for random character sequences
  if (content.length > 5) {
    // If experience is just a jumble of a few letters without spaces, flag it
    if (content.length < 10 && !/\s/.test(content) && !/^[A-Za-z]+$/.test(content)) {
      return {
        valid: false,
        reason: "Random character sequence"
      };
    }
    
    // Catch "saasda" style gibberish - short words with no meaning
    if (content.length < 15 && !/\s/.test(content) && !/[.!?]/.test(content)) {
      // Check if it looks like a random short word
      const vowels = (content.match(/[aeiou]/gi) || []).length;
      const consonants = content.length - vowels;
      
      // If there's a strange vowel-consonant ratio, flag it
      if (vowels === 0 || consonants === 0 || vowels > consonants * 3 || consonants > vowels * 3) {
        return {
          valid: false,
          reason: "Suspicious text pattern"
        };
      }
    }
  }
  
  return { valid: true };
}

/**
 * Moderates content using both local checks and OpenAI's moderation API when available
 * @param content The text content to be moderated
 * @param fieldType The type of field being moderated (affects strictness)
 * @returns Response object with flagged status and reasons if any
 */
export async function moderateContent(
  content: string, 
  fieldType: 'country' | 'name' | 'experience' | 'general' = 'general'
): Promise<ModerationResponse> {
  // Early check for empty content
  if (!content || content.trim().length === 0) {
    return {
      success: true,
      flagged: false,
      reasons: []
    };
  }
  
  // Run local validation first as a quick check
  const localCheck = validateContent(content.trim(), fieldType);
  if (!localCheck.valid) {
    console.log(`Content flagged by local validation: ${localCheck.reason}`);
    return {
      success: true,
      flagged: true,
      reasons: [localCheck.reason || "Inappropriate content"]
    };
  }

  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set in environment variables");
    return {
      success: true,
      flagged: false,
      reasons: [],
      error: "API key not configured, using local validation only."
    };
  }

  // If we have OpenAI API key, use it as an additional check
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