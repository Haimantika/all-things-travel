import { Pool } from "pg"

// Define a custom error interface for PostgreSQL errors
interface PostgresError extends Error {
  code?: string;
}

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

        pool.on("error", (err: PostgresError) => {
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

    // Apply migrations - even if migrations fail, we can continue
    try {
      await applyMigrations();
    } catch (migrationError) {
      console.error("Migration error - continuing with base functionality:", migrationError);
      // Migrations failed but base table exists, so we can continue
    }
    
    return { success: true }
  } catch (error) {
    console.error("Failed to initialize database", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Apply migrations
async function applyMigrations() {
  try {
    // Create migrations table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(100) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // List of all migrations to apply in order
    const migrations = [
      {
        name: "add_moderation_passed_column",
        apply: async () => {
          try {
            // Check if the column already exists to avoid errors
            const columnCheck = await query(`
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = 'experiences' AND column_name = 'moderation_passed'
            `);
            
            // Only add the column if it doesn't exist
            if (columnCheck.rowCount === 0) {
              console.log("Adding moderation_passed column to experiences table");
              
              // Add moderation_passed column to experiences table
              await query(`
                ALTER TABLE experiences 
                ADD COLUMN moderation_passed BOOLEAN DEFAULT FALSE
              `);
      
              // Mark existing records as moderation passed (for backward compatibility)
              await query(`
                UPDATE experiences
                SET moderation_passed = TRUE
                WHERE moderation_passed IS NULL OR moderation_passed = FALSE
              `);
              
              console.log("Successfully added moderation_passed column");
            } else {
              console.log("Column moderation_passed already exists");
            }
            return true;
          } catch (error) {
            console.error("Failed to add moderation_passed column:", error);
            // Continue execution even if this migration fails
            // The application code has a fallback mechanism
            return false;
          }
        }
      }
      // Add future migrations here
    ];
    
    // Apply each migration if not already applied
    for (const migration of migrations) {
      try {
        // Check if migration has already been applied
        const migrationCheck = await query(
          "SELECT * FROM migrations WHERE migration_name = $1",
          [migration.name]
        );
  
        // If migration hasn't been applied, try to apply it
        if (migrationCheck.rowCount === 0) {
          console.log(`Applying migration: ${migration.name}`);
          
          // Attempt to apply the migration
          const success = await migration.apply();
          
          if (success) {
            // Record that the migration has been applied
            await query(
              "INSERT INTO migrations (migration_name) VALUES ($1)",
              [migration.name]
            );
            console.log(`Migration applied successfully: ${migration.name}`);
          } else {
            console.warn(`Migration partially failed but continuing: ${migration.name}`);
          }
        } else {
          console.log(`Migration already applied: ${migration.name}`);
        }
      } catch (error) {
        console.error(`Error applying migration ${migration.name}:`, error);
        // Continue to next migration rather than failing the entire process
      }
    }
  } catch (error) {
    console.error("Failed to initialize migrations table:", error);
    // Don't throw - allow the application to continue even if migrations fail
  }
}


