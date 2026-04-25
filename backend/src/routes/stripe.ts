import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

// Initialize Stripe. We check if STRIPE_SECRET_KEY is defined. 
// If not, we initialize with a dummy key just to avoid crashing, but the route will fail if hit.
const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';
const stripe = new Stripe(stripeSecret);

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId } = req.body;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Default price ID to an environment variable if not passed in body
    const finalPriceId = priceId || process.env.STRIPE_PRICE_ID;
    
    if (!finalPriceId) {
      return res.status(400).json({ error: 'Stripe Price ID is missing' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // Change to 'payment' if it's a one-time charge
      success_url: `${frontendUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/checkout`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
