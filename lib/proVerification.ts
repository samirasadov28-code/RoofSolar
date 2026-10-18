import Stripe from 'stripe';

/**
 * Server-side check that a Stripe Checkout session is a completed, paid purchase
 * for this calculation. The client can never unlock Pro by itself.
 *
 * A one-off purchase stops being valid when the payment is fully refunded or
 * disputed: session.payment_status stays 'paid' after a refund, so the charge
 * itself has to be checked.
 */
export async function isPaidSessionFor(sessionId: string | null, calculationId: string): Promise<boolean> {
  if (!sessionId || !sessionId.startsWith('cs_') || !process.env.STRIPE_SECRET_KEY) return false;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' });
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent.latest_charge'],
    });
    if (session.payment_status !== 'paid' || session.metadata?.calculationId !== calculationId) {
      return false;
    }
    return !(await isChargeRevoked(stripe, session));
  } catch {
    return false;
  }
}

async function isChargeRevoked(stripe: Stripe, session: Stripe.Checkout.Session): Promise<boolean> {
  if (session.mode !== 'payment') return false;
  try {
    let charge: Stripe.Charge | null = null;
    const pi = session.payment_intent;
    if (pi && typeof pi === 'object' && pi.latest_charge && typeof pi.latest_charge === 'object') {
      charge = pi.latest_charge as Stripe.Charge;
    } else {
      const piId = typeof pi === 'string' ? pi : pi?.id;
      if (!piId) return false;
      const charges = await stripe.charges.list({ payment_intent: piId, limit: 3 });
      charge = charges.data[0] ?? null;
    }
    if (!charge) return false;
    return (
      charge.refunded === true ||
      charge.disputed === true ||
      (charge.amount_refunded ?? 0) >= charge.amount
    );
  } catch (error) {
    // Keep access when the refund state cannot be determined (Stripe hiccup).
    console.error('Refund state lookup failed:', error);
    return false;
  }
}
