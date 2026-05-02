'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { isEarlyAccess } from '@/lib/earlyAccess';

interface ProGateProps {
  calculationId: string;
  children: React.ReactNode;
  preview?: React.ReactNode;
}

export function ProGate({ calculationId, children, preview }: ProGateProps) {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  // When Pro is unlocked, the user can manually flip to the locked
  // preview to compare what a free visitor would see.
  const [showFreeView, setShowFreeView] = useState(false);

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

        // Early-access allowlist bypasses the paywall.
        if (isEarlyAccess(session.user.email)) {
          setIsPro(true);
          setLoading(false);
          return;
        }

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

  // Pro unlocked + showing real Pro content
  if (isPro && !showFreeView) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-amber-600 text-lg leading-none">✨</span>
            <p className="text-sm text-amber-800 truncate">
              <span className="font-bold">Pro view</span> — full analysis unlocked
            </p>
          </div>
          <button
            onClick={() => setShowFreeView(true)}
            className="text-xs sm:text-sm font-semibold text-amber-700 hover:text-amber-900 border border-amber-300 hover:border-amber-500 bg-white rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap"
          >
            Show free version
          </button>
        </div>
        {children}
      </div>
    );
  }

  // Pro unlocked but user clicked "Show free version" — show the locked
  // preview with a clear way back to Pro.
  if (isPro && showFreeView) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-gray-500 text-lg leading-none">🔒</span>
            <p className="text-sm text-gray-700 truncate">
              <span className="font-bold">Free preview</span> — what visitors without Pro see
            </p>
          </div>
          <button
            onClick={() => setShowFreeView(false)}
            className="text-xs sm:text-sm font-semibold text-gray-900 bg-yellow-400 hover:bg-yellow-300 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap"
          >
            Back to Pro view
          </button>
        </div>
        {renderLocked()}
      </div>
    );
  }

  // Default: not Pro, show locked preview with upgrade CTA
  return renderLocked();

  function renderLocked() {
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
          {isPro ? (
            <button
              onClick={() => setShowFreeView(false)}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-2.5 rounded-xl transition-colors"
            >
              Back to Pro view
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={checkoutLoading}
              className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-bold px-6 py-2.5 rounded-xl transition-colors"
            >
              {checkoutLoading ? 'Loading…' : 'Unlock for £3.99'}
            </button>
          )}
        </div>
      </div>
    );
  }
}
