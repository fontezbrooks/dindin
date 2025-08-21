#!/usr/bin/env node

/**
 * Test script to verify WebSocket configuration
 * Run this to confirm environment variable is being read correctly
 */

// Load environment variables
require("dotenv").config({ path: "../.env" });

console.log("=== WebSocket Configuration Test ===\n");

// Check if environment variable is set
const wsUrl = process.env.EXPO_PUBLIC_WS_URL;

if (wsUrl) {
	console.log("✅ EXPO_PUBLIC_WS_URL is configured:");
	console.log(`   URL: ${wsUrl}`);

	// Parse the URL to validate format
	try {
		const url = new URL(wsUrl);
		console.log(`   Protocol: ${url.protocol}`);
		console.log(`   Hostname: ${url.hostname}`);
		console.log(`   Port: ${url.port || "(default)"}`);
		console.log(`   Path: ${url.pathname}`);

		// Check protocol
		if (url.protocol === "ws:") {
			console.log("\n⚠️  Warning: Using unencrypted WebSocket (ws://)");
			console.log("   Consider using wss:// for production");
		} else if (url.protocol === "wss:") {
			console.log("\n✅ Using secure WebSocket (wss://)");
		} else {
			console.log("\n❌ Invalid protocol. Use ws:// or wss://");
		}
	} catch (error) {
		console.log("\n❌ Invalid URL format:", error.message);
	}
} else {
	console.log("⚠️  EXPO_PUBLIC_WS_URL not set in .env");
	console.log("   Will fallback to default: ws://localhost:3001");
}

// Show what the WebSocketManager would use
const finalUrl = wsUrl || "ws://localhost:3001";
console.log("\n=== Final Configuration ===");
console.log(`WebSocketManager will use: ${finalUrl}`);

console.log("\n=== Configuration Tips ===");
console.log("• For local development: ws://localhost:3001");
console.log("• For local network: ws://[YOUR_IP]:3001");
console.log("• For production: wss://your-domain.com/ws");
console.log("• Remember to restart the app after changing .env");

export {};
