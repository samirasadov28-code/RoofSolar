'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';

interface ProGateProps {
  calculationId: string;
  children: React.ReactNode;
  preview?: React.ReactNode;
}

export function ProGate({ calculationId, children, preview }: ProGateProps) {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    // Check URL param first (post-Stripe redirect)
    const params = new URLSearchParams(window.location.search);
    if (params.get('pro') === 'true') {
      setIsPro(true);
      setLoading(false);
      return;
    }

    async function check() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setLoading(false); return; }

        const { data } = await supabase
          .from('pro_purchases')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('calculation_id', calculationId)
          .maybeSingle();

        setIsPro(!!data);
      } catch {}
      setLoading(false);
    }

    check();
  }, [calculationId]);

  async function handleUpgrade() {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calculationId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {}
    setCheckoutLoading(false);
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-100 rounded-xl h-48" />;
  }

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200">
      {/* Blurred preview */}
      <div className="filter blur-sm pointer-events-none select-none" aria-hidden>
        {preview ?? children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="font-bold text-gray-900 mb-1">Unlock full analysis</h3>
        <p className="text-sm text-gray-500 mb-4 text-center px-4">
          10-year cashflow, sensitivity matrix, battery economics and PDF report
        </p>
        <button
          onClick={handleUpgrade}
          disabled={checkoutLoading}
          className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-bold px-6 py-2.5 rounded-xl transition-colors"
        >
          {checkoutLoading ? 'Loading…' : 'Unlock for £9.99'}
        </button>
      </div>
    </div>
  );
}
