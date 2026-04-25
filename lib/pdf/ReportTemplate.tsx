import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { AnnualCashflow } from '@/lib/engine/cashflow';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#111827' },
  h1: { fontSize: 22, fontFamily: 'Helvetica-Bold', marginBottom: 6 },
  h2: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 8, marginTop: 16 },
  h3: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 5 },
  cell: { flex: 1, textAlign: 'right' },
  cellLeft: { flex: 2, textAlign: 'left' },
  header: { flexDirection: 'row', backgroundColor: '#f9fafb', paddingVertical: 6, marginBottom: 2 },
  metricBox: { backgroundColor: '#fef9c3', borderRadius: 4, padding: 10, marginBottom: 8, flex: 1, marginRight: 8 },
  metricLabel: { fontSize: 8, color: '#6b7280', marginBottom: 3 },
  metricValue: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#111827' },
  metricsRow: { flexDirection: 'row', marginBottom: 16 },
  small: { fontSize: 8, color: '#6b7280' },
  tag: { fontSize: 8, color: '#92400e', backgroundColor: '#fef3c7', borderRadius: 3, padding: '2 6', alignSelf: 'flex-start', marginBottom: 8 },
});

interface Props {
  inputs: any;
  results: any;
}

function sym(cc: string) { return cc === 'ie' ? '€' : cc === 'gb' ? '£' : ''; }

