#!/bin/bash

echo "Testing Multi-Channel Outreach Campaign Manager..."
echo ""

# Test 1: Backend health check
echo "1. Testing Backend Health..."
HEALTH=$(curl -s http://localhost:3000/api/health)
if echo "$HEALTH" | grep -q "ok"; then
    echo "✓ Backend is running and healthy"
else
    echo "✗ Backend health check failed"
    echo "Response: $HEALTH"
fi
echo ""

# Test 2: Login endpoint
echo "2. Testing Login Endpoint..."
LOGIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

if echo "$LOGIN" | grep -q "token"; then
    echo "✓ Login successful"
    TOKEN=$(echo "$LOGIN" | jq -r '.token')
    echo "Token received: ${TOKEN:0:50}..."
else
    echo "✗ Login failed"
    echo "Response: $LOGIN"
fi
echo ""

# Test 3: Get campaigns with token
echo "3. Testing Campaigns Endpoint (with auth)..."
CAMPAIGNS=$(curl -s http://localhost:3000/api/campaigns \
  -H "Authorization: Bearer $TOKEN")

if echo "$CAMPAIGNS" | grep -q "\["; then
    CAMPAIGN_COUNT=$(echo "$CAMPAIGNS" | jq 'length')
    echo "✓ Successfully retrieved $CAMPAIGN_COUNT campaign(s)"
else
    echo "✗ Failed to get campaigns"
    echo "Response: $CAMPAIGNS"
fi
echo ""

# Test 4: Frontend connectivity
echo "4. Testing Frontend..."
FRONTEND=$(curl -s http://localhost:5173 2>&1)
if echo "$FRONTEND" | grep -q "root\|html"; then
    echo "✓ Frontend is accessible"
else
    echo "✗ Frontend is not responding"
fi
echo ""

echo "=========================================="
echo "SUMMARY:"
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Login Credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo "=========================================="
