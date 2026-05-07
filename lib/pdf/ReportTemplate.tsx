import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Rect,
  Line as SvgLine,
  G,
} from '@react-pdf/renderer';
import type { AnnualCashflow } from '@/lib/engine/cashflow';
import { getCountryDefaults } from '@/lib/countryDefaults';

const AMBER = '#fbbf24';
const DARK = '#111827';
const GRAY = '#6b7280';
const LIGHT = '#f9fafb';
const BLUE = '#3b82f6';
const GREEN = '#22c55e';
const RED = '#ef4444';
const BORDER = '#e5e7eb';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: DARK },
  h1: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginBottom: 6 },
  h2: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginBottom: 6, marginTop: 14 },
  h3: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 3, marginTop: 8 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BORDER, paddingVertical: 4 },
  cell: { flex: 1, textAlign: 'right', fontSize: 9 },
  cellLeft: { flex: 2, textAlign: 'left', fontSize: 9 },
  headerRow: { flexDirection: 'row', backgroundColor: LIGHT, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: BORDER },
  metricBox: { backgroundColor: '#fef9c3', borderRadius: 4, padding: 8, flex: 1, marginRight: 6 },
  metricBoxLast: { backgroundColor: '#fef9c3', borderRadius: 4, padding: 8, flex: 1 },
  metricLabel: { fontSize: 8, color: GRAY, marginBottom: 2 },
  metricValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: DARK },
  metricsRow: { flexDirection: 'row', marginBottom: 10 },
  small: { fontSize: 8, color: GRAY },
  tag: { fontSize: 8, color: '#92400e', backgroundColor: '#fef3c7', borderRadius: 3, padding: '2 6', alignSelf: 'flex-start', marginBottom: 6 },
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#9ca3af' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
});

function Footer({ page, total }: { page: number; total: number }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>RoofSolar — Confidential</Text>
      <Text style={styles.footerText}>Page {page} of {total}</Text>
    </View>
  );
}

