'use client';

import { useProStatus } from '@/lib/hooks/useProStatus';
import { useViewMode } from '@/lib/hooks/useViewMode';

/**
 * Small Pro/Free toggle for the results header. Only renders for users
 * who have Pro unlocked — gives them a single, always-visible way to
 * preview what a free visitor sees without scrolling down to the Pro
 * gate's in-place button.
 */
export function ViewModeToggle({ calculationId }: { calculationId: string }) {
  const { isPro, loading } = useProStatus(calculationId);
  const [mode, setMode] = useViewMode();

  if (loading || !isPro) return null;

  const isFree = mode === 'free';

  return (
    <div
      role="group"
      aria-label="View mode"
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
        ✨ Pro
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
        Free
      </button>
    </div>
  );
}
