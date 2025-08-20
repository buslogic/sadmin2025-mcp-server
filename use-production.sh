#!/bin/bash
echo "🔄 Switching to PRODUCTION environment..."
cp .env.production .env
echo "✅ Now using PRODUCTION environment"
echo "📍 API: https://sadmin2025api.ticketing.rs/api/claude"
echo "🆔 Project: be92301b-8118-4651-a252-a996339ead2e"
echo ""
echo "🚀 Restart MCP server to apply changes:"
echo "   npm start"
