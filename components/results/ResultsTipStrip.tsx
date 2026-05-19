'use client';

import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n';

const LS_KEY = 'roofsolar_results_tip_seen';

export function ResultsTipStrip() {
  const t = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(LS_KEY)) setVisible(true);
    } catch {}
  }, []);

  function dismiss() {
    try { localStorage.setItem(LS_KEY, '1'); } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  const steps = [
    { n: '1', text: t.resultsTip.step1 },
    { n: '2', text: t.resultsTip.step2 },
    { n: '3', text: t.resultsTip.step3 },
  ];

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm font-semibold text-amber-900 flex items-center gap-1.5">
          <span>📋</span>
          {t.resultsTip.headline}
        </p>
        <button
          onClick={dismiss}
          aria-label={t.resultsTip.dismiss}
          className="text-amber-500 hover:text-amber-800 transition-colors mt-0.5 shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <ol className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
        {steps.map(({ n, text }) => (
          <li key={n} className="flex items-start gap-2.5">
            <span className="shrink-0 w-5 h-5 rounded-full bg-amber-400 text-amber-900 text-[11px] font-bold flex items-center justify-center mt-0.5">
              {n}
            </span>
            <p className="text-xs text-amber-800 leading-relaxed">{text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-3 flex justify-end">
        <button
          onClick={dismiss}
          className="text-xs font-semibold text-amber-700 hover:text-amber-900 bg-white border border-amber-300 hover:border-amber-500 px-3 py-1.5 rounded-lg transition-colors"
        >
          {t.resultsTip.dismiss}
        </button>
      </div>
    </div>
  );
}
