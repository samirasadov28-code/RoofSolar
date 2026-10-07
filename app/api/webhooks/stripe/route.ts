import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase';
import { sendProReportEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' });

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = createServiceClient();
    const calculationId = session.metadata?.calculationId ?? null;
    const userId = session.metadata?.userId ?? null;

    if (session.payment_status !== 'paid' || !calculationId) {
      return NextResponse.json({ received: true });
    }
    const { error: insertError } = await supabase.from('pro_purchases').insert({
      user_id: userId || null,
      calculation_id: calculationId || null,
      stripe_session_id: session.id,
    });

    // Duplicate webhook deliveries are safe; other database failures need a Stripe retry.
    if (insertError && insertError.code !== '23505') {
      return NextResponse.json({ error: 'Purchase recording failed' }, { status: 503 });
    }

    // Fetch calculation address and email for the confirmation email
    if (calculationId && session.customer_details?.email) {
      const { data: calc, error: calcError } = await supabase
        .from('calculations')
        .select('address')
        .eq('id', calculationId)
        .maybeSingle();

      if (calcError || !calc) return NextResponse.json({ error: 'Calculation unavailable' }, { status: 503 });
      try {
        await sendProReportEmail(
        session.customer_details.email,
        calculationId,
        calc?.address ?? 'your property',
        session.id
        );
      } catch {
        return NextResponse.json({ error: 'Report email delivery failed' }, { status: 503 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
