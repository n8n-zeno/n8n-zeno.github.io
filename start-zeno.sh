#!/bin/bash
echo "🚀 Starting Zeno Local Production Environment..."

# Start the Express backend in the background
echo "📡 Starting Backend Express Server..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a few seconds for the server to bind to port 3001
sleep 4

# Punch the SSH Tunnel to the internet
echo "☁️ Initializing Serveo SSH Tunnel on port 3001..."
echo "------------------------------------------------------------"
ssh -R zeno-ahmed-api:80:localhost:3001 serveo.net

# Cleanup backend if tunnel is closed
kill $BACKEND_PID
