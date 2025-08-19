#!/bin/bash

# Test script for SADMIN 2025 MCP Server

echo "🧪 Testing SADMIN 2025 MCP Server"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
SERVER_URL="http://localhost:3010"

echo "1. Checking if MCP server is running..."
if curl -s -f -o /dev/null "$SERVER_URL/health"; then
    echo -e "   ${GREEN}✓ Server is running${NC}"
else
    echo -e "   ${YELLOW}⚠ Server is not running. Starting server...${NC}"
    npm run dev &
    SERVER_PID=$!
    sleep 3
fi

echo ""
echo "2. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "$SERVER_URL/health")
if [[ $HEALTH_RESPONSE == *"mcpServer"* ]]; then
    echo -e "   ${GREEN}✓ Health check passed${NC}"
    echo "   Response: $HEALTH_RESPONSE" | head -c 100
    echo "..."
else
    echo -e "   ${RED}✗ Health check failed${NC}"
    exit 1
fi

echo ""
echo "3. Testing functions list endpoint..."
FUNCTIONS_RESPONSE=$(curl -s "$SERVER_URL/functions")
FUNCTION_COUNT=$(echo $FUNCTIONS_RESPONSE | grep -o '"name"' | wc -l)
echo -e "   ${GREEN}✓ Found $FUNCTION_COUNT functions${NC}"

echo ""
echo "4. Testing get projects..."
PROJECTS_RESPONSE=$(curl -s -X POST "$SERVER_URL/functions/sadmin_getProjects" \
    -H "Content-Type: application/json" \
    -d '{}')
    
if [[ $PROJECTS_RESPONSE == *"success"* ]]; then
    echo -e "   ${GREEN}✓ Get projects successful${NC}"
else
    echo -e "   ${RED}✗ Get projects failed${NC}"
    echo "   Response: $PROJECTS_RESPONSE"
fi

echo ""
echo "5. Running unit tests..."
npm test

echo ""
echo "=================================="
echo -e "${GREEN}✅ Testing completed!${NC}"

# Kill server if we started it
if [ ! -z "$SERVER_PID" ]; then
    echo "Stopping test server..."
    kill $SERVER_PID 2>/dev/null
fi