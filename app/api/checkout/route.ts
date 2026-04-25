import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' });

export async function POST(request: NextRequest) {
  try {
    const { calculationId } = await request.json();
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
      success_url: `${origin}/results/${calculationId}?pro=true`,
      cancel_url: `${origin}/results/${calculationId}`,
      metadata: {
        calculationId: calculationId ?? '',
        userId: session?.user?.id ?? '',
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
