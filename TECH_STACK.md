# ZENO Project Tech Stack

This document outlines the detailed technology stack used across the ZENO platform. The project is structured as a full-stack application with a distinct frontend and backend, orchestrated together with modern development tooling.

## 🎨 Frontend

The frontend is a modern Single Page Application (SPA) built for high performance, interactivity, and aesthetics.

- **Core Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/) - For fast development servers and optimized production builds.
- **Language:** [TypeScript](https://www.typescriptlang.org/) - Ensuring type safety and better developer experience.
- **Styling:** 
  - [Tailwind CSS (v4)](https://tailwindcss.com/) - Utility-first styling.
  - [PostCSS](https://postcss.org/)
- **Routing:** [React Router DOM (v7)](https://reactrouter.com/)
- **Data Fetching:** [Axios](https://axios-http.com/)
- **UI & Animations:**
  - [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible component primitives.
  - [Framer Motion](https://www.framer.com/motion/) - For rich UI animations.
  - [Lucide React](https://lucide.dev/) - Iconography.
  - [Recharts](https://recharts.org/) - Charting library.
- **SEO & Meta:** [React Helmet Async](https://github.com/staylor/react-helmet-async)
- **Code Quality & Testing:** 
  - ESLint
  - [Vitest](https://vitest.dev/) & React Testing Library

## ⚙️ Backend

The backend is a robust REST API designed to handle authentication, data processing, and external webhook integrations (e.g., Stripe, Figma).

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express (v5)](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database Engine:** [PostgreSQL](https://www.postgresql.org/)
- **Authentication & Security:** 
  - [JSON Web Tokens (JWT)](https://jwt.io/)
  - [bcrypt](https://www.npmjs.com/package/bcrypt) for password hashing
  - [CORS](https://www.npmjs.com/package/cors) configured for secure cross-origin requests.
- **External Integrations:**
  - [Stripe](https://stripe.com/) - Payment processing and webhooks.
- **Task Management:** [p-queue](https://github.com/sindresorhus/p-queue) for promise queueing and concurrency control.
- **Testing:** [Jest](https://jestjs.io/) & Supertest

## 🛠️ Infrastructure, Deployment, & Tooling

The application utilizes various tools to ensure smooth local development, tunneling, and deployment.

- **Containerization:** [Docker & Docker Compose](https://www.docker.com/) - Used for running the database and other local services.
- **Reverse Proxy / Web Server:** [Nginx](https://nginx.org/)
- **Local Tunneling:** [Ngrok](https://ngrok.com/) / Serveo - Used to expose the local backend to the internet (especially crucial for receiving Stripe webhooks and bypassing CORS restrictions locally).
- **Frontend Hosting:** GitHub Pages (`https://n8n-zeno.github.io`)
- **Version Control & Hooks:** Git & [Husky](https://typicode.github.io/husky/) (Pre-commit hooks)
