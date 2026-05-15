'use client';

import { useState } from 'react';
import { APP_VERSION } from '@/lib/version';
import { useT } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/types';

export function ForceUpdateButton() {
  const t = useT();
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
    <div className="w-full flex justify-center py-8">
      <button
        onClick={forceUpdate}
        disabled={busy}
        title={fmt(t.forceUpdate.title, { version: APP_VERSION })}
        className="inline-flex items-center gap-2 bg-white border border-gray-200 shadow-sm hover:shadow-md text-gray-700 hover:text-gray-900 text-xs sm:text-sm font-medium px-4 py-2 rounded-full transition-all disabled:opacity-60"
      >
        <svg
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${busy ? 'animate-spin' : ''}`}
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
        <span>{busy ? t.forceUpdate.updating : t.forceUpdate.btn}</span>
        <span className="text-[10px] sm:text-xs text-gray-400 font-mono border-l border-gray-200 pl-2 ml-0.5">
          v{APP_VERSION}
        </span>
      </button>
    </div>
  );
}
