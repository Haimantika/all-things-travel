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
  /[^\w\s.,!?;:'"()]{5,}/,  // 5+ special characters in a row
  /(?:[bcdfghjklmnpqrstvwxz]{6,})/i,  // 6+ consonants in a row (increased from 5)
  /[qwfpgjluyxzcbnm]{8,}/i,  // 8+ common keyboard mash characters (increased from 7)
  /(?:[aeiou]{8,})/i,  // 8+ vowels in a row (increased from 7)
  /(?:[a-z]{4,}[0-9]{4,})/i,  // 4+ letters followed by 4+ numbers
  /^[a-z]{1,2}[a-z0-9]{8,}$/i,  // Random short word followed by random characters (increased from 7)
  /^(?=.*[g-z])(?=.*[a-f])[a-z]{10,}$/i,  // Long strings with specific character combinations (increased from 9)
  /(?:(?:[^aeiou]{3,}[aeiou]){3,}[^aeiou]{3,})/i  // Modified consonant-vowel pattern (increased from 2 to 3)
];

// Common English dictionary words (expanded list for meaningful content check)
const COMMON_WORDS = new Set([
  // Original words
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", 
  "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", 
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", 
  "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him",
  "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than",
  "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two",
  "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give",
  "day", "most", "us", 
  
  // Travel-related words
  "travel", "place", "visit", "city", "country", "food", "experience", "hotel", 
  "beach", "mountain", "trip", "vacation", "tour", "sight", "park", "museum", "restaurant",
  "view", "beautiful", "amazing", "great", "awesome", "love", "loved", "lovely", "nice", "best",
  
  // Common adjectives
  "good", "bad", "big", "small", "happy", "sad", "hot", "cold", "new", "old", "high", "low",
  "long", "short", "easy", "hard", "fast", "slow", "early", "late", "young", "old", "right", "wrong",
  "true", "false", "rich", "poor", "strong", "weak", "busy", "free", "safe", "dangerous",
  
  // Common verbs
  "go", "come", "take", "make", "get", "see", "look", "find", "give", "tell", "work", "call", "try",
  "ask", "need", "feel", "become", "leave", "put", "mean", "keep", "let", "begin", "seem", "help",
  "talk", "turn", "start", "show", "hear", "play", "run", "move", "live", "believe", "bring",
  
  // Common nouns
  "time", "year", "day", "way", "thing", "man", "woman", "life", "child", "world", "school", "state",
  "family", "student", "group", "friend", "word", "place", "case", "part", "eye", "job", "week", "system",
  
  // Short words that might be part of phrases
  "am", "is", "are", "was", "were", "has", "had", "does", "did", "can", "could", "will", "would", "should",
  "may", "might", "must", "ought", "hi", "bye", "vibe", "wow", "yes", "no", "oh", "ah", "hmm", "ok", "okay"
]);

/**
 * Check if text has enough meaningful content
 * @param content Text to analyze
 * @returns True if meaningful content is found
 */
function hasMeaningfulContent(content: string): boolean {
  // Short phrases are always considered meaningful
  if (content.length < 30) return true;
  
  // For medium-length content, be lenient
  if (content.length < 50) {
    // Just check if it has at least one common word or looks like a sentence
    const words = content.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z]/g, ''));
    const hasCommonWord = words.some(word => COMMON_WORDS.has(word));
    const hasSentenceStructure = /[.?!]/.test(content); // Has punctuation
    
    return hasCommonWord || hasSentenceStructure;
  }
  
  // For longer content, do a more thorough check
  // Split text into words and normalize
  const words = content.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z]/g, ''));
  const filteredWords = words.filter(w => w.length > 2); // Only consider words with 3+ chars
  
  // Lower threshold - now only 10% of words need to be common English
  const meaningfulWords = filteredWords.filter(word => COMMON_WORDS.has(word));
  return meaningfulWords.length >= Math.max(1, filteredWords.length * 0.1);
}

/**
 * Check for random characters with no pattern/meaning
 * @param content Text to analyze
 * @returns True if text looks random
 */
function looksRandom(content: string): boolean {
  // Don't check short phrases
  if (content.length < 25) return false;
  
  // For longer content, check consonant-vowel ratio
  // Normal English has roughly 40% vowels, but with more tolerance
  const vowels = (content.match(/[aeiou]/gi) || []).length;
  const consonants = (content.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;
  
  if (consonants + vowels > 10) { // Only check if enough letters to analyze
    const vowelRatio = vowels / (consonants + vowels);
    // More extreme vowel ratios to only catch very unusual text
    if (vowelRatio < 0.05 || vowelRatio > 0.9) {
      return true;
    }
  }
  
  // Check for too many repeated characters of different kinds (keyboard mashing)
  // Only flag if very extreme ratio of unique chars to length
  const uniqueChars = new Set(content.toLowerCase()).size;
  if (content.length > 20 && uniqueChars < content.length * 0.2) {
    return true;
  }
  
  return false;
}

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
  
  // Check for gibberish patterns
  for (const pattern of GIBBERISH_PATTERNS) {
    if (pattern.test(content)) {
      return {
        valid: false,
        reason: "Gibberish or suspicious patterns"
      };
    }
  }
  
  // More advanced checks for gibberish without clear patterns
  if (content.length > 7) {
    // For longer text, verify it has meaningful content
    if (!hasMeaningfulContent(content) && looksRandom(content)) {
      return {
        valid: false, 
        reason: "Gibberish or nonsense text"
      };
    }
  }
  
  return { valid: true };
}

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

  // Only check for profanity in location and name fields, not complex gibberish patterns
  if (fieldType === 'country' || fieldType === 'name') {
    // Only check for profanity in these fields
    for (const pattern of PROFANITY_PATTERNS) {
      if (pattern.test(content)) {
        console.log(`Profanity found in ${fieldType} field: ${content}`);
        return {
          success: true,
          flagged: true,
          reasons: ["Profanity"]
        };
      }
    }
    
    // Validate location name length (most real locations aren't extremely long)
    if (fieldType === 'country' && content.length > 50) {
      return {
        success: true,
        flagged: true,
        reasons: ["Location name is unusually long"]
      };
    }
    
    // For names, only check for obvious gibberish
    if (fieldType === 'name') {
      // Some simple checks for names (no numbers, no excessive special chars)
      if (/\d{3,}/.test(content) || /[^\w\s.,\-']{2,}/.test(content)) {
        return {
          success: true,
          flagged: true,
          reasons: ["Name contains invalid characters"]
        };
      }
    }
    
    // For location and name fields, we're more lenient, so pass validation
    return {
      success: true,
      flagged: false,
      reasons: []
    };
  }
  
  // For experience field or general content, use full validation
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