#!/bin/bash

echo "🚀 Zeno Platform - Deep Scan & Verification Script"
echo "---------------------------------------------------"

# 1. Check Database Health
echo "🗄️ Checking PostgreSQL..."
docker-compose exec db pg_isready -U postgres
if [ $? -eq 0 ]; then
    echo "✅ Database is accepting connections."
else
    echo "❌ Database connection failed."
fi

# 2. Check Backend Server
echo "⚙️ Checking Backend Health..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/webhook/n8n-result -X POST -H "Content-Type: application/json" -d '{"jobId": "test", "status": "completed"}' | grep -q "404\|400"
if [ $? -eq 0 ]; then
    echo "✅ Backend API is reachable."
else
    echo "❌ Backend API did not respond expectedly."
fi

# 3. Check n8n Webhook Endpoint
echo "🤖 Checking n8n Webhook Endpoint..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:5678/webhook/compile-figma -X POST | grep -q "404\|200\|405"
if [ $? -eq 0 ]; then
    echo "✅ n8n Webhook is listening (even if route is not fully set up yet, the server is up)."
else
    echo "❌ n8n Webhook endpoint unreachable."
fi

# 4. Check Nginx Proxy Configuration
echo "🌐 Checking Nginx configuration..."
docker-compose exec nginx nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx config is valid."
else
    echo "❌ Nginx config contains errors."
fi

echo "---------------------------------------------------"
echo "🎉 Verification complete! To apply schema changes, make sure to run:"
echo "docker-compose exec backend npx prisma generate"
echo "docker-compose exec backend npx prisma db push"