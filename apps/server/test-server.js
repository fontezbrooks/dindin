#!/usr/bin/env node

// Simple test script to verify server can start
const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Testing DinDin Backend Server...\n');

// Check if bun is available
const packageManager = process.argv[2] || 'bun';

console.log(`Using package manager: ${packageManager}`);
console.log('Working directory:', __dirname);
console.log('');

// Function to run command
function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, {
            cwd: __dirname,
            stdio: 'inherit',
            shell: true
        });

        proc.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Command failed with code ${code}`));
            } else {
                resolve();
            }
        });

        proc.on('error', (err) => {
            reject(err);
        });
    });
}

async function main() {
    try {
        // Step 1: Install dependencies
        console.log('📦 Installing dependencies...');
        await runCommand(packageManager, ['install']);
        console.log('✅ Dependencies installed\n');

        // Step 2: Test MongoDB connection
        console.log('🔗 Testing MongoDB connection...');
        const testDb = `
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/dindin-app', {
    serverSelectionTimeoutMS: 5000
}).then(() => {
    console.log('✅ MongoDB connection successful');
    process.exit(0);
}).catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('\\nPlease ensure MongoDB is running:');
    console.log('  macOS: brew services start mongodb-community');
    console.log('  Linux: sudo systemctl start mongod');
    console.log('  Or manually: mongod --dbpath /path/to/data');
    process.exit(1);
});
        `;
        
        await runCommand('node', ['-e', testDb]);
        console.log('');

        // Step 3: Start the server
        console.log('🚀 Starting server...');
        console.log('Server will start on http://localhost:3000');
        console.log('Press Ctrl+C to stop\n');
        
        await runCommand(packageManager, ['run', 'dev']);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();