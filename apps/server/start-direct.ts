#!/usr/bin/env bun

// Direct server startup script for troubleshooting
import { spawn } from "child_process";
import logger from "./src/lib/logger";

logger.log("🔧 Direct Server Startup Test\n");
logger.log("Working directory:", process.cwd());
logger.log("Node version:", process.version);
logger.log("Bun version:", Bun.version);
logger.log("");

// Test 1: Check if server file exists
import { existsSync } from "fs";

const serverFile = "./src/index.ts";

if (!existsSync(serverFile)) {
	logger.error("❌ Server file not found:", serverFile);
	process.exit(1);
}
logger.log("✅ Server file found:", serverFile);

// Test 2: Check environment
if (!existsSync(".env")) {
	logger.warn("⚠️  .env file not found, using defaults");
} else {
	logger.log("✅ .env file found");
}

// Test 3: Try to import and start the server
logger.log("\n🚀 Attempting to start server...\n");

try {
	// Import the server with environment config
	const server = await import("./src/index.ts");
	const config = await import("./src/config/env.config");

	// Start on validated port
	const port = config.default.PORT;

	Bun.serve({
		port,
		fetch: server.default.fetch,
	});

	logger.log(`✅ Server started successfully on http://localhost:${port}`);
	if (config.default.ENABLE_WEBSOCKET) {
		logger.log(`WebSocket server on ws://localhost:${config.default.WS_PORT}`);
	}
	logger.log("\nPress Ctrl+C to stop");
} catch (error) {
	logger.error("❌ Failed to start server:");
	logger.error(error);

	// Provide troubleshooting tips based on error
	if (error.message.includes("mongoose")) {
		logger.log("\n💡 MongoDB connection issue detected.");
		logger.log("Please ensure MongoDB is running:");
		logger.log("  brew services start mongodb-community");
	} else if (error.message.includes("Cannot find module")) {
		logger.log("\n💡 Missing dependency detected.");
		logger.log("Run: bun install");
	} else if (error.message.includes("port")) {
		logger.log("\n💡 Port conflict detected.");
		logger.log("Check if port 3000 is already in use:");
		logger.log("  lsof -i :3000");
	}

	process.exit(1);
}
