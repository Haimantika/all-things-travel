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
export async function getExperiences(): Promise<Experience[]> {
  try {
    const initResult = await ensureInitialized()
    if (!initResult.success) {
      return []
    }

    // Get all experiences
    const result = await query("SELECT * FROM experiences ORDER BY created_at DESC")
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

    // Insert the new experience
    const result = await query(
      "INSERT INTO experiences (country, experience, user_name) VALUES ($1, $2, $3) RETURNING *",
      [data.country, data.experience, data.userName],
    )

    return {
      success: true,
      experience: result.rows[0],
    }
  } catch (error) {
    console.error("Error adding experience:", error)
    return {
      success: false,
      error: error instanceof Error ? `Database error: ${error.message}` : "Unknown database error",
    }
  }
}



