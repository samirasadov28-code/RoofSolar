'use client';

import { useState, useEffect, useCallback } from 'react';

export type ViewMode = 'pro' | 'free';

/**
 * View-mode toggle (Pro / Free) backed by the URL search param `?view=free`.
 * Lets multiple components (the header toggle, ProGate itself, etc.) stay
 * in sync, and makes the choice shareable / refreshable.
 */
export function useViewMode(): [ViewMode, (m: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>('pro');

  useEffect(() => {
    const read = () => {
      const p = new URLSearchParams(window.location.search);
      setMode(p.get('view') === 'free' ? 'free' : 'pro');
    };
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);

  const setModeAndUrl = useCallback((m: ViewMode) => {
    setMode(m);
    const url = new URL(window.location.href);
    if (m === 'free') url.searchParams.set('view', 'free');
    else url.searchParams.delete('view');
    window.history.replaceState({}, '', url.toString());
    // Dispatch a synthetic popstate so other hook instances re-read.
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  return [mode, setModeAndUrl];
}
