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
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((label, idx) => {
        const step = idx + 1;
        const done = step < current;
        const active = step === current;
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
  );
}
