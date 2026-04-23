# ZENO: Figma to Code Compiler

ZENO is a blazing-fast, deterministic compiler engine that instantly transforms your Figma designs into production-ready React components and HTML markup. It bridges the gap between design and development by turning Figma URLs directly into usable code.

## 🚀 Features

- **Instant Compilation**: Paste your Figma node URL or file link and get code in seconds.
- **Multiple Output Formats**: Export clean, structured React (`.tsx`) code or raw HTML.
- **Syntax Highlighting**: Beautiful, VS Code-inspired code preview directly in the browser.
- **Secure Authentication**: Built-in user authentication (Sign up / Sign in) to protect access.
- **Figma Token Management**: Securely stores your Figma Personal Access Token (PAT) so you don't have to enter it every time.
- **Smart Token Validation**: Automatically checks token expiration and prompts for updates if your Figma PAT is revoked or expires.
- **n8n Webhook Integration**: Designed to securely proxy requests from the backend to an n8n automation webhook for deterministic code compilation.

## 🛠️ Architecture

ZENO is structured as a modern monorepo containing a React frontend and a Node.js backend.

### Frontend
- **Framework**: React 19 with Vite
- **Routing**: React Router DOM (`/`, `/login`, `/signup`)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Code Highlighting**: `react-syntax-highlighter` (VS Code Dark+ Theme)

### Backend
- **Runtime**: Node.js & Express
- **Database**: SQLite (via Prisma ORM)
- **Authentication**: JWT (JSON Web Tokens) & bcrypt password hashing
- **Integration**: Securely proxies the user's Figma Token and URL to an n8n workflow.

## 📦 Local Development Setup

To run ZENO locally, you need to start both the frontend and backend servers.

### Prerequisites
- Node.js (v18+)
- npm or yarn
- An active [Figma Personal Access Token (PAT)](https://www.figma.com/settings) (Requires "File content" read access).
- An n8n instance running locally or on a server to handle the webhook processing.

### 1. Install Dependencies
From the root of the project, run:
```bash
npm run install:all
```
*(This installs dependencies for both the `/frontend` and `/backend` directories).*

### 2. Configure the Backend
Navigate to the `backend` directory:
```bash
cd backend
```
Create a `.env` file (if it doesn't exist) and ensure it has the following variables:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="super_secret_key_change_me_in_production"
PORT=3001
N8N_WEBHOOK_URL="http://localhost:5678/webhook/compile-figma"
```
Generate the Prisma Client and push the schema to the SQLite database:
```bash
npx prisma generate
npx prisma db push
```

### 3. Start the Application
You can start both servers using the root `package.json` scripts.

Open a terminal and start the backend:
```bash
npm run dev:backend
```

Open a second terminal and start the frontend:
```bash
npm run dev:frontend
```

The frontend will be available at `http://localhost:5173`.

## 💡 How to Use
1. Create an account on the sign-up page and optionally enter your Figma PAT.
2. Navigate to the main ZENO compiler interface.
3. Paste a link to a specific Figma frame or component.
4. Select your desired output format (React Code or HTML).
5. Click "Compile" and watch your design turn into code!

## 🔐 Security Note
ZENO's backend acts as a secure proxy. The frontend never communicates directly with n8n, ensuring that your sensitive Figma tokens remain safely stored in the backend database and are only injected server-side during the compilation request.