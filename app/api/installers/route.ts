import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { sendInstallerWaitlistConfirmation } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_name, contact_name, email, phone, coverage_regions, notes } = body;

    if (!company_name || !email) {
      return NextResponse.json({ error: 'company_name and email are required' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase.from('installer_waitlist').insert({
      company_name,
      contact_name,
      email,
      phone,
      coverage_regions: Array.isArray(coverage_regions) ? coverage_regions : [],
      notes,
    });

    if (error) throw error;

    sendInstallerWaitlistConfirmation(email, company_name).catch(console.error);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
