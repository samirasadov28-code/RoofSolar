'use client';

import { getGrantSchemeName, getGrantMechanism } from '@/lib/engine/grants';
import { useT } from '@/lib/i18n';

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
  const t = useT();
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

  const fmtN = (n: number) => Math.round(n).toLocaleString();
  const fmtMoney = (n: number) => `${symbol}${Math.round(n).toLocaleString()}`;
  const fmt1 = (n: number) => n.toFixed(1);
  const fmt2 = (n: number) => n.toFixed(2);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h2 className="font-bold text-gray-900">{t.calcBreakdown.title}</h2>
          <p className="text-sm text-gray-500">{t.calcBreakdown.subtitle}</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 bg-amber-100 border border-amber-300 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 whitespace-nowrap">
          {t.calcBreakdown.freeBadge}
        </span>
      </div>

      <Section title={t.calcBreakdown.section1}>
        <Row
          label={t.calcBreakdown.specificYield}
          formula={`${fmtN(annualKwh)} kWh ÷ ${fmt1(inputs.systemKwp)} kWp`}
          result={`${fmtN(specificYield)} kWh/kWp/yr`}
        />
        <Row
          label={t.calcBreakdown.peakSunHours}
          formula="≈ specific yield (1 kWp ≈ 1 kWh per peak sun hour)"
          result={`${fmtN(peakSunHours)} hr/yr`}
        />
        <Row
          label={t.calcBreakdown.capacityFactor}
          formula={`${fmtN(specificYield)} ÷ 8,760 hr × 100`}
          result={`${fmt1(capacityFactorPct)} %`}
        />
        <Row
          label={t.calcBreakdown.annualProduction}
          formula={`PVGIS modelled output (tilt ${inputs.tiltDeg}° / azimuth ${inputs.azimuthDeg}°, ${inputs.shadingLossPct}% shading)`}
          result={`${fmtN(annualKwh)} kWh`}
        />
      </Section>

      <Section title={t.calcBreakdown.section2}>
        <Row
          label={t.calcBreakdown.selfConsumed}
          formula="hourly overlap of production vs household demand"
          result={`${fmtN(selfConsumed)} kWh (${fmt1(selfCovPct)} % of consumption)`}
        />
        <Row
          label={t.calcBreakdown.exportedToGrid}
          formula="excess production after self-use & battery"
          result={`${fmtN(exported)} kWh (${fmt1(exportSharePct)} % of generation)`}
        />
        <Row
          label={t.calcBreakdown.gridImport}
          formula="consumption shortfall when sun isn't producing"
          result={`${fmtN(gridImport)} kWh`}
        />
      </Section>

      <Section title={t.calcBreakdown.section3}>
        <Row
          label={t.calcBreakdown.solarSavings}
          formula={`${fmtN(selfConsumed)} kWh × ${symbol}${fmt2(inputs.importPricePerKwh)}/kWh`}
          result={fmtMoney(solarSavings1)}
        />
        <Row
          label={t.calcBreakdown.exportIncome}
          formula={`${fmtN(exported)} kWh × ${symbol}${fmt2(inputs.exportPricePerKwh)}/kWh`}
          result={fmtMoney(exportIncome1)}
        />
        {inputs.hasBattery && (
          <Row
            label={t.calcBreakdown.batteryValue}
            formula="night-charged kWh × (import − night) price"
            result={fmtMoney((data.batteryResult?.batteryConsumptionKwh ?? []).reduce((a: number, b: number) => a + b, 0) * inputs.importPricePerKwh)}
          />
        )}
        {inputs.hasEv && data.evCharging && (
          <Row
            label={t.calcBreakdown.evSavings}
            formula="solar-charged miles vs grid charging"
            result={fmtMoney(data.evCharging.annualSavingVsGrid ?? 0)}
          />
        )}
        <Row
          label={t.calcBreakdown.year1Net}
          formula="solar + export + battery + EV − debt service"
          result={fmtMoney(netSavings1)}
        />
      </Section>

      <Section title={t.calcBreakdown.section4}>
        <Row
          label={t.calcBreakdown.grossCost}
          formula="quote / auto-estimate from panel count + battery"
          result={fmtMoney(grossCost)}
        />
        <Row
          label={t.calcBreakdown.grantIncentive}
          formula={`${getGrantSchemeName(inputs.countryCode)} — ${getGrantMechanism(inputs.countryCode)}`}
          result={`− ${fmtMoney(grant)}`}
        />
        <Row
          label={t.calcBreakdown.netCapex}
          formula="gross − grant"
          result={fmtMoney(netCapex)}
        />
        {inputs.financingMode !== 'outright' && (
          <>
            <Row
              label={t.calcBreakdown.loanAmount}
              formula={`${fmtMoney(netCapex)} × ${Math.round(inputs.loanCoveragePct * 100)} %`}
              result={fmtMoney(loanAmount)}
            />
            <Row
              label={t.calcBreakdown.upfrontCash}
              formula="net capex − loan amount"
              result={fmtMoney(upfrontCash)}
            />
            <Row
              label={t.calcBreakdown.monthlyRepayment}
              formula={`PMT(${(inputs.annualRatePct * 100).toFixed(2)} % / 12, ${inputs.tenorYears * 12} months, ${fmtMoney(loanAmount)})`}
              result={`${symbol}${monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
          </>
        )}
      </Section>

      <Section title={t.calcBreakdown.section5}>
        <Row
          label={t.calcBreakdown.lifetimeGross}
          formula="Σ year-1..N (solar + export + battery + EV) — N is the panel warranty horizon"
          result={fmtMoney(lifetime)}
        />
        <Row
          label={t.calcBreakdown.paybackPeriod}
          formula="first year cumulative cashflow ≥ 0"
          result={paybackYrs != null ? `${fmt1(paybackYrs)} years` : t.common.na}
        />
        <Row
          label={t.calcBreakdown.npvLabel}
          formula="Σ cf_t ÷ (1.08)^t"
          result={fmtMoney(npv)}
        />
        <Row
          label={t.calcBreakdown.irrLabel}
          formula={
            data.irrUnavailableReason === 'no_equity'
              ? t.calcBreakdown.irrNoEquity
              : 'rate where Σ cf_t ÷ (1+r)^t = 0'
          }
          result={irrPct != null ? `${fmt1(irrPct)} %` : t.common.na}
        />
      </Section>
    </div>
  );
}
