#!/bin/bash
echo "=== TESTING API FLOW AND LOGGING ==="
echo ""
echo "Step 1: Making chat request to http://localhost:3001/api/chat"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [], "userMessage": "test audit"}')

echo "$RESPONSE"
echo ""
echo "Step 2: Check server logs above for:"
echo "  - ✅ Database connection initialized"
echo "  - ✅ Chat interaction logged to database"
echo "  - OR 🚨 LOGGING SKIPPED"
