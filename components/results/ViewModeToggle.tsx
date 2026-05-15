'use client';

import { useProStatus } from '@/lib/hooks/useProStatus';
import { useViewMode } from '@/lib/hooks/useViewMode';
import { useT } from '@/lib/i18n';

export function ViewModeToggle({ calculationId }: { calculationId: string }) {
  const t = useT();
  const { isPro, loading } = useProStatus(calculationId);
  const [mode, setMode] = useViewMode();

  if (loading || !isPro) return null;

  const isFree = mode === 'free';

  return (
    <div
      role="group"
      aria-label={t.viewMode.ariaLabel}
      className="inline-flex items-center bg-gray-100 rounded-full p-0.5 text-xs font-semibold"
    >
      <button
        onClick={() => setMode('pro')}
        className={`px-3 py-1 rounded-full transition-colors ${
          !isFree
            ? 'bg-white text-amber-700 shadow-sm'
            : 'text-gray-500 hover:text-gray-800'
        }`}
        aria-pressed={!isFree}
      >
        {t.viewMode.proBtn}
      </button>
      <button
        onClick={() => setMode('free')}
        className={`px-3 py-1 rounded-full transition-colors ${
          isFree
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-800'
        }`}
        aria-pressed={isFree}
      >
        {t.viewMode.freeBtn}
      </button>
    </div>
  );
}
