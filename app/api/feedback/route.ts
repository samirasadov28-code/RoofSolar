import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { sendFeedbackNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { rating, message, page } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'rating 1–5 required' }, { status: 400 });
    }

    const supabase = createServiceClient();
    await supabase.from('feedback').insert({ rating, message: message || null, page: page || null });

    await sendFeedbackNotification(rating, message || null, page || null);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
