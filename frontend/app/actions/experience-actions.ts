"use server"

import { query, initializeDatabase } from "@/lib/db"

// Initialize the database when the server actions are first accessed
let initialized = false

async function ensureInitialized() {
  if (!initialized) {
    try {
      const result = await initializeDatabase()
      initialized = result.success
      return result
    } catch (error) {
      console.error("Database initialization error:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }
  return { success: true }
}

export interface Experience {
  id: number
  country: string
  experience: string
  user_name: string
  created_at: string
}

// Get all experiences
export async function getExperiences(country?: string): Promise<Experience[]> {
  try {
    const initResult = await ensureInitialized()
    if (!initResult.success) {
      return []
    }

    let result

    if (country) {
      // Filter by country if provided
      result = await query("SELECT * FROM experiences WHERE country = $1 ORDER BY created_at DESC", [country])
    } else {
      // Get all experiences
      result = await query("SELECT * FROM experiences ORDER BY created_at DESC")
    }

    return result.rows
  } catch (error) {
    console.error("Error fetching experiences:", error)
    return []
  }
}

// Add a new experience
export async function addExperience(data: {
  country: string
  experience: string
  userName: string
  moderationPassed?: boolean
}): Promise<{ success: boolean; error?: string; experience?: Experience }> {
  try {
    const initResult = await ensureInitialized()
    if (!initResult.success) {
      return {
        success: false,
        error: `Database initialization failed: ${initResult.error}`,
      }
    }

    // Validate required fields
    if (!data.country || !data.experience || !data.userName) {
      return {
        success: false,
        error: "Missing required fields",
      }
    }

    // Validate maximum length
    if (data.experience.length > 500) {
      return {
        success: false,
        error: "Experience is too long (maximum 500 characters)",
      }
    }

    // Security check: log if no moderation was performed
    if (data.moderationPassed !== true) {
      console.warn(
        "WARNING: Experience being submitted without moderation confirmation.",
        { 
          experience: data.experience.substring(0, 50) + (data.experience.length > 50 ? "..." : "")
        }
      );
    }

    // Try to insert with moderation_passed column first
    try {
      const result = await query(
        "INSERT INTO experiences (country, experience, user_name, moderation_passed) VALUES ($1, $2, $3, $4) RETURNING *",
        [data.country, data.experience, data.userName, !!data.moderationPassed],
      )
      
      return {
        success: true,
        experience: result.rows[0],
      }
    } catch (columnError: any) {
      // If error mentions moderation_passed column, fall back to insertion without it
      if (columnError.message && columnError.message.includes("moderation_passed")) {
        console.warn("Column 'moderation_passed' does not exist, falling back to basic insertion");
        
        // Fallback: insert without the moderation_passed column
        const fallbackResult = await query(
          "INSERT INTO experiences (country, experience, user_name) VALUES ($1, $2, $3) RETURNING *",
          [data.country, data.experience, data.userName],
        )
        
        return {
          success: true,
          experience: fallbackResult.rows[0],
        }
      } else {
        // If it's some other error, rethrow it
        throw columnError;
      }
    }
  } catch (error) {
    console.error("Error adding experience:", error)
    return {
      success: false,
      error: error instanceof Error ? `Database error: ${error.message}` : "Unknown database error",
    }
  }
}

// Get unique countries with counts
export async function getCountriesWithCounts(): Promise<{ country: string; count: number }[]> {
  try {
    const initResult = await ensureInitialized()
    if (!initResult.success) {
      return []
    }

    const result = await query(`
      SELECT country, COUNT(*) as count 
      FROM experiences 
      GROUP BY country 
      ORDER BY count DESC
    `)

    return result.rows
  } catch (error) {
    console.error("Error fetching countries with counts:", error)
    return []
  }
}




