#!/usr/bin/env bun

// Direct server startup script for troubleshooting
import { spawn } from "child_process";

console.log("🔧 Direct Server Startup Test\n");
console.log("Working directory:", process.cwd());
console.log("Node version:", process.version);
console.log("Bun version:", Bun.version);
console.log("");

// Test 1: Check if server file exists
import { existsSync } from "fs";
const serverFile = "./src/index.ts";

if (!existsSync(serverFile)) {
    console.error("❌ Server file not found:", serverFile);
    process.exit(1);
}
console.log("✅ Server file found:", serverFile);

// Test 2: Check environment
if (!existsSync(".env")) {
    console.warn("⚠️  .env file not found, using defaults");
} else {
    console.log("✅ .env file found");
}

// Test 3: Try to import and start the server
console.log("\n🚀 Attempting to start server...\n");

try {
    // Import the server
    const server = await import("./src/index.ts");
    
    // Start on port 3000
    const port = process.env.PORT || 3000;
    
    Bun.serve({
        port,
        fetch: server.default.fetch,
    });
    
    console.log(`✅ Server started successfully on http://localhost:${port}`);
    console.log(`WebSocket server on ws://localhost:${process.env.WS_PORT || 3001}`);
    console.log("\nPress Ctrl+C to stop");
    
} catch (error) {
    console.error("❌ Failed to start server:");
    console.error(error);
    
    // Provide troubleshooting tips based on error
    if (error.message.includes("mongoose")) {
        console.log("\n💡 MongoDB connection issue detected.");
        console.log("Please ensure MongoDB is running:");
        console.log("  brew services start mongodb-community");
    } else if (error.message.includes("Cannot find module")) {
        console.log("\n💡 Missing dependency detected.");
        console.log("Run: bun install");
    } else if (error.message.includes("port")) {
        console.log("\n💡 Port conflict detected.");
        console.log("Check if port 3000 is already in use:");
        console.log("  lsof -i :3000");
    }
    
    process.exit(1);
}