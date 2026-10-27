//npm install pg dotenv
//Now create a project in Neon, and put connection string in .env: DATABASE_URL="Your_Connection_String"   <=Yes it should be in ""
import dotenv from "dotenv";
import pg from "pg";

// 1. Load environment variables from the repository root
dotenv.config({ path: "../../.env" });

const { Client } = pg;

// 2. Check whether the connection string exists
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from ../../.env");
}

// 3. Connect to Neon
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
  },
});

try {
  await client.connect();
  console.log("Connected to Neon successfully!");

  // 4. Check which PostgreSQL database we connected to
  const result = await client.query(
    "SELECT current_database() AS database_name, version() AS postgres_version"
  );

  console.log("Database:", result.rows[0].database_name);
  console.log("PostgreSQL:", result.rows[0].postgres_version);
} catch (error) {
  console.error("Neon connection failed:", error.message);
} finally {
  await client.end();
}
