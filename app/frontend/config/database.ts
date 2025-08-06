import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "dindin_db",
  user: process.env.DB_USER || "dindin_user",
  password: process.env.DB_PASSWORD,

  // Connection pool settings
  min: 2, // minimum number of connections in pool
  max: 20, // maximum number of connections in pool
  idleTimeoutMillis: 30000, // close connections after 30 seconds of inactivity
  connectionTimeoutMillis: 10000, // return error after 10 seconds if connection could not be established

  // SSL configuration for production
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Error handling for pool
pool.on("error", (err: Error) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("✅ Database connected successfully at:", result.rows[0].now);
    client.release();
    return true;
  } catch (err: any) {
    console.error("❌ Database connection failed:", err.message);
    return false;
  }
};

// Query helper function with error handling
const query = async (text: string, params: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log slow queries (>100ms)
    if (duration > 100) {
      console.warn(`Slow query detected (${duration}ms):`, text);
    }

    return result;
  } catch (error: any) {
    console.error("Database query error:", error);
    throw error;
  }
};

// Transaction helper
const transaction = async (callback: (client: any) => Promise<any>) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log("Closing database connections...");
  await pool.end();
  console.log("Database connections closed.");
};

export default {
  pool,
  query,
  transaction,
  testConnection,
  shutdown,
};
