import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address, systemKwp, budget, financePreference, calculationId } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase.from('leads').insert({
      name,
      email,
      phone,
      address,
      system_kwp: systemKwp,
      budget_gbp: budget,
      finance_preference: financePreference,
      calculation_id: calculationId,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
