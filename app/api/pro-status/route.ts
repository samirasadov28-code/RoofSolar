import { NextRequest, NextResponse } from 'next/server';
import { isPaidSessionFor } from '@/lib/proVerification';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id') ?? '';
  const sessionId = request.nextUrl.searchParams.get('session_id');
  const pro = await isPaidSessionFor(sessionId, id);
  return NextResponse.json({ pro }, { headers: { 'Cache-Control': 'no-store' } });
}
