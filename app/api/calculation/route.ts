import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase';
import { isPaidSessionFor } from '@/lib/proVerification';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id') ?? '';
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return NextResponse.json({ error: 'Invalid calculation' }, { status: 400 });
  try {
    const paid = await isPaidSessionFor(request.nextUrl.searchParams.get('session_id'), id);
    let client;
    if (paid) client = createServiceClient();
    else {
      client = createClient();
      const { data: { user } } = await client.auth.getUser();
      if (!user) return NextResponse.json({ error: 'Sign in or use your purchased report link' }, { status: 401 });
    }
    const { data, error } = await client.from('calculations').select('inputs, results').eq('id', id).single();
    if (error || !data) return NextResponse.json({ error: 'Calculation unavailable' }, { status: 404 });
    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not load this analysis. Please try again.' }, { status: 503 });
  }
}