export function ReportTemplate({ inputs, results }: Props) {
  const s = sym(inputs.countryCode);
  const cashflows: AnnualCashflow[] = results.cashflows ?? [];
  const paybackYrs = isNaN(results.paybackMonths) ? 'N/A' : `${(results.paybackMonths / 12).toFixed(1)} yrs`;
  const today = new Date().toLocaleDateString('en-GB');

  return (
    <Document>
      {/* Page 1: Cover */}
      <Page size="A4" style={styles.page}>
        <View style={{ backgroundColor: '#111827', padding: 40, margin: -40, marginBottom: 30 }}>
          <Text style={{ color: '#fbbf24', fontSize: 24, fontFamily: 'Helvetica-Bold' }}>RoofSolar</Text>
          <Text style={{ color: '#f9fafb', fontSize: 16, marginTop: 8 }}>Solar Investment Analysis</Text>
          <Text style={{ color: '#9ca3af', fontSize: 10, marginTop: 4 }}>{inputs.displayName}</Text>
          <Text style={{ color: '#9ca3af', fontSize: 9, marginTop: 2 }}>Generated {today}</Text>
        </View>

        <Text style={styles.h2}>System Summary</Text>
        <View style={styles.metricsRow}>
          {[
            ['System size', `${inputs.systemKwp.toFixed(1)} kWp`],
            ['Panel count', `${inputs.panelCount} × 400W`],
            ['Battery', inputs.hasBattery ? `${inputs.batteryKwh} kWh` : 'None'],
          ].map(([l, v]) => (
            <View key={l} style={styles.metricBox}>
              <Text style={styles.metricLabel}>{l}</Text>
              <Text style={styles.metricValue}>{v}</Text>
            </View>
          ))}
        </View>
        <View style={styles.metricsRow}>
          {[
            ['Gross cost', `${s}${(results.netCapex + results.grant).toLocaleString()}`],
            ['Grant', `${s}${results.grant.toLocaleString()}`],
            ['Net cost', `${s}${results.netCapex.toLocaleString()}`],
          ].map(([l, v]) => (
            <View key={l} style={styles.metricBox}>
              <Text style={styles.metricLabel}>{l}</Text>
              <Text style={styles.metricValue}>{v}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* Page 2: Executive Summary */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Executive Summary</Text>
        <View style={styles.metricsRow}>
          {[
            ['Payback period', paybackYrs],
            ['IRR', results.irr ? `${(results.irr * 100).toFixed(1)}%` : 'N/A'],
            ['NPV (8%)', `${s}${Math.round(results.npv ?? 0).toLocaleString()}`],
          ].map(([l, v]) => (
            <View key={l} style={styles.metricBox}>
              <Text style={styles.metricLabel}>{l}</Text>
              <Text style={styles.metricValue}>{v}</Text>
            </View>
          ))}
        </View>
        <View style={styles.metricsRow}>
          {[
            ['10yr gross savings', `${s}${Math.round(results.lifetimeSavings ?? 0).toLocaleString()}`],
            ['Annual CO₂ saved', `${Math.round(results.annualCo2Saved)} kg`],
            ['Year 1 net saving', `${s}${Math.round(results.netSavingsYear1 ?? 0).toLocaleString()}`],
          ].map(([l, v]) => (
            <View key={l} style={styles.metricBox}>
              <Text style={styles.metricLabel}>{l}</Text>
              <Text style={styles.metricValue}>{v}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* Page 3: 10-Year Cashflow Table */}
      <Page size="A4" style={{ ...styles.page, fontSize: 8 }}>
        <Text style={styles.h1}>10-Year Cashflow</Text>
        <View style={styles.header}>
          {['Year', 'Solar Savings', 'Export Income', 'Battery', 'EV', 'Debt Service', 'Net', 'Cumulative'].map((h) => (
            <Text key={h} style={{ flex: 1, fontFamily: 'Helvetica-Bold', textAlign: 'right', fontSize: 8 }}>{h}</Text>
          ))}
        </View>
        {cashflows.map((row) => (
          <View key={row.year} style={styles.row}>
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
              <Text key={i} style={{ flex: 1, textAlign: 'right' }}>
                {i === 0 ? v : `${s}${v.toLocaleString()}`}
              </Text>
            ))}
          </View>
        ))}
      </Page>

      {/* Page 4: Sensitivity Matrix */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Sensitivity Analysis</Text>
        <Text style={{ ...styles.small, marginBottom: 12 }}>Payback period (years) under varying energy price and export tariff assumptions.</Text>
        <View style={{ ...styles.header, marginBottom: 4 }}>
          {['', 'Export −30%', 'Export Base', 'Export +50%'].map((h) => (
            <Text key={h} style={{ flex: 1, fontFamily: 'Helvetica-Bold', textAlign: 'center', fontSize: 9 }}>{h}</Text>
          ))}
        </View>
        {(['bear', 'base', 'bull'] as const).map((es) => (
          <View key={es} style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
            <Text style={{ flex: 1, fontFamily: 'Helvetica-Bold', fontSize: 9 }}>
              {es === 'bear' ? 'Energy −20%' : es === 'base' ? 'Base' : 'Energy +30%'}
            </Text>
            {(['low', 'base', 'high'] as const).map((xts) => {
              const cell = results.sensitivity?.grid?.find(
                (c: any) => c.energyPriceScenario === es && c.exportTariffScenario === xts
              );
              return (
                <Text key={xts} style={{ flex: 1, textAlign: 'center', fontSize: 9 }}>
                  {cell?.paybackYears ? `${cell.paybackYears.toFixed(1)} yr` : '—'}
                </Text>
              );
            })}
          </View>
        ))}
      </Page>

      {/* Page 5: Financing Comparison */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Financing Comparison</Text>
      </Page>

      {/* Page 6: Assumptions */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Assumptions & Methodology</Text>
        <Text style={styles.h3}>Input Parameters</Text>
        {[
          ['Location', inputs.displayName],
          ['System size', `${inputs.systemKwp.toFixed(1)} kWp (${inputs.panelCount} × 400W panels)`],
          ['Roof pitch / orientation', `${inputs.tiltDeg}° / ${inputs.azimuthDeg}°`],
          ['Shading loss', `${inputs.shadingLossPct}%`],
          ['Annual consumption', `${inputs.annualKwh.toLocaleString()} kWh`],
          ['Import price', `${s}${inputs.importPricePerKwh}/kWh`],
          ['Export rate', `${s}${inputs.exportPricePerKwh}/kWh`],
          ['Solar data source', results.dataSource],
        ].map(([k, v]) => (
          <View key={k} style={styles.row}>
            <Text style={styles.cellLeft}>{k}</Text>
            <Text style={styles.cell}>{v}</Text>
          </View>
        ))}

        <Text style={styles.h3}>Modelling Assumptions</Text>
        {[
          ['Panel degradation', '0.5%/yr compound'],
          ['Energy price escalation', '3%/yr'],
          ['System losses (inverter, wiring)', '14% (baked into API request)'],
          ['CO₂ factor', inputs.countryCode === 'gb' ? '0.233 kg/kWh' : inputs.countryCode === 'ie' ? '0.295 kg/kWh' : '0.4 kg/kWh'],
          ['Seasonal consumption weights', 'Derived from SEAI/BEIS consumption data'],
        ].map(([k, v]) => (
          <View key={k} style={styles.row}>
            <Text style={styles.cellLeft}>{k}</Text>
            <Text style={styles.cell}>{v}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
