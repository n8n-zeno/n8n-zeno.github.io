# ZENO: Figma to Code Compiler

**Live Demo:** [https://n8n-zeno.github.io/](https://n8n-zeno.github.io/)

ZENO is a blazing-fast, deterministic compiler engine that instantly transforms your Figma designs into production-ready React components and HTML markup. It bridges the gap between design and development by turning Figma URLs directly into usable code.

## 🚀 Features

- **Instant Compilation**: Paste your Figma node URL or file link and get code in seconds.
- **Multiple Output Formats**: Export clean, structured React (`.tsx`) code or raw HTML.
- **Syntax Highlighting**: Beautiful, VS Code-inspired code preview directly in the browser.
- **Secure Authentication**: Built-in user authentication (Sign up / Sign in) to protect access via JWT.
- **Figma Token Management**: Securely stores your Figma Personal Access Token (PAT).
- **Smart Token Validation**: Automatically checks token expiration and prompts for updates if your Figma PAT is revoked or expires.
- **n8n Webhook Integration**: Designed to securely proxy requests from the backend to an n8n automation webhook for deterministic code compilation.
- **Stripe Payments**: Built-in Stripe integration for checkouts and secure webhook handling.

## 🛠️ Architecture

ZENO is structured as a modern monorepo containing a React frontend and a Node.js backend.

### Frontend
- **Framework**: React with Vite
- **Routing**: React Router DOM (`/`, `/login`, `/signup`, `/checkout`, `/checkout-success`)
- **Styling**: Tailwind CSS
- **Code Highlighting**: `react-syntax-highlighter` (VS Code Dark+ Theme)

### Backend
- **Runtime**: Node.js & Express
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: JWT (JSON Web Tokens) & bcrypt password hashing
- **Integration**: Securely proxies the user's Figma Token and URL to an n8n workflow. Handles Stripe webhooks.

## 📦 Local Development Setup

To run ZENO locally, you need to start both the frontend and backend servers. Since the backend requires an internet-facing URL to receive webhooks from Stripe and n8n, we use a Cloudflare Tunnel script.

### Prerequisites
- Node.js (v18+)
- npm or yarn
- An active [Figma Personal Access Token (PAT)](https://www.figma.com/settings)
- PostgreSQL database instance (local or remote, like Neon)
- Stripe Account (for Secret Key and Webhook Secret)
- An n8n instance
- `cloudflared` CLI installed (`brew install cloudflared`)

### 1. Install Dependencies
From the root of the project, run:
```bash
npm run install:all
```

### 2. Configure the Backend
Navigate to the `backend` directory and create/configure the `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/zeno_db"
JWT_SECRET="super_secret_key_change_me"
PORT=3001
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
N8N_WEBHOOK_URL="http://localhost:5678/webhook/..."
```
Generate the Prisma Client and push the schema to the PostgreSQL database:
```bash
npx prisma generate
npx prisma db push
```

### 3. Start the Backend & Tunnel
We use a script that starts the backend and sets up a Cloudflare Tunnel so webhooks can reach your local server.

From the root directory:
```bash
./start-tunnel.sh
```
*Note: If `cloudflared` is not available, you can also use `./start-zeno.sh` which uses localhost.run.*

Once the tunnel starts, copy the generated `.trycloudflare.com` URL.

### 4. Configure the Frontend & Start it
Navigate to the `frontend` directory and create/update the `.env` file with the tunnel URL:
```env
VITE_API_URL="https://your-tunnel-url.trycloudflare.com"
```

Then, in a new terminal, start the frontend:
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port specified by Vite).

## 💡 How to Use
1. Create an account on the sign-up page and optionally enter your Figma PAT.
2. Ensure you have an active subscription via the checkout page.
3. Navigate to the main ZENO compiler interface.
4. Paste a link to a specific Figma frame or component.
5. Select your desired output format (React Code or HTML).
6. Click "Compile" and watch your design turn into code!

## 🔐 Security Note
ZENO's backend acts as a secure proxy. The frontend never communicates directly with n8n or Stripe APIs directly for secret tasks, ensuring that your sensitive tokens remain safely stored in the backend database.
