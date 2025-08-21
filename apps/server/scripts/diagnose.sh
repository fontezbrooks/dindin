#!/bin/bash

# Comprehensive diagnostic script for server issues

echo "🔍 DinDin Backend Server Diagnostics"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Diagnostic results
ISSUES_FOUND=0

echo -e "${BLUE}System Information:${NC}"
echo "  OS: $(uname -s)"
echo "  Node: $(node -v 2>/dev/null || echo 'Not installed')"
echo "  Bun: $(bun -v 2>/dev/null || echo 'Not installed')"
echo "  NPM: $(npm -v 2>/dev/null || echo 'Not installed')"
echo ""

echo -e "${BLUE}1. Checking MongoDB:${NC}"
if command -v mongod &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} MongoDB is installed"
    if pgrep -x "mongod" > /dev/null; then
        echo -e "  ${GREEN}✓${NC} MongoDB is running"
    else
        echo -e "  ${RED}✗${NC} MongoDB is NOT running"
        echo -e "  ${YELLOW}Fix:${NC} Start MongoDB with:"
        echo "    brew services start mongodb-community  # macOS"
        echo "    sudo systemctl start mongod           # Linux"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
else
    echo -e "  ${RED}✗${NC} MongoDB is NOT installed"
    echo -e "  ${YELLOW}Fix:${NC} Install MongoDB:"
    echo "    brew install mongodb-community  # macOS"
    echo "    sudo apt-get install mongodb   # Linux"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi
echo ""

echo -e "${BLUE}2. Checking ports:${NC}"
for port in 3000 3001; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "  ${RED}✗${NC} Port $port is in use by:"
        lsof -i :$port | grep LISTEN | head -1
        echo -e "  ${YELLOW}Fix:${NC} Kill the process or use a different port"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    else
        echo -e "  ${GREEN}✓${NC} Port $port is available"
    fi
done
echo ""

echo -e "${BLUE}3. Checking project files:${NC}"
if [ -f "package.json" ]; then
    echo -e "  ${GREEN}✓${NC} package.json found"
else
    echo -e "  ${RED}✗${NC} package.json NOT found"
    echo -e "  ${YELLOW}Fix:${NC} Ensure you're in the server directory"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ -f "src/index.ts" ]; then
    echo -e "  ${GREEN}✓${NC} src/index.ts found"
else
    echo -e "  ${RED}✗${NC} src/index.ts NOT found"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ -f ".env" ]; then
    echo -e "  ${GREEN}✓${NC} .env file found"
else
    echo -e "  ${YELLOW}⚠${NC} .env file NOT found (will use defaults)"
fi
echo ""

echo -e "${BLUE}4. Checking dependencies:${NC}"
if [ -d "node_modules" ]; then
    echo -e "  ${GREEN}✓${NC} node_modules directory exists"
    MODULE_COUNT=$(ls node_modules | wc -l)
    echo "    Found $MODULE_COUNT packages"
else
    echo -e "  ${RED}✗${NC} node_modules NOT found"
    echo -e "  ${YELLOW}Fix:${NC} Run: bun install"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check for problematic dependency
if grep -q "spoonacular-typescript-client.*file:" package.json 2>/dev/null; then
    echo -e "  ${RED}✗${NC} Invalid local dependency found: spoonacular-typescript-client"
    echo -e "  ${YELLOW}Fix:${NC} Remove this line from package.json dependencies"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi
echo ""

echo -e "${BLUE}5. Testing MongoDB connection:${NC}"
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.version()" --quiet >/dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} MongoDB connection successful"
    else
        echo -e "  ${RED}✗${NC} Cannot connect to MongoDB"
        echo -e "  ${YELLOW}Fix:${NC} Check MongoDB is running and accessible"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
else
    echo -e "  ${YELLOW}⚠${NC} mongosh not installed, skipping connection test"
fi
echo ""

echo "===================================="
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ No issues found! Server should start successfully.${NC}"
    echo ""
    echo "Start the server with:"
    echo "  bun run dev"
    echo "  # or"
    echo "  npm run dev"
else
    echo -e "${RED}❌ Found $ISSUES_FOUND issue(s) that need to be fixed.${NC}"
    echo ""
    echo "After fixing the issues, run:"
    echo "  bun install && bun run dev"
fi
echo ""

# Optional: Try to start if no critical issues
if [ $ISSUES_FOUND -eq 0 ]; then
    read -p "Would you like to start the server now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Starting server..."
        bun run dev
    fi
fi