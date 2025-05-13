import { NextResponse } from "next/server"
import { query, initializeDatabase } from "@/lib/db"

// Initialize the database when the API is first accessed
let initialized = false

async function ensureInitialized() {
  if (!initialized) {
    await initializeDatabase()
    initialized = true
  }
}

// GET handler to retrieve all experiences
export async function GET(request: Request) {
  try {
    await ensureInitialized()

    // Get query parameters
    const url = new URL(request.url)
    const country = url.searchParams.get("country")

    let result

    if (country) {
      // Filter by country if provided
      result = await query("SELECT * FROM experiences WHERE country = $1 ORDER BY created_at DESC", [country])
    } else {
      // Get all experiences
      result = await query("SELECT * FROM experiences ORDER BY created_at DESC")
    }

    return NextResponse.json({ experiences: result.rows })
  } catch (error) {
    console.error("Error fetching experiences:", error)
    return NextResponse.json({ error: "Failed to fetch experiences" }, { status: 500 })
  }
}

// POST handler to add a new experience
export async function POST(request: Request) {
  try {
    await ensureInitialized()

    const body = await request.json()
    const { country, experience, userName } = body

    // Validate required fields
    if (!country || !experience || !userName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate maximum length
    if (experience.length > 500) {
      return NextResponse.json({ error: "Experience is too long (maximum 500 characters)" }, { status: 400 })
    }

    // Insert the new experience
    const result = await query(
      "INSERT INTO experiences (country, experience, user_name) VALUES ($1, $2, $3) RETURNING *",
      [country, experience, userName],
    )

    return NextResponse.json({ experience: result.rows[0] })
  } catch (error) {
    console.error("Error adding experience:", error)
    return NextResponse.json({ error: "Failed to add experience" }, { status: 500 })
  }
}