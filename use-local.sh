#!/bin/bash
echo "🔄 Switching to LOCAL environment..."
cp .env.local .env
echo "✅ Now using LOCAL environment"
echo "📍 API: http://localhost:3006/api/claude"
echo "🆔 Project: cacf6ec3-e988-4969-9448-be741ddcaee4"
echo ""
echo "🚀 Restart MCP server to apply changes:"
echo "   npm start"
