/**
 * Hourly battery-arbitrage day-by-day simulator.
 *
 * Models a "representative day" for each of the 12 calendar months using:
 *   • a standard IE/UK residential load shape (morning + evening peaks)
 *   • a per-month solar Gaussian bell curve (peak ~13:00 local time)
 *   • an explicit hour-by-hour battery charge/discharge loop
 *
 * Arbitrage: when performArbitrage=true and nightPricePerKwh < importPricePerKwh,
 * the battery is pre-charged from the grid during off-peak hours (00:00–06:59)
 * so that daytime demand is met from cheap stored energy rather than the grid.
 */

export interface HourlySlice {
  hour: number;
  solarKwh: number;
  loadKwh: number;
  selfConsumedKwh: number;
  batteryChargeKwh: number;
  batteryDischargeKwh: number;
  gridImportKwh: number;
  gridExportKwh: number;
  batterySocKwh: number;
}

export interface MonthlyHourlyProfile {
  month: number;
  representativeDay: HourlySlice[];
  dailySolarKwh: number;
  dailyLoadKwh: number;
  dailySelfConsumedKwh: number;
  dailyGridImportKwh: number;
  dailyGridExportKwh: number;
}

export interface HourlySimResult {
  months: MonthlyHourlyProfile[];
  annualArbitrageSavings: number;
}

export interface HourlySimParams {
  monthlyProductionKwh: number[];
  monthlyConsumptionKwh: number[];
  batteryKwh: number;
  importPricePerKwh: number;
  exportPricePerKwh: number;
  nightPricePerKwh: number;
  performArbitrage: boolean;
}

// Standard IE/UK household load shape — normalised to sum to 1.0.
// Based on UK National Grid / SEAI household demand profiles.
const RAW_SHAPE = [
  0.022, 0.018, 0.016, 0.015, 0.015, 0.020,  // 00–05 low overnight
  0.038, 0.065, 0.075, 0.058, 0.042, 0.037,  // 06–11 morning peak
  0.041, 0.034, 0.030, 0.032, 0.042, 0.065,  // 12–17 afternoon
  0.081, 0.079, 0.064, 0.053, 0.043, 0.033,  // 18–23 evening peak
];
const RAW_SUM = RAW_SHAPE.reduce((a, b) => a + b, 0);
const LOAD_SHAPE = RAW_SHAPE.map((v) => v / RAW_SUM);

const DAYS_PER_MONTH = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const NIGHT_CHARGE_HOURS = [0, 1, 2, 3, 4, 5, 6]; // 00:00–06:59

function buildSolarShape(monthIndex: number): number[] {
  // Gaussian centred at 13:00; σ varies 2.5 h (Dec) → 3.2 h (Jun)
  const peak = 13;
  const sigma = 2.5 + 0.7 * Math.sin((monthIndex * Math.PI) / 11);
  const raw = Array.from({ length: 24 }, (_, h) =>
    h >= 5 && h <= 21
      ? Math.exp(-Math.pow(h - peak, 2) / (2 * sigma * sigma))
      : 0
  );
  const total = raw.reduce((a, b) => a + b, 0);
  return total > 0 ? raw.map((v) => v / total) : raw;
}

