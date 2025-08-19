#!/bin/bash

# Start MCP Server for SADMIN 2025
echo "Starting SADMIN 2025 MCP Server..."

export MCP_API_URL="http://localhost:3010"
export ENVIRONMENT="production"
export SADMIN_API_URL="https://sadmin2025api.ticketing.rs/api/claude"
export SADMIN_API_KEY="claude_DoGQQYPIAzk2uZMwQ24o4cOMMyLsFw72"
export SADMIN_PROJECT_ID="be92301b-8118-4651-a252-a996339ead2e"

cd /home/buslogic/sadmin2025-mcp-server
exec node dist/mcp-server.js