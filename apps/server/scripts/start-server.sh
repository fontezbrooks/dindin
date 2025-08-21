#!/bin/bash

# Server Startup Script for DinDin Backend
# This script handles MongoDB startup and server initialization

echo "🚀 Starting DinDin Backend Server..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if MongoDB is running
check_mongodb() {
    if pgrep -x "mongod" > /dev/null; then
        echo -e "${GREEN}✅ MongoDB is already running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  MongoDB is not running${NC}"
        return 1
    fi
}

# Function to start MongoDB
start_mongodb() {
    echo "Starting MongoDB..."
    
    # Check if MongoDB is installed
    if ! command -v mongod &> /dev/null; then
        echo -e "${RED}❌ MongoDB is not installed!${NC}"
        echo "Please install MongoDB first:"
        echo "  macOS: brew install mongodb-community"
        echo "  Ubuntu: sudo apt-get install mongodb"
        exit 1
    fi
    
    # Try to start MongoDB
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew services start mongodb-community 2>/dev/null || mongod --fork --logpath /usr/local/var/log/mongodb/mongo.log --dbpath /usr/local/var/mongodb
    else
        # Linux
        sudo systemctl start mongod 2>/dev/null || mongod --fork --logpath /var/log/mongodb/mongod.log --dbpath /var/lib/mongodb
    fi
    
    sleep 2
    
    if check_mongodb; then
        echo -e "${GREEN}✅ MongoDB started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start MongoDB${NC}"
        echo "Try starting it manually:"
        echo "  mongod --dbpath /path/to/data/directory"
        exit 1
    fi
}

# Function to check port availability
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}❌ Port $port is already in use${NC}"
        echo "Please stop the process using this port or change the port in .env"
        return 1
    else
        echo -e "${GREEN}✅ Port $port is available${NC}"
        return 0
    fi
}

# Main execution
echo "1. Checking MongoDB status..."
if ! check_mongodb; then
    echo "   Attempting to start MongoDB..."
    start_mongodb
fi

echo ""
echo "2. Checking environment variables..."
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating default .env file...${NC}"
    cat > .env << EOF
DATABASE_URL=mongodb://localhost:27017/dindin-app
CORS_ORIGIN=http://localhost:8081
BETTER_AUTH_SECRET=your-secret-key-here-change-this-in-production
WS_PORT=3001
EOF
    echo -e "${GREEN}✅ Created default .env file${NC}"
else
    echo -e "${GREEN}✅ .env file found${NC}"
fi

echo ""
echo "3. Checking port availability..."
# Default port is 3000 for Hono server
check_port 3000
SERVER_PORT_OK=$?

# Check WebSocket port from .env
WS_PORT=$(grep WS_PORT .env | cut -d '=' -f2)
WS_PORT=${WS_PORT:-3001}
check_port $WS_PORT
WS_PORT_OK=$?

if [ $SERVER_PORT_OK -ne 0 ] || [ $WS_PORT_OK -ne 0 ]; then
    echo -e "${RED}❌ Port conflicts detected. Please resolve before starting.${NC}"
    exit 1
fi

echo ""
echo "4. Installing dependencies..."
if [ -f "bun.lockb" ] || command -v bun &> /dev/null; then
    echo "   Using Bun package manager..."
    bun install
else
    echo "   Using npm package manager..."
    npm install
fi

echo ""
echo "5. Starting the server..."
echo "=================================="
echo -e "${GREEN}Server starting on http://localhost:3000${NC}"
echo -e "${GREEN}WebSocket server on ws://localhost:$WS_PORT${NC}"
echo "=================================="

# Start the server
if command -v bun &> /dev/null; then
    bun run dev
else
    npm run dev
fi