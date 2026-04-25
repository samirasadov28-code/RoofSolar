'use client';

interface Props {
  data: any;
  inputs: any;
  symbol: string;
}

export function BatteryPanel({ data, inputs, symbol }: Props) {
  const consumed: number[] = data.batteryResult?.batteryConsumptionKwh ?? [];
  const batteryAnnualValue = consumed.reduce((a: number, b: number) => a + b, 0) * (inputs.importPricePerKwh ?? 0);
  const irrWithBattery = data.irr;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <p className="text-xs text-orange-700 font-medium mb-1">Battery size</p>
          <p className="text-2xl font-bold text-orange-800">{inputs.batteryKwh} kWh</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <p className="text-xs text-orange-700 font-medium mb-1">Annual battery value</p>
          <p className="text-2xl font-bold text-orange-800">
            {symbol}{Math.round(batteryAnnualValue).toLocaleString()}
          </p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <p className="text-xs text-orange-700 font-medium mb-1">System IRR</p>
          <p className="text-2xl font-bold text-orange-800">
            {irrWithBattery ? `${(irrWithBattery * 100).toFixed(1)}%` : '—'}
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Your {inputs.batteryKwh} kWh battery stores surplus daytime solar and offsets grid import in the evening,
        adding approximately{' '}
        <strong>{symbol}{Math.round(batteryAnnualValue).toLocaleString()}/yr</strong> of value.
        {inputs.performArbitrage && ' Arbitrage mode is enabled — battery also charges at night rates.'}
      </p>
    </div>
  );
}
