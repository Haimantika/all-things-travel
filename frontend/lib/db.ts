import { Pool } from "pg"

// Create a connection pool with improved error handling
let pool: Pool | null = null

// Initialize the pool lazily to avoid issues during build time
function getPool() {
  if (!pool) {
    // Check if we're in a Node.js environment
    if (typeof process !== "undefined" && process.env) {
      try {
        pool = new Pool({
          connectionString: process.env.DATABASE_URL || createConnectionString(),
          ssl: { rejectUnauthorized: false },
        })

        // Log connection events for debugging
        pool.on("connect", () => {
          console.log("Connected to PostgreSQL database")
        })

        pool.on("error", (err) => {
          console.error("Unexpected PostgreSQL error:", err)
          // Reset the pool if there's a fatal error
          if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
            pool = null
          }
        })
      } catch (error) {
        console.error("Failed to initialize database pool:", error)
        throw error
      }
    } else {
      throw new Error("Cannot initialize database pool outside of Node.js environment")
    }
  }
  return pool
}

// Create a connection string from individual environment variables
function createConnectionString() {
  const host = process.env.POSTGRES_HOST
  const port = process.env.POSTGRES_PORT || "5432"
  const database = process.env.POSTGRES_DATABASE
  const user = process.env.POSTGRES_USER
  const password = process.env.POSTGRES_PASSWORD

  if (!host || !database || !user || !password) {
    throw new Error("Missing required database configuration")
  }

  return `postgres://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`
}

// Helper function to execute SQL queries with better error handling
export async function query(text: string, params?: any[]) {
  try {
    const client = await getPool().connect()
    try {
      const res = await client.query(text, params)
      return res
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error executing query", { text, error })
    throw error
  }
}

// Initialize the database with required tables
export async function initializeDatabase() {
  try {
    // Create experiences table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS experiences (
        id SERIAL PRIMARY KEY,
        country VARCHAR(100) NOT NULL,
        experience TEXT NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    return { success: true }
  } catch (error) {
    console.error("Failed to initialize database", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}


