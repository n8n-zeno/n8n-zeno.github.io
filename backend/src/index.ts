import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import compileRoutes from './routes/compile';
import webhookRoutes from './routes/webhook';
import stripeRoutes from './routes/stripe';

dotenv.config();

const app = express();

// 2. LOCK DOWN CORS
app.use(cors({ origin: '*' }));

// 1. FIX STRIPE WEBHOOK ORDER
// We must prevent the global JSON parser from destroying the raw buffer needed for Stripe signature verification.
// Apply express.raw strictly to the Stripe webhook route BEFORE global parsers.
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeRoutes);

// Increase the JSON payload limit to 50mb to prevent n8n webhook rejection
// These must come AFTER Stripe webhook route
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/compile', compileRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/stripe', stripeRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
