// import dotenv from "dotenv";
// import seedRecipes from "./seedDB.js";

// dotenv.config();

// // console.log("\n2. Testing database connection...");

// // const pool = new Pool({
// //   host: "0",
// //   port: ,
// //   database: "", // Connect to default postgres database
// //   user: "",
// //   password: "",
// // });

// // try {
// //   const client = await pool.connect();
// //   const result = await client.query("SELECT version()");
// //   console.log("   ✅ Database connection successful");
// //   console.log(
// //     `   📊 PostgreSQL version: ${result.rows[0].version.split(" ")[1]}`
// //   );
// //   client.release();
// // } catch (error) {
// //   console.log("   ❌ Database connection failed:", error.message);
// //   console.log("\n   Please ensure:");
// //   console.log("   - PostgreSQL is running");
// //   console.log("   - Database credentials in .env are correct");
// //   console.log("   - Database user has necessary permissions");
// //   process.exit(1);
// // }

// // await pool.end();

// // // 3. Check/Create database
// // console.log("\n3. Checking target database...");

// // const dbPool = new Pool({
// //   host: process.env.DB_HOST || "10.10.38.110",
// //   port: process.env.DB_PORT || 5432,
// //   database: "dindin_db", // Connect to default postgres database
// //   user: process.env.DB_USER || "postgres",
// //   password: process.env.DB_PASSWORD || "dindin",
// //   ssl:
// //     process.env.NODE_ENV === "production"
// //       ? { rejectUnauthorized: false }
// //       : false,
// // });

// // try {
// //   const dbName = process.env.DB_NAME || "dindin_db";

// //   // Check if database exists
// //   const dbCheck = await dbPool.query(
// //     "SELECT 1 FROM pg_database WHERE datname = $1",
// //     [dbName]
// //   );

// //   if (dbCheck.rows.length === 0) {
// //     console.log(`   Creating database '${dbName}'...`);
// //     await dbPool.query(`CREATE DATABASE "${dbName}"`);
// //     console.log("   ✅ Database created successfully");
// //   } else {
// //     console.log(`   ✅ Database '${dbName}' already exists`);
// //   }
// // } catch (error) {
// //   console.log("   ❌ Failed to create database:", error.message);
// //   process.exit(1);
// // } finally {
// //   await dbPool.end();
// // }

// seedRecipes()
//   .then(() => {
//     console.log("\n4. Database seeding completed successfully");
//     console.log("   ✅ Your Dindin database is ready to use!");
//   })
//   .catch((error) => {
//     console.error("   ❌ Database seeding failed:", error.message);
//     process.exit(1);
//   });
