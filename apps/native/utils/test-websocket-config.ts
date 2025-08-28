#!/usr/bin/env node

/**
 * Test script to verify WebSocket configuration
 * Run this to confirm environment variable is being read correctly
 */

// Load environment variables
require("dotenv").config({ path: "../.env" });
import logger from './logger';

logger.log("=== WebSocket Configuration Test ===\n");

// Check if environment variable is set
const wsUrl = process.env.EXPO_PUBLIC_WS_URL;

if (wsUrl) {
	logger.log("✅ EXPO_PUBLIC_WS_URL is configured:");
	logger.log(`   URL: ${wsUrl}`);

	// Parse the URL to validate format
	try {
		const url = new URL(wsUrl);
		logger.log(`   Protocol: ${url.protocol}`);
		logger.log(`   Hostname: ${url.hostname}`);
		logger.log(`   Port: ${url.port || "(default)"}`);
		logger.log(`   Path: ${url.pathname}`);

		// Check protocol
		if (url.protocol === "ws:") {
			logger.log("\n⚠️  Warning: Using unencrypted WebSocket (ws://)");
			logger.log("   Consider using wss:// for production");
		} else if (url.protocol === "wss:") {
			logger.log("\n✅ Using secure WebSocket (wss://)");
		} else {
			logger.log("\n❌ Invalid protocol. Use ws:// or wss://");
		}
	} catch (error) {
		logger.log("\n❌ Invalid URL format:", error.message);
	}
} else {
	logger.log("⚠️  EXPO_PUBLIC_WS_URL not set in .env");
	logger.log("   Will fallback to default: ws://localhost:3001");
}

// Show what the WebSocketManager would use
const finalUrl = wsUrl || "ws://localhost:3001";
logger.log("\n=== Final Configuration ===");
logger.log(`WebSocketManager will use: ${finalUrl}`);

logger.log("\n=== Configuration Tips ===");
logger.log("• For local development: ws://localhost:3001");
logger.log("• For local network: ws://[YOUR_IP]:3001");
logger.log("• For production: wss://your-domain.com/ws");
logger.log("• Remember to restart the app after changing .env");

export {};
