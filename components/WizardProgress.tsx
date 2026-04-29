'use client';

const STEPS = [
  'Address',
  'Roof',
  'Consumption',
  'System',
  'Tariffs',
  'Financing',
  'Review',
];

export function WizardProgress({ current }: { current: number }) {
  const total = STEPS.length;
  const safeCurrent = Math.min(Math.max(current, 1), total);
  const currentLabel = STEPS[safeCurrent - 1];
  const pct = Math.round((safeCurrent / total) * 100);

  return (
    <>
      {/* Mobile: compact progress bar with current step label */}
      <div className="sm:hidden flex-1 ml-3 max-w-[55%]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-gray-700 truncate">
            <span className="text-amber-600">{safeCurrent}/{total}</span>
            <span className="ml-1.5 text-gray-900">{currentLabel}</span>
          </span>
          <span className="text-[11px] text-gray-500 ml-2 flex-shrink-0">{pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Desktop: full step circles */}
      <div className="hidden sm:flex items-center gap-1">
        {STEPS.map((label, idx) => {
          const step = idx + 1;
          const done = step < safeCurrent;
          const active = step === safeCurrent;
          return (
            <div key={label} className="flex items-center gap-1">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                  done
                    ? 'bg-green-500 text-white'
                    : active
                    ? 'bg-yellow-400 text-gray-900'
                    : 'bg-gray-200 text-gray-500'
                }`}
                title={label}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`h-0.5 w-6 ${done ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
