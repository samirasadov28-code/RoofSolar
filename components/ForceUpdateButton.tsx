'use client';

import { useState } from 'react';
import { APP_VERSION } from '@/lib/version';

export function ForceUpdateButton() {
  const [busy, setBusy] = useState(false);

  async function forceUpdate() {
    if (busy) return;
    setBusy(true);
    try {
      try { sessionStorage.clear(); } catch {}
      try { localStorage.clear(); } catch {}
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch {}
    const url = new URL(window.location.href);
    url.searchParams.set('v', String(Date.now()));
    window.location.replace(url.toString());
  }

  return (
    <button
      onClick={forceUpdate}
      disabled={busy}
      className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 border border-gray-300 hover:border-gray-500 rounded-full px-3 py-1 transition-colors disabled:opacity-50"
      title={`Clear cached data and reload (v${APP_VERSION})`}
    >
      <svg
        className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="M21 4v5h-5" />
      </svg>
      {busy ? 'Updating…' : 'Force update'}
    </button>
  );
}