function simulateDay(
  solarShape: number[],
  dailySolarKwh: number,
  dailyLoadKwh: number,
  batteryKwh: number,
  performArbitrage: boolean,
  importPricePerKwh: number,
  nightPricePerKwh: number,
): HourlySlice[] {
  const isArbitrage = performArbitrage && batteryKwh > 0 && nightPricePerKwh < importPricePerKwh;

  // How much solar surplus will we harvest today? Use that to decide how much
  // to pre-charge from the grid: we want room for solar but also enough stored
  // to offset the evening peak.
  let nightChargeKwh = 0;
  if (isArbitrage) {
    const expectedSolarSurplus = solarShape.reduce((acc, frac, h) => {
      const net = frac * dailySolarKwh - LOAD_SHAPE[h] * dailyLoadKwh;
      return acc + Math.max(0, net);
    }, 0);
    // Pre-charge enough to fill what solar won't cover, up to full capacity.
    nightChargeKwh = Math.max(0, Math.min(batteryKwh, batteryKwh - expectedSolarSurplus));
  }

  const chargePerNightHour = nightChargeKwh > 0
    ? nightChargeKwh / NIGHT_CHARGE_HOURS.length
    : 0;

  const slices: HourlySlice[] = [];
  let soc = 0;

  for (let h = 0; h < 24; h++) {
    const solar = solarShape[h] * dailySolarKwh;
    const load = LOAD_SHAPE[h] * dailyLoadKwh;

    let gridImport = 0;
    let gridExport = 0;
    let batteryCharge = 0;
    let batteryDischarge = 0;

    // Step 1: night grid pre-charge (before solar / load balance)
    if (isArbitrage && NIGHT_CHARGE_HOURS.includes(h) && chargePerNightHour > 0) {
      const actual = Math.min(chargePerNightHour, batteryKwh - soc);
      batteryCharge += actual;
      soc += actual;
      gridImport += actual;
    }

    // Step 2: balance solar vs load
    const selfConsumed = Math.min(solar, load);
    const net = solar - load;

    if (net > 0) {
      const canCharge = batteryKwh - soc;
      const charged = Math.min(net, canCharge);
      batteryCharge += charged;
      soc += charged;
      gridExport = net - charged;
    } else if (net < 0) {
      const deficit = -net;
      const discharged = Math.min(deficit, soc);
      batteryDischarge = discharged;
      soc -= discharged;
      gridImport += deficit - discharged;
    }

    slices.push({
      hour: h,
      solarKwh: solar,
      loadKwh: load,
      selfConsumedKwh: selfConsumed,
      batteryChargeKwh: batteryCharge,
      batteryDischargeKwh: batteryDischarge,
      gridImportKwh: gridImport,
      gridExportKwh: gridExport,
      batterySocKwh: soc,
    });
  }

  return slices;
}

export function runHourlySimulator(params: HourlySimParams): HourlySimResult {
  const {
    monthlyProductionKwh,
    monthlyConsumptionKwh,
    batteryKwh,
    importPricePerKwh,
    exportPricePerKwh,
    nightPricePerKwh,
    performArbitrage,
  } = params;

  const months: MonthlyHourlyProfile[] = [];
  let annualArbitrageSavings = 0;

  for (let m = 0; m < 12; m++) {
    const days = DAYS_PER_MONTH[m];
    const dailySolar = monthlyProductionKwh[m] / days;
    const dailyLoad = monthlyConsumptionKwh[m] / days;
    const solarShape = buildSolarShape(m);

    const rday = simulateDay(
      solarShape,
      dailySolar,
      dailyLoad,
      batteryKwh,
      performArbitrage,
      importPricePerKwh,
      nightPricePerKwh,
    );

    // Arbitrage savings for the month: kWh shifted from night to day × price spread
    const nightCharged = rday
      .filter((s) => NIGHT_CHARGE_HOURS.includes(s.hour))
      .reduce((a, s) => a + s.batteryChargeKwh, 0);
    const spread = Math.max(0, importPricePerKwh - nightPricePerKwh);
    annualArbitrageSavings += nightCharged * spread * days;

    const dailySelfConsumed = rday.reduce(
      (a, s) => a + s.selfConsumedKwh + s.batteryDischargeKwh,
      0,
    );
    const dailyGridImport = rday.reduce((a, s) => a + s.gridImportKwh, 0);
    const dailyGridExport = rday.reduce((a, s) => a + s.gridExportKwh, 0);

    void exportPricePerKwh;

    months.push({
      month: m,
      representativeDay: rday,
      dailySolarKwh: dailySolar,
      dailyLoadKwh: dailyLoad,
      dailySelfConsumedKwh: dailySelfConsumed,
      dailyGridImportKwh: dailyGridImport,
      dailyGridExportKwh: dailyGridExport,
    });
  }

  return { months, annualArbitrageSavings };
}
