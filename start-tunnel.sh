#!/bin/bash

# Zeno Cloudflare Tunnel & Backend Starter
# ----------------------------------------

# Styled terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${BLUE}${BOLD}🚀 Starting Zeno Local Production Environment...${NC}\n"

# a) Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null
then
    echo -e "${RED}${BOLD}❌ Error: cloudflared is not installed.${NC}"
    echo -e "${YELLOW}Please run: ${BOLD}brew install cloudflared${NC}"
    exit 1
fi

echo -e "${GREEN}✅ cloudflared detected.${NC}"

# b) Start the backend Express server in the background
echo -e "${BLUE}📡 Starting Backend Express Server (8GB RAM Allocated)...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to potentially start
sleep 3

# c) Execute cloudflared tunnel
echo -e "${BLUE}☁️  Initializing Cloudflare Tunnel on http://localhost:3001...${NC}"
echo -e "${YELLOW}⚠️  Copy the generated 'trycloudflare.com' URL once it appears below.${NC}\n"

# Give a final message before the tunnel takes over the terminal
echo -e "${GREEN}${BOLD}------------------------------------------------------------${NC}"
echo -e "${GREEN}${BOLD}REMINDER:${NC}"
echo -e "${GREEN}1. Copy the .trycloudflare.com URL into: ${BOLD}frontend/.env${NC}"
echo -e "${GREEN}2. Add the URL to your ${BOLD}Stripe Dashboard Webhooks${NC}"
echo -e "${GREEN}${BOLD}------------------------------------------------------------${NC}\n"

cloudflared tunnel --url http://localhost:3001

# Clean up backend process on exit
kill $BACKEND_PID
