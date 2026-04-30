import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import compileRoutes from './routes/compile';
import webhookRoutes from './routes/webhook';
import stripeRoutes from './routes/stripe';
import prisma from './prismaClient';

dotenv.config();

const app = express();

/**
 * 1. CORS CONFIGURATION
 * We explicitly allow the GitHub Pages origin and necessary bypass headers.
 */
app.use(cors({ 
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'bypass-tunnel-reminder', 
    'ngrok-skip-browser-warning', 
    'x-requested-with'
  ] 
}));

/**
 * 2. STRIPE WEBHOOK RAW PARSER
 * This MUST run before any other express.json() middleware. 
 * Stripe requires the raw body buffer to verify signatures correctly.
 */
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeRoutes);

/**
 * 3. GLOBAL PAYLOAD PARSERS
 * Increased to 50mb to handle large Figma-to-Code payloads from n8n.
 */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Optional: Traffic logging for debugging auth flow
app.use((req, res, next) => {
  if (req.path.includes('/api/auth')) {
    console.log(`[AUTH-DEBUG] ${req.method} ${req.path}`);
  }
  next();
});

/**
 * 4. API ROUTES
 */
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/compile', compileRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/stripe', stripeRoutes);

/**
 * 5. STATIC FRONTEND SERVING
 * Serves the React 'dist' folder. If a request is not for an /api route, 
 * it sends index.html to allow React Router to handle the navigation.
 */
app.use(express.static(path.join(__dirname, '../../frontend/dist')));
app.get(/.*/, (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  }
});

const PORT = process.env.PORT || 3001;

/**
 * 6. SERVER STARTUP & DATABASE CONNECTION
 */
app.listen(Number(PORT), '0.0.0.0', async () => {
  console.log(`📡 Backend server running on port ${PORT}`);
  try {
    // Verifies connectivity to the PostgreSQL container/external DB
    await prisma.$connect();
    console.log(`✅ PostgreSQL Connected Successfully`);
  } catch (err: any) {
    console.error(`❌ PostgreSQL Connection FAILED:`, err.message);
  }
});