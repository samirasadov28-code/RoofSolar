import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { isEarlyAccess } from '@/lib/earlyAccess';
import { isPaidSessionFor } from '@/lib/proVerification';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const supabase = createClient();
    const paidViaStripe = await isPaidSessionFor(request.nextUrl.searchParams.get('session_id'), id);

    let purchase: { id: string } | null = null;
    let calc: { inputs: any; results: any } | null = null;

    if (paidViaStripe) {
      // Anonymous buyers have no login: Stripe confirmed payment for this calculation.
      const { data } = await createServiceClient()
        .from('calculations').select('inputs, results').eq('id', id).single();
      calc = data;
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      const earlyAccess = isEarlyAccess(session.user.email);
      if (!earlyAccess) {
        const { data } = await supabase
          .from('pro_purchases')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('calculation_id', id)
          .maybeSingle();
        if (!data) {
          return NextResponse.json({ error: 'Pro purchase required' }, { status: 403 });
        }
        purchase = data;
      }
      const { data } = await supabase
        .from('calculations').select('inputs, results').eq('id', id).single();
      calc = data;
    }

    if (!calc) return NextResponse.json({ error: 'Calculation not found' }, { status: 404 });

    // Generate PDF server-side
    const { renderToBuffer } = await import('@react-pdf/renderer');
    const React = await import('react');
    const { ReportTemplate } = await import('@/lib/pdf/ReportTemplate');

    const buffer = await renderToBuffer(
      React.default.createElement(ReportTemplate as any, {
        inputs: calc.inputs,
        results: calc.results,
      }) as any
    );

    // Mark PDF as sent (only for actual purchases — early-access has no row)
    if (purchase) {
      await supabase
        .from('pro_purchases')
        .update({ pdf_sent: true })
        .eq('id', purchase.id);
    }

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="roofsolar-report-${id}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error('Report error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
