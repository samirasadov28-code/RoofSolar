'use client';

import type { SensitivityCell } from '@/lib/engine/sensitivity';

interface Props {
  grid: SensitivityCell[];
}

const ENERGY_LABELS: Record<string, string> = {
  bear: 'Energy −20%',
  base: 'Base',
  bull: 'Energy +30%',
};

const EXPORT_LABELS: Record<string, string> = {
  low: 'Export −30%',
  base: 'Base',
  high: 'Export +50%',
};

function cellColor(years: number) {
  if (isNaN(years)) return 'bg-red-100 text-red-800';
  if (years < 8) return 'bg-green-100 text-green-800';
  if (years < 12) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

export function SensitivityMatrix({ grid }: Props) {
  const energyScenarios = ['bear', 'base', 'bull'] as const;
  const exportScenarios = ['low', 'base', 'high'] as const;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="py-2 px-3 text-left text-gray-500 font-medium" />
            {exportScenarios.map((es) => (
              <th key={es} className="py-2 px-3 text-center text-gray-700 font-medium">
                {EXPORT_LABELS[es]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {energyScenarios.map((es) => (
            <tr key={es}>
              <td className="py-2 px-3 text-gray-700 font-medium">{ENERGY_LABELS[es]}</td>
              {exportScenarios.map((xts) => {
                const cell = grid.find(
                  (c) => c.energyPriceScenario === es && c.exportTariffScenario === xts
                );
                const yrs = cell?.paybackYears ?? NaN;
                return (
                  <td key={xts} className={`py-3 px-4 text-center rounded-lg font-bold ${cellColor(yrs)}`}>
                    {isNaN(yrs) ? '—' : `${yrs.toFixed(1)} yr`}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
