'use client';

import { useT } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/types';

interface Props {
  data: any;
  inputs: any;
  symbol: string;
}

export function BatteryPanel({ data, inputs, symbol }: Props) {
  const t = useT();
  const consumed: number[] = data.batteryResult?.batteryConsumptionKwh ?? [];
  const batteryAnnualValue = consumed.reduce((a: number, b: number) => a + b, 0) * (inputs.importPricePerKwh ?? 0);
  const irrWithBattery = data.irr;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <p className="text-xs text-orange-700 font-medium mb-1">{t.battery.size}</p>
          <p className="text-2xl font-bold text-orange-800">{inputs.batteryKwh} kWh</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <p className="text-xs text-orange-700 font-medium mb-1">{t.battery.annualValue}</p>
          <p className="text-2xl font-bold text-orange-800">
            {symbol}{Math.round(batteryAnnualValue).toLocaleString()}
          </p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <p className="text-xs text-orange-700 font-medium mb-1">{t.battery.systemIrr}</p>
          <p className="text-2xl font-bold text-orange-800">
            {irrWithBattery != null ? `${(irrWithBattery * 100).toFixed(1)}%` : t.common.na}
          </p>
          {irrWithBattery == null && data.irrUnavailableReason === 'no_equity' && (
            <p className="text-[10px] text-orange-600 mt-0.5 leading-tight">{t.battery.noEquity}</p>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600">
        {fmt(t.battery.description, {
          kwh: inputs.batteryKwh,
          value: `${symbol}${Math.round(batteryAnnualValue).toLocaleString()}`,
        })}
        {inputs.performArbitrage && ` ${t.battery.arbitrageNote}`}
      </p>
    </div>
  );
}
