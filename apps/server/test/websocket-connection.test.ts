import { WebSocket } from 'ws';
import { auth } from '../src/lib/auth';
import { DindinUser } from '../src/db';

// Simple WebSocket connection test
async function testWebSocketConnection() {
  console.log('\n🧪 Testing WebSocket Connection...\n');
  
  try {
    // 1. Create a test user if needed
    console.log('1️⃣ Setting up test user...');
    
    // For testing, we'll use a simple token approach
    // In production, this would come from the auth system
    const testToken = 'test-token-123';
    
    // 2. Connect to WebSocket server
    console.log('2️⃣ Connecting to WebSocket server...');
    const ws = new WebSocket(`ws://localhost:3001?token=${testToken}`);
    
    // 3. Setup event handlers
    ws.on('open', () => {
      console.log('✅ WebSocket connected successfully!');
      
      // Send a test message
      ws.send(JSON.stringify({
        type: 'ping',
        timestamp: Date.now()
      }));
      
      console.log('📤 Sent ping message');
    });
    
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      console.log('📥 Received message:', message);
      
      if (message.type === 'connected') {
        console.log('✅ Server confirmed connection');
      } else if (message.type === 'pong') {
        console.log('✅ Received pong response');
        
        // Test complete - close connection
        setTimeout(() => {
          ws.close(1000, 'Test complete');
        }, 1000);
      }
    });
    
    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
    });
    
    ws.on('close', (code, reason) => {
      console.log(`🔌 WebSocket closed - Code: ${code}, Reason: ${reason}`);
      
      if (code === 1000) {
        console.log('\n✅ WebSocket test completed successfully!\n');
      } else {
        console.log('\n⚠️ WebSocket closed unexpectedly\n');
      }
      
      process.exit(code === 1000 ? 0 : 1);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
console.log('Starting WebSocket connection test...');
console.log('Make sure the server is running on port 3001');
console.log('Run: bun run dev in the server directory\n');

setTimeout(() => {
  testWebSocketConnection();
}, 2000);