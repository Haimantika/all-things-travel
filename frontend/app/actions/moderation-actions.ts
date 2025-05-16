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

// Whitelist of allowed phrases that might otherwise be flagged
const WHITELISTED_PHRASES = [
  "lovely city",
  "what a vibe",
  "great place"
];

/**
 * Moderates content using OpenAI's moderation API with local fallback
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

  const trimmedContent = content.trim();
  const lowerContent = trimmedContent.toLowerCase();
  
  // Check if content is whitelisted
  for (const phrase of WHITELISTED_PHRASES) {
    if (lowerContent.includes(phrase)) {
      // Skip further checks for whitelisted phrases
      return {
        success: true,
        flagged: false,
        reasons: []
      };
    }
  }
  
  // For all fields, check profanity
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(trimmedContent)) {
      return {
        success: true,
        flagged: true,
        reasons: ["Profanity"]
      };
    }
  }
  
  // For name and country fields, simple validation is enough
  if (fieldType === 'name' || fieldType === 'country') {
    // Just check for very long fields or special characters
    if (trimmedContent.length > 50) {
      return {
        success: true,
        flagged: true,
        reasons: [`${fieldType === 'name' ? 'Name' : 'Location'} is too long`]
      };
    }
    
    // Only catch obviously problematic inputs in these fields
    if (/[^\w\s.,'\-()]/i.test(trimmedContent)) {
      return {
        success: true,
        flagged: true,
        reasons: [`${fieldType === 'name' ? 'Name' : 'Location'} contains invalid characters`]
      };
    }

    // Check for gibberish using the API
    try {
      console.log('Checking for gibberish:', trimmedContent);
      
      const response = await fetch('https://gibberish-text-detection.p.rapidapi.com/detect', {
        method: 'POST',
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
          'x-rapidapi-host': 'gibberish-text-detection.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          text: trimmedContent,
          language: 'en'
        })
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        console.error('Gibberish detection API error:', response.status);
        // If API fails, allow the input
        return {
          success: true,
          flagged: false,
          reasons: []
        };
      }

      const data = await response.json();
      console.log('Gibberish detection response:', data);
      
      if (data.isGibberish) {
        console.log('API detected gibberish');
        return {
          success: true,
          flagged: true,
          reasons: [`The ${fieldType} you entered appears to be gibberish`]
        };
      }

      // Input passed all checks
      return {
        success: true,
        flagged: false,
        reasons: []
      };
    } catch (error) {
      console.error('Error calling gibberish detection API:', error);
      // If API fails, allow the input
      return {
        success: true,
        flagged: false,
        reasons: []
      };
    }
  }
  
  // Additional checks for experience field
  
  // 1. Short nonsense text check (catches "saasda" and similar)
  // This specifically targets the issue with short random text
  if (trimmedContent.length < 15 && !trimmedContent.includes(" ") && !/[.!?]/.test(trimmedContent)) {
    // Check for gibberish patterns in short text
    // This is specially designed to catch "saasda" type inputs
    
    // No spaces, no punctuation, just a short string of letters - likely gibberish
    if (/^[a-z]+$/i.test(trimmedContent)) {
      const vowels = (trimmedContent.match(/[aeiou]/gi) || []).length;
      const consonants = trimmedContent.length - vowels;
      
      // Strange consonant/vowel distribution suggests gibberish
      if (vowels === 0 || consonants === 0 || vowels > 2 * consonants || consonants > 2 * vowels) {
        return {
          success: true,
          flagged: true,
          reasons: ["Text appears to be gibberish"]
        };
      }
    }
    
    // Special case: 1-2 characters that aren't common abbreviations
    if (trimmedContent.length <= 2 && !/^(ok|hi|no|us|uk|eu|un|am|pm)$/i.test(trimmedContent)) {
      return {
        success: true,
        flagged: true,
        reasons: ["Text is too short"]
      };
    }
  }
  
  // 2. Checking for keyboard mashing
  if (/([qwfpgjluy]{5,}|[zxcvbnm]{5,}|[asdfghjkl]{5,})/i.test(trimmedContent)) {
    return {
      success: true,
      flagged: true,
      reasons: ["Keyboard mashing detected"]
    };
  }
  
  // 3. Check for repeating characters (like 'aaaaaa')
  if (/(.)\1{4,}/i.test(trimmedContent)) {
    return {
      success: true,
      flagged: true,
      reasons: ["Repeating characters detected"]
    };
  }
  
  // All local checks passed, try the API if available
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: true,
      flagged: false,
      reasons: [],
      error: "API key not configured, using local validation only"
    };
  }

  // If we have an API key, send to OpenAI for additional checking
  try {
    console.log("Sending to OpenAI moderation API:", trimmedContent.substring(0, 50) + (trimmedContent.length > 50 ? "..." : ""));
    
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: trimmedContent,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Moderation API error:", errorData);
      
      // API failed, but we've already passed local validation
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
    
    // API failed, but we've already passed local validation
    return {
      success: true,
      flagged: false,
      reasons: [],
      error: "API error (using local validation)"
    };
  }
} 