'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { isEarlyAccess } from '@/lib/earlyAccess';

const EARLY_ACCESS_LS_KEY = 'roofsolar_early_access_email';

/**
 * Shared Pro-unlock detection used by ProGate and by any UI element that
 * wants to react to Pro state (e.g. the view-mode toggle in the results
 * header). Resolves in this order:
 *   1. URL `?pro=true` (post-Stripe redirect)
 *   2. localStorage early-access email
 *   3. Supabase session + early-access email or pro_purchases row
 */
export function useProStatus(calculationId: string) {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pro') === 'true') {
      setIsPro(true);
      setLoading(false);
      return;
    }

    try {
      const saved = localStorage.getItem(EARLY_ACCESS_LS_KEY);
      if (saved && isEarlyAccess(saved)) {
        setIsPro(true);
        setLoading(false);
        return;
      }
    } catch {}

    async function check() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setLoading(false); return; }

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

  return { isPro, loading };
}
