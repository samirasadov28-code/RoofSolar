'use client';

interface Props {
  data: any;
  inputs: any;
  symbol: string;
}

function Row({
  label,
  formula,
  result,
}: {
  label: string;
  formula: string;
  result: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-1 md:gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <p className="md:col-span-3 text-sm font-semibold text-gray-900">{label}</p>
      <p className="md:col-span-6 text-xs md:text-sm text-gray-600 font-mono leading-relaxed break-words">
        {formula}
      </p>
      <p className="md:col-span-3 text-sm font-bold text-gray-900 md:text-right">{result}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
        {title}
      </h3>
      <div className="bg-gray-50 rounded-xl px-4 py-2 border border-gray-100">
        {children}
      </div>
    </div>
  );
}

export function CalculationBreakdown({ data, inputs, symbol }: Props) {
  const annualKwh = data.annualProductionKwh ?? 0;
  const specificYield = inputs.systemKwp > 0 ? annualKwh / inputs.systemKwp : 0;
  const capacityFactorPct = (specificYield / 8760) * 100;
  const peakSunHours = specificYield;

  const selfConsumed = data.selfConsumedKwh ?? 0;
  const exported = data.exportedKwh ?? 0;
  const gridImport = data.gridImportKwh ?? 0;
  const totalConsumption = selfConsumed + gridImport;
  const selfCovPct = totalConsumption > 0 ? (selfConsumed / totalConsumption) * 100 : 0;
  const exportSharePct = annualKwh > 0 ? (exported / annualKwh) * 100 : 0;

  const grossCost = (data.netCapex ?? 0) + (data.grant ?? 0);
  const grant = data.grant ?? 0;
  const netCapex = data.netCapex ?? 0;
  const loanAmount = data.financing?.loanAmount ?? 0;
  const upfrontCash = data.financing?.upfrontCash ?? netCapex;
  const monthlyPayment = data.financing?.monthlyPayment ?? 0;

  const solarSavings1 = data.solarSavingsYear1 ?? 0;
  const exportIncome1 = data.exportIncomeYear1 ?? 0;
  const netSavings1 = data.netSavingsYear1 ?? 0;

  const lifetime = data.lifetimeSavings ?? 0;
  const npv = data.npv ?? 0;
  const irrPct = data.irr != null ? data.irr * 100 : null;
  const paybackYrs = isNaN(data.paybackMonths) ? null : data.paybackMonths / 12;

  const fmt = (n: number) => Math.round(n).toLocaleString();
  const fmtMoney = (n: number) => `${symbol}${Math.round(n).toLocaleString()}`;
  const fmt1 = (n: number) => n.toFixed(1);
  const fmt2 = (n: number) => n.toFixed(2);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h2 className="font-bold text-gray-900">How we calculated this</h2>
          <p className="text-sm text-gray-500">
            Every number on this page comes from these formulas. All figures are
            transparent — verify them against your own spreadsheet if you wish.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 bg-amber-100 border border-amber-300 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 whitespace-nowrap">
          Free · always visible
        </span>
      </div>

      <Section title="1. Solar resource at your site">
        <Row
          label="Specific yield"
          formula={`${fmt(annualKwh)} kWh ÷ ${fmt1(inputs.systemKwp)} kWp`}
          result={`${fmt(specificYield)} kWh/kWp/yr`}
        />
        <Row
          label="Peak sun hours"
          formula="≈ specific yield (1 kWp ≈ 1 kWh per peak sun hour)"
          result={`${fmt(peakSunHours)} hr/yr`}
        />
        <Row
          label="Capacity factor"
          formula={`${fmt(specificYield)} ÷ 8,760 hr × 100`}
          result={`${fmt1(capacityFactorPct)} %`}
        />
        <Row
          label="Annual production"
          formula={`PVGIS modelled output (tilt ${inputs.tiltDeg}° / azimuth ${inputs.azimuthDeg}°, ${inputs.shadingLossPct}% shading)`}
          result={`${fmt(annualKwh)} kWh`}
        />
      </Section>

      <Section title="2. Self-consumption split (year 1)">
        <Row
          label="Self-consumed"
          formula="hourly overlap of production vs household demand"
          result={`${fmt(selfConsumed)} kWh (${fmt1(selfCovPct)} % of consumption)`}
        />
        <Row
          label="Exported to grid"
          formula="excess production after self-use & battery"
          result={`${fmt(exported)} kWh (${fmt1(exportSharePct)} % of generation)`}
        />
        <Row
          label="Grid import"
          formula="consumption shortfall when sun isn't producing"
          result={`${fmt(gridImport)} kWh`}
        />
      </Section>

      <Section title="3. Year-1 cash impact">
        <Row
          label="Solar savings"
          formula={`${fmt(selfConsumed)} kWh × ${symbol}${fmt2(inputs.importPricePerKwh)}/kWh`}
          result={fmtMoney(solarSavings1)}
        />
        <Row
          label="Export income"
          formula={`${fmt(exported)} kWh × ${symbol}${fmt2(inputs.exportPricePerKwh)}/kWh`}
          result={fmtMoney(exportIncome1)}
        />
        {inputs.hasBattery && (
          <Row
            label="Battery value"
            formula={`night-charged kWh × (import − night) price`}
            result={fmtMoney((data.batteryResult?.batteryConsumptionKwh ?? []).reduce((a: number, b: number) => a + b, 0) * inputs.importPricePerKwh)}
          />
        )}
        {inputs.hasEv && data.evCharging && (
          <Row
            label="EV savings"
            formula={`solar-charged miles vs grid charging`}
            result={fmtMoney(data.evCharging.annualSavingVsGrid ?? 0)}
          />
        )}
        <Row
          label="Year-1 net cashflow"
          formula="solar + export + battery + EV − debt service"
          result={fmtMoney(netSavings1)}
        />
      </Section>

      <Section title="4. Capital structure">
        <Row
          label="Gross system cost"
          formula="quote / auto-estimate from panel count + battery"
          result={fmtMoney(grossCost)}
        />
        <Row
          label="Grant"
          formula={`${inputs.countryCode === 'ie' ? 'SEAI' : 'UK scheme'} for ${fmt1(inputs.systemKwp)} kWp`}
          result={`− ${fmtMoney(grant)}`}
        />
        <Row
          label="Net capex"
          formula="gross − grant"
          result={fmtMoney(netCapex)}
        />
        {inputs.financingMode !== 'outright' && (
          <>
            <Row
              label="Loan amount"
              formula={`${fmtMoney(netCapex)} × ${Math.round(inputs.loanCoveragePct * 100)} %`}
              result={fmtMoney(loanAmount)}
            />
            <Row
              label="Upfront cash"
              formula="net capex − loan amount"
              result={fmtMoney(upfrontCash)}
            />
            <Row
              label="Monthly repayment"
              formula={`PMT(${(inputs.annualRatePct * 100).toFixed(2)} % / 12, ${inputs.tenorYears * 12} months, ${fmtMoney(loanAmount)})`}
              result={`${symbol}${monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
          </>
        )}
      </Section>

      <Section title="5. 10-year financial metrics">
        <Row
          label="Lifetime gross savings"
          formula="Σ year-1..10 (solar + export + battery + EV)"
          result={fmtMoney(lifetime)}
        />
        <Row
          label="Payback period"
          formula="first year cumulative cashflow ≥ 0"
          result={paybackYrs != null ? `${fmt1(paybackYrs)} years` : 'N/A'}
        />
        <Row
          label="NPV (8 % discount)"
          formula="Σ cf_t ÷ (1.08)^t"
          result={fmtMoney(npv)}
        />
        <Row
          label="IRR"
          formula={
            data.irrUnavailableReason === 'no_equity'
              ? 'undefined — no equity invested (100 % financed)'
              : 'rate where Σ cf_t ÷ (1+r)^t = 0'
          }
          result={irrPct != null ? `${fmt1(irrPct)} %` : 'N/A'}
        />
      </Section>
    </div>
  );
}
