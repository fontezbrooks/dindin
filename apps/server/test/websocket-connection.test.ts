import { WebSocket } from "ws";
import { DindinUser } from "../src/db";
import { auth } from "../src/lib/auth";
import logger from "../src/lib/logger";

// Simple WebSocket connection test
async function testWebSocketConnection() {
	logger.log("\n🧪 Testing WebSocket Connection...\n");

	try {
		// 1. Create a test user if needed
		logger.log("1️⃣ Setting up test user...");

		// For testing, we'll use a simple token approach
		// In production, this would come from the auth system
		const testToken = "test-token-123";

		// 2. Connect to WebSocket server
		logger.log("2️⃣ Connecting to WebSocket server...");
		const ws = new WebSocket(`ws://localhost:3001?token=${testToken}`);

		// 3. Setup event handlers
		ws.on("open", () => {
			logger.log("✅ WebSocket connected successfully!");

			// Send a test message
			ws.send(
				JSON.stringify({
					type: "ping",
					timestamp: Date.now(),
				}),
			);

			logger.log("📤 Sent ping message");
		});

		ws.on("message", (data) => {
			const message = JSON.parse(data.toString());
			logger.log("📥 Received message:", message);

			if (message.type === "connected") {
				logger.log("✅ Server confirmed connection");
			} else if (message.type === "pong") {
				logger.log("✅ Received pong response");

				// Test complete - close connection
				setTimeout(() => {
					ws.close(1000, "Test complete");
				}, 1000);
			}
		});

		ws.on("error", (error) => {
			logger.error("❌ WebSocket error:", error.message);
		});

		ws.on("close", (code, reason) => {
			logger.log(`🔌 WebSocket closed - Code: ${code}, Reason: ${reason}`);

			if (code === 1000) {
				logger.log("\n✅ WebSocket test completed successfully!\n");
			} else {
				logger.log("\n⚠️ WebSocket closed unexpectedly\n");
			}

			process.exit(code === 1000 ? 0 : 1);
		});
	} catch (error) {
		logger.error("❌ Test failed:", error);
		process.exit(1);
	}
}

// Run the test
logger.log("Starting WebSocket connection test...");
logger.log("Make sure the server is running on port 3001");
logger.log("Run: bun run dev in the server directory\n");

setTimeout(() => {
	testWebSocketConnection();
}, 2000);
