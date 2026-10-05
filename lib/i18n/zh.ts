import Stripe from 'stripe';

/**
 * Server-side check that a Stripe Checkout session is a completed, paid purchase
 * for this calculation. The client can never unlock Pro by itself.
 */
export async function isPaidSessionFor(sessionId: string | null, calculationId: string): Promise<boolean> {
  if (!sessionId || !sessionId.startsWith('cs_') || !process.env.STRIPE_SECRET_KEY) return false;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session.payment_status === 'paid' && session.metadata?.calculationId === calculationId;
  } catch {
    return false;
  }
}
