import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' });

export async function POST(request: NextRequest) {
  try {
    const { calculationId } = await request.json();
    const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (typeof calculationId !== 'string' || !UUID.test(calculationId)) {
      // The analysis was not saved (id is missing or "local"), so a purchase could not be tied to it.
      return NextResponse.json(
        { error: 'This analysis was not saved, so it cannot be purchased. Please run the analysis again.' },
        { status: 400 }
      );
    }
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    const origin = request.headers.get('origin') ?? 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${origin}/results/${calculationId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/results/${calculationId}`,
      metadata: {
        calculationId,
        userId: session?.user?.id ?? '',
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
