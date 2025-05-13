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




