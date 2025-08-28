#!/usr/bin/env node

// Simple test script to verify server can start
const { spawn } = require("child_process");
const path = require("path");

logger.log("🔍 Testing DinDin Backend Server...\n");

// Check if bun is available
const packageManager = process.argv[2] || "bun";

logger.log(`Using package manager: ${packageManager}`);
logger.log("Working directory:", __dirname);
logger.log("");

// Function to run command
function runCommand(command, args) {
	return new Promise((resolve, reject) => {
		const proc = spawn(command, args, {
			cwd: __dirname,
			stdio: "inherit",
			shell: true,
		});

		proc.on("close", (code) => {
			if (code !== 0) {
				reject(new Error(`Command failed with code ${code}`));
			} else {
				resolve();
			}
		});

		proc.on("error", (err) => {
			reject(err);
		});
	});
}

async function main() {
	try {
		// Step 1: Install dependencies
		logger.log("📦 Installing dependencies...");
		await runCommand(packageManager, ["install"]);
		logger.log("✅ Dependencies installed\n");

		// Step 2: Test MongoDB connection
		logger.log("🔗 Testing MongoDB connection...");
		const testDb = `
const mongoose = require('mongoose');
const logger = require('./src/lib/logger').default;
mongoose.connect('mongodb://localhost:27017/dindin-app', {
    serverSelectionTimeoutMS: 5000
}).then(() => {
    logger.log('✅ MongoDB connection successful');
    process.exit(0);
}).catch(err => {
    logger.error('❌ MongoDB connection failed:', err.message);
    logger.log('\\nPlease ensure MongoDB is running:');
    logger.log('  macOS: brew services start mongodb-community');
    logger.log('  Linux: sudo systemctl start mongod');
    logger.log('  Or manually: mongod --dbpath /path/to/data');
    process.exit(1);
});
        `;

		await runCommand("node", ["-e", testDb]);
		logger.log("");

		// Step 3: Start the server
		logger.log("🚀 Starting server...");
		logger.log("Server will start on http://localhost:3000");
		logger.log("Press Ctrl+C to stop\n");

		await runCommand(packageManager, ["run", "dev"]);
	} catch (error) {
		logger.error("❌ Error:", error.message);
		process.exit(1);
	}
}

main();