function MetricRow({ items }: { items: [string, string][] }) {
  return (
    <View style={styles.metricsRow}>
      {items.map(([label, value], i) => (
        <View key={label} style={i < items.length - 1 ? styles.metricBox : styles.metricBoxLast}>
          <Text style={styles.metricLabel}>{label}</Text>
          <Text style={styles.metricValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function sym(cc: string) {
  const s = getCountryDefaults(cc).symbol;
  return s ? s.trim() : '';
}

// SVG bar chart — draws horizontal bars with labels
interface BarChartProps {
  data: { label: string; a: number; b: number }[];
  maxVal: number;
  width: number;
  height: number;
  colorA: string;
  colorB: string;
  labelA: string;
  labelB: string;
}

function SvgBarChart({ data, maxVal, width, height, colorA, colorB, labelA, labelB }: BarChartProps) {
  const leftPad = 28;
  const rightPad = 8;
  const topPad = 8;
  const bottomPad = 20;
  const chartW = width - leftPad - rightPad;
  const chartH = height - topPad - bottomPad;
  const barGroup = chartH / data.length;
  const barH = barGroup * 0.38;

  return (
    <Svg width={width} height={height}>
      {/* Axis line */}
      <SvgLine
        x1={leftPad}
        y1={topPad}
        x2={leftPad}
        y2={topPad + chartH}
        stroke={BORDER}
        strokeWidth={1}
      />
      <SvgLine
        x1={leftPad}
        y1={topPad + chartH}
        x2={leftPad + chartW}
        y2={topPad + chartH}
        stroke={BORDER}
        strokeWidth={1}
      />

      {data.map((d, i) => {
        const y = topPad + i * barGroup;
        const wA = (d.a / maxVal) * chartW;
        const wB = (d.b / maxVal) * chartW;
        return (
          <G key={d.label}>
            <Rect x={leftPad} y={y + 2} width={wA} height={barH} fill={colorA} />
            <Rect x={leftPad} y={y + 2 + barH + 1} width={wB} height={barH} fill={colorB} />
            <Text
              style={{ fontSize: 6.5, fill: GRAY, fontFamily: 'Helvetica' }}
              x={leftPad - 2}
              y={y + barGroup / 2 + 2}
              textAnchor="end"
            >
              {d.label}
            </Text>
          </G>
        );
      })}

      {/* Legend */}
      <Rect x={leftPad} y={topPad + chartH + 5} width={8} height={5} fill={colorA} />
      <Text style={{ fontSize: 7, fill: GRAY }} x={leftPad + 10} y={topPad + chartH + 10}>{labelA}</Text>
      <Rect x={leftPad + 60} y={topPad + chartH + 5} width={8} height={5} fill={colorB} />
      <Text style={{ fontSize: 7, fill: GRAY }} x={leftPad + 72} y={topPad + chartH + 10}>{labelB}</Text>
    </Svg>
  );
}

// Simple vertical bar chart for hourly simulation
interface HourlyChartProps {
  solar: number[];
  load: number[];
  width: number;
  height: number;
}

function HourlySvgChart({ solar, load, width, height }: HourlyChartProps) {
  const leftPad = 20;
  const rightPad = 8;
  const topPad = 4;
  const bottomPad = 16;
  const chartW = width - leftPad - rightPad;
  const chartH = height - topPad - bottomPad;
  const maxVal = Math.max(...solar, ...load) * 1.1 || 1;
  const barW = (chartW / 24) * 0.4;
  const gap = chartW / 24;

  return (
    <Svg width={width} height={height}>
      <SvgLine x1={leftPad} y1={topPad + chartH} x2={leftPad + chartW} y2={topPad + chartH} stroke={BORDER} strokeWidth={1} />
      {solar.map((s, h) => {
        const sH = (s / maxVal) * chartH;
        const lH = (load[h] / maxVal) * chartH;
        const x = leftPad + h * gap;
        return (
          <G key={h}>
            <Rect x={x + 1} y={topPad + chartH - sH} width={barW} height={sH} fill={AMBER} />
            <Rect x={x + 1 + barW + 1} y={topPad + chartH - lH} width={barW} height={lH} fill={RED} fillOpacity={0.5} />
            {h % 6 === 0 && (
              <Text style={{ fontSize: 6, fill: GRAY }} x={x} y={topPad + chartH + 9}>{`${h}h`}</Text>
            )}
          </G>
        );
      })}
      {/* Legend */}
      <Rect x={leftPad} y={2} width={6} height={4} fill={AMBER} />
      <Text style={{ fontSize: 6.5, fill: GRAY }} x={leftPad + 8} y={6}>Solar</Text>
      <Rect x={leftPad + 38} y={2} width={6} height={4} fill={RED} fillOpacity={0.5} />
      <Text style={{ fontSize: 6.5, fill: GRAY }} x={leftPad + 46} y={6}>Load</Text>
    </Svg>
  );
}

interface Props {
  inputs: any;
  results: any;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function ReportTemplate({ inputs, results }: Props) {
  const s = sym(inputs.countryCode);
  const cashflows: AnnualCashflow[] = results.cashflows ?? [];
  const paybackYrs = isNaN(results.paybackMonths) ? 'N/A' : `${(results.paybackMonths / 12).toFixed(1)} yrs`;
  const today = new Date().toLocaleDateString('en-GB');
  const horizonYears = results.horizonYears ?? 25;
  const monthly = results.monthlyProductionKwh ?? [];
  const monthlyConsumption = results.monthlyConsumptionKwh ?? [];
  const hourlyMonths = results.hourlySimulation?.months ?? [];

  const maxMonthlyKwh = Math.max(...monthly, ...monthlyConsumption, 1);

  // Representative days: January (index 0) and July (index 6)
  const janDay = hourlyMonths[0]?.representativeDay ?? [];
  const julDay = hourlyMonths[6]?.representativeDay ?? [];

  const janSolar = janDay.map((s: any) => s.solarKwh);
  const janLoad = janDay.map((s: any) => s.loadKwh);
  const julSolar = julDay.map((s: any) => s.solarKwh);
  const julLoad = julDay.map((s: any) => s.loadKwh);

  const financing = results.financing ?? {};
  const financingMode = inputs.financingMode ?? 'outright';

  return (
    <Document>
      {/* ── Page 1: Cover ── */}
      <Page size="A4" style={styles.page}>
        <View style={{ backgroundColor: DARK, padding: 40, margin: -40, marginBottom: 28 }}>
          <Text style={{ color: AMBER, fontSize: 26, fontFamily: 'Helvetica-Bold' }}>RoofSolar</Text>
          <Text style={{ color: '#f9fafb', fontSize: 17, marginTop: 8 }}>Solar Investment Analysis</Text>
          <Text style={{ color: '#9ca3af', fontSize: 11, marginTop: 6 }}>{inputs.displayName}</Text>
          <Text style={{ color: '#9ca3af', fontSize: 9, marginTop: 3 }}>Generated {today}</Text>
        </View>

        <Text style={styles.h2}>System Summary</Text>
        <MetricRow items={[
          ['System size', `${inputs.systemKwp.toFixed(1)} kWp`],
          ['Panel count', `${inputs.panelCount} × 400W`],
          ['Battery', inputs.hasBattery ? `${inputs.batteryKwh} kWh` : 'None'],
        ]} />
        <MetricRow items={[
          ['Gross system cost', `${s}${((results.netCapex ?? 0) + (results.grant ?? 0)).toLocaleString()}`],
          ['Grant', `${s}${(results.grant ?? 0).toLocaleString()}`],
          ['Net cost', `${s}${(results.netCapex ?? 0).toLocaleString()}`],
        ]} />
        <MetricRow items={[
          ['Annual production', `${Math.round(results.annualProductionKwh ?? 0).toLocaleString()} kWh`],
          ['Annual consumption', `${Math.round(inputs.annualKwh ?? 0).toLocaleString()} kWh`],
          ['CO₂ saved/yr', `${Math.round(results.annualCo2Saved ?? 0).toLocaleString()} kg`],
        ]} />

        <View style={styles.tag}><Text>Solar data source: {results.dataSource}</Text></View>

        <Footer page={1} total={7} />
      </Page>

      {/* ── Page 2: Executive Summary ── */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Executive Summary</Text>
        <MetricRow items={[
          ['Payback period', paybackYrs],
          ['IRR', results.irr != null
            ? `${(results.irr * 100).toFixed(1)}%`
            : results.irrUnavailableReason === 'no_equity' ? 'N/A (no equity)' : 'N/A'],
          ['NPV (8% discount)', `${s}${Math.round(results.npv ?? 0).toLocaleString()}`],
        ]} />
        <MetricRow items={[
          [`${horizonYears}-yr gross savings`, `${s}${Math.round(results.lifetimeSavings ?? 0).toLocaleString()}`],
          ['Year 1 solar savings', `${s}${Math.round(results.solarSavingsYear1 ?? 0).toLocaleString()}`],
          ['Year 1 export income', `${s}${Math.round(results.exportIncomeYear1 ?? 0).toLocaleString()}`],
        ]} />
        <MetricRow items={[
          ['Self-consumed (yr 1)', `${Math.round(results.selfConsumedKwh ?? 0).toLocaleString()} kWh`],
          ['Exported (yr 1)', `${Math.round(results.exportedKwh ?? 0).toLocaleString()} kWh`],
          ['Net yr-1 cashflow', `${s}${Math.round(results.netSavingsYear1 ?? 0).toLocaleString()}`],
        ]} />

        <Text style={styles.h2}>Monthly Production vs Consumption</Text>
        <SvgBarChart
          data={MONTH_NAMES.map((name, i) => ({
            label: name,
            a: monthly[i] ?? 0,
            b: monthlyConsumption[i] ?? 0,
          }))}
          maxVal={maxMonthlyKwh}
          width={515}
          height={160}
          colorA={AMBER}
          colorB={BLUE}
          labelA="Production kWh"
          labelB="Consumption kWh"
        />

        <Footer page={2} total={7} />
      </Page>

      {/* ── Page 3: 25-Year Cashflow ── */}
      <Page size="A4" style={{ ...styles.page, fontSize: 8 }}>
        <Text style={styles.h1}>{horizonYears}-Year Cashflow</Text>
        <View style={styles.headerRow}>
          {['Yr', 'Solar', 'Export', 'Battery', 'EV', 'Debt svc', 'Net', 'Cumulative'].map((h) => (
            <Text key={h} style={{ flex: 1, fontFamily: 'Helvetica-Bold', textAlign: 'right', fontSize: 7.5 }}>{h}</Text>
          ))}
        </View>
        {cashflows.map((row, idx) => (
          <View key={row.year} style={{
            ...styles.row,
            backgroundColor: idx % 2 === 0 ? '#ffffff' : LIGHT,
          }}>
            {[
              row.year,
              Math.round(row.solarSavings),
              Math.round(row.exportIncome),
              Math.round(row.batteryValue),
              Math.round(row.evSavings),
              Math.round(row.debtService),
              Math.round(row.netCashflow),
              Math.round(row.cumulativeCashflow),
            ].map((v, i) => (
              <Text key={i} style={{
                flex: 1,
                textAlign: 'right',
                fontSize: 7.5,
                color: i === 7
                  ? (Number(v) >= 0 ? '#16a34a' : RED)
                  : i === 6
                  ? (Number(v) >= 0 ? '#16a34a' : RED)
                  : DARK,
              }}>
                {i === 0 ? String(v) : `${s}${Number(v).toLocaleString()}`}
              </Text>
            ))}
          </View>
        ))}
        <Text style={{ ...styles.small, marginTop: 6 }}>
          Energy price escalation: 3%/yr · Panel degradation: 0.5%/yr · Inverter replacement at year {results.inverterReplacementYear ?? 12}
        </Text>
        <Footer page={3} total={7} />
      </Page>

      {/* ── Page 4: Hourly Energy Flows ── */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Hourly Energy Flows</Text>
        <Text style={{ ...styles.small, marginBottom: 10 }}>
          Representative day simulation — solar generation vs household load. Battery absorbs
          midday surplus and returns it during the evening peak.
        </Text>

        <Text style={styles.h2}>January (Representative Day)</Text>
        {janSolar.length > 0 ? (
          <HourlySvgChart solar={janSolar} load={janLoad} width={515} height={90} />
        ) : (
          <Text style={styles.small}>Hourly data not available</Text>
        )}

        <Text style={styles.h2}>July (Representative Day)</Text>
        {julSolar.length > 0 ? (
          <HourlySvgChart solar={julSolar} load={julLoad} width={515} height={90} />
        ) : (
          <Text style={styles.small}>Hourly data not available</Text>
        )}

        {hourlyMonths.length > 0 && (
          <>
            <Text style={styles.h2}>Monthly Average Day Summary</Text>
            <View style={styles.headerRow}>
              {['Month', 'Solar kWh', 'Self-use kWh', 'Grid import kWh', 'Grid export kWh'].map((h) => (
                <Text key={h} style={{ flex: 1, fontFamily: 'Helvetica-Bold', textAlign: 'right', fontSize: 8 }}>{h}</Text>
              ))}
            </View>
            {hourlyMonths.map((mp: any) => (
              <View key={mp.month} style={styles.row}>
                <Text style={{ flex: 1, textAlign: 'right', fontSize: 8 }}>{MONTH_NAMES[mp.month]}</Text>
                <Text style={{ flex: 1, textAlign: 'right', fontSize: 8 }}>{mp.dailySolarKwh.toFixed(2)}</Text>
                <Text style={{ flex: 1, textAlign: 'right', fontSize: 8, color: GREEN }}>{mp.dailySelfConsumedKwh.toFixed(2)}</Text>
                <Text style={{ flex: 1, textAlign: 'right', fontSize: 8, color: RED }}>{mp.dailyGridImportKwh.toFixed(2)}</Text>
                <Text style={{ flex: 1, textAlign: 'right', fontSize: 8, color: BLUE }}>{mp.dailyGridExportKwh.toFixed(2)}</Text>
              </View>
            ))}
          </>
        )}

        <Footer page={4} total={7} />
      </Page>

      {/* ── Page 5: Sensitivity Matrix ── */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Sensitivity Analysis</Text>
        <Text style={{ ...styles.small, marginBottom: 10 }}>
          Payback period (years) under varying energy price and export tariff scenarios.
        </Text>

        <View style={styles.headerRow}>
          {['', 'Export −30%', 'Export Base', 'Export +50%'].map((h) => (
            <Text key={h} style={{ flex: 1, fontFamily: 'Helvetica-Bold', textAlign: 'center', fontSize: 9 }}>{h}</Text>
          ))}
        </View>
        {(['bear', 'base', 'bull'] as const).map((es) => (
          <View key={es} style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: BORDER }}>
            <Text style={{ flex: 1, fontFamily: 'Helvetica-Bold', fontSize: 9 }}>
              {es === 'bear' ? 'Energy −20%' : es === 'base' ? 'Base' : 'Energy +30%'}
            </Text>
            {(['low', 'base', 'high'] as const).map((xts) => {
              const cell = results.sensitivity?.grid?.find(
                (c: any) => c.energyPriceScenario === es && c.exportTariffScenario === xts
              );
              return (
                <Text key={xts} style={{ flex: 1, textAlign: 'center', fontSize: 9, fontFamily: xts === 'base' && es === 'base' ? 'Helvetica-Bold' : 'Helvetica' }}>
                  {cell?.paybackYears != null ? `${cell.paybackYears.toFixed(1)} yr` : '—'}
                </Text>
              );
            })}
          </View>
        ))}

        <Text style={{ ...styles.h2, marginTop: 18 }}>Key Assumptions</Text>
        {[
          ['Bear case', 'Energy prices 20% lower, export tariff 30% lower'],
          ['Base case', 'Current market rates as entered'],
          ['Bull case', 'Energy prices 30% higher, export tariff 50% higher'],
        ].map(([k, v]) => (
          <View key={k} style={styles.row}>
            <Text style={styles.cellLeft}>{k}</Text>
            <Text style={{ ...styles.cell, flex: 3, textAlign: 'left' }}>{v}</Text>
          </View>
        ))}

        <Footer page={5} total={7} />
      </Page>

      {/* ── Page 6: Financing Comparison ── */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Financing Comparison</Text>
        <Text style={{ ...styles.small, marginBottom: 10 }}>
          How your selected financing structure affects year-1 cashflow and total cost of ownership.
        </Text>

        <MetricRow items={[
          ['Net system cost', `${s}${(results.netCapex ?? 0).toLocaleString()}`],
          ['Financing mode', financingMode === 'outright' ? 'Cash purchase' : financingMode === 'loan' ? 'Solar loan' : 'Hire purchase'],
          ['Loan amount', financing.loanAmount > 0 ? `${s}${Math.round(financing.loanAmount).toLocaleString()}` : 'N/A'],
        ]} />

        {financingMode !== 'outright' && (
          <MetricRow items={[
            ['Upfront cash', `${s}${Math.round(financing.upfrontCash ?? 0).toLocaleString()}`],
            ['Monthly repayment', `${s}${(financing.monthlyPayment ?? 0).toFixed(2)}`],
            ['Total interest paid', (() => {
              const total = (financing.monthlyPayment ?? 0) * (inputs.tenorYears ?? 0) * 12;
              const interest = total - (financing.loanAmount ?? 0);
              return `${s}${Math.round(Math.max(0, interest)).toLocaleString()}`;
            })()],
          ]} />
        )}

        <Text style={styles.h2}>Year-by-Year Net Cashflow (first 10 years)</Text>
        <View style={styles.headerRow}>
          {['Year', 'Total income', 'Debt service', 'Net cashflow', 'Cumulative'].map((h) => (
            <Text key={h} style={{ flex: 1, fontFamily: 'Helvetica-Bold', textAlign: 'right', fontSize: 8.5 }}>{h}</Text>
          ))}
        </View>
        {cashflows.slice(0, 11).map((row, idx) => {
          const income = row.solarSavings + row.exportIncome + row.batteryValue + row.evSavings;
          return (
            <View key={row.year} style={{ ...styles.row, backgroundColor: idx % 2 === 0 ? '#ffffff' : LIGHT }}>
              <Text style={{ flex: 1, textAlign: 'right', fontSize: 8.5 }}>{row.year}</Text>
              <Text style={{ flex: 1, textAlign: 'right', fontSize: 8.5 }}>{s}{Math.round(income).toLocaleString()}</Text>
              <Text style={{ flex: 1, textAlign: 'right', fontSize: 8.5, color: row.debtService > 0 ? RED : GRAY }}>{row.debtService > 0 ? `−${s}${Math.round(row.debtService).toLocaleString()}` : '—'}</Text>
              <Text style={{ flex: 1, textAlign: 'right', fontSize: 8.5, color: row.netCashflow >= 0 ? '#16a34a' : RED }}>{s}{Math.round(row.netCashflow).toLocaleString()}</Text>
              <Text style={{ flex: 1, textAlign: 'right', fontSize: 8.5, color: row.cumulativeCashflow >= 0 ? '#16a34a' : RED }}>{s}{Math.round(row.cumulativeCashflow).toLocaleString()}</Text>
            </View>
          );
        })}

        <Footer page={6} total={7} />
      </Page>

      {/* ── Page 7: Assumptions & Methodology ── */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Assumptions &amp; Methodology</Text>

        <Text style={styles.h3}>Input Parameters</Text>
        {[
          ['Location', inputs.displayName],
          ['System size', `${inputs.systemKwp.toFixed(1)} kWp (${inputs.panelCount} × 400W panels)`],
          ['Roof pitch / orientation', `${inputs.tiltDeg}° tilt / ${inputs.azimuthDeg}° azimuth`],
          ['Shading loss', `${inputs.shadingLossPct}%`],
          ['Annual consumption', `${(inputs.annualKwh ?? 0).toLocaleString()} kWh`],
          ['Import price', `${s}${inputs.importPricePerKwh}/kWh`],
          ['Export rate', `${s}${inputs.exportPricePerKwh}/kWh`],
          ['Solar data source', results.dataSource ?? 'PVGIS'],
          ['Battery', inputs.hasBattery ? `${inputs.batteryKwh} kWh (${inputs.performArbitrage ? 'arbitrage enabled' : 'solar buffer only'})` : 'None'],
          ['Horizon', `${horizonYears} years (panel warranty period)`],
        ].map(([k, v]) => (
          <View key={k} style={styles.row}>
            <Text style={styles.cellLeft}>{k}</Text>
            <Text style={{ ...styles.cell, flex: 3, textAlign: 'left' }}>{v}</Text>
          </View>
        ))}

        <Text style={styles.h3}>Modelling Assumptions</Text>
        {[
          ['Panel degradation', '0.5%/yr linear'],
          ['Energy price escalation', '3%/yr'],
          ['System losses (inverter + wiring)', '14% (baked into PVGIS/NREL request)'],
          ['Self-consumption model', 'Monthly balance with time-of-day cap (profileCap parameter)'],
          ['Battery arbitrage', 'Pre-charges to (capacity − expected solar surplus) each night'],
          ['Hourly simulation', 'Gaussian solar bell curve (σ = 2.5–3.2 h) + standard residential load shape (morning + evening peaks)'],
          ['IRR', 'Internal rate of return on equity invested; undefined when equity = 0'],
          ['NPV discount rate', '8% real (roughly in-line with 10-yr equity market returns)'],
          ['CO₂ factor', `${(results.co2FactorKgPerKwh ?? 0.475).toFixed(3)} kg/kWh (grid mix for ${inputs.countryCode?.toUpperCase() || 'your region'})`],
          ['Inverter replacement', `Year ${results.inverterReplacementYear ?? 12}, ${s}${(results.inverterReplacementCost ?? 1200).toLocaleString()}`],
        ].map(([k, v]) => (
          <View key={k} style={styles.row}>
            <Text style={styles.cellLeft}>{k}</Text>
            <Text style={{ ...styles.cell, flex: 3, textAlign: 'left' }}>{v}</Text>
          </View>
        ))}

        <Text style={{ ...styles.small, marginTop: 14 }}>
          This report is for informational purposes only. Actual results depend on installer quality,
          panel orientation, shading, grid connection terms, and future energy prices. Consult a
          qualified, locally-accredited solar installer before making investment decisions.
        </Text>

        <Footer page={7} total={7} />
      </Page>
    </Document>
  );
}
