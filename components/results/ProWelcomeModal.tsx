'use client';

import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n';

interface Props {
  calculationId: string;
  isPro: boolean;
}

function lsKey(id: string) {
  return `roofsolar_pro_welcomed_${id}`;
}

const FEATURES = [
  {
    icon: '📊',
    titleKey: 'f1Title' as const,
    descKey: 'f1Desc' as const,
    color: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100 text-blue-700',
  },
  {
    icon: '🎛️',
    titleKey: 'f2Title' as const,
    descKey: 'f2Desc' as const,
    color: 'bg-amber-50 border-amber-200',
    iconBg: 'bg-amber-100 text-amber-700',
  },
  {
    icon: '📈',
    titleKey: 'f3Title' as const,
    descKey: 'f3Desc' as const,
    color: 'bg-green-50 border-green-200',
    iconBg: 'bg-green-100 text-green-700',
  },
  {
    icon: '📄',
    titleKey: 'f4Title' as const,
    descKey: 'f4Desc' as const,
    color: 'bg-purple-50 border-purple-200',
    iconBg: 'bg-purple-100 text-purple-700',
  },
];

export function ProWelcomeModal({ calculationId, isPro }: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isPro) return;
    try {
      if (!localStorage.getItem(lsKey(calculationId))) setOpen(true);
    } catch {}
  }, [isPro, calculationId]);

  function dismiss() {
    try { localStorage.setItem(lsKey(calculationId), '1'); } catch {}
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-yellow-300 rounded-t-2xl px-6 py-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-900 mb-1">
            {t.proWelcome.badge}
          </p>
          <h2 className="text-xl font-extrabold text-gray-900">{t.proWelcome.title}</h2>
          <p className="text-sm text-amber-800 mt-1">{t.proWelcome.subtitle}</p>
        </div>

        {/* Feature cards */}
        <div className="p-5 space-y-3">
          {FEATURES.map((f) => (
            <div key={f.titleKey} className={`flex items-start gap-3 rounded-xl border p-3.5 ${f.color}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${f.iconBg}`}>
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{t.proWelcome[f.titleKey]}</p>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{t.proWelcome[f.descKey]}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-5 pb-5">
          <button
            onClick={dismiss}
            className="w-full bg-gray-900 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            {t.proWelcome.exploreBtn} ↓
          </button>
        </div>
      </div>
    </div>
  );
}
