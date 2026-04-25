export interface EvChargingParams {
  annualMileageKm: number;
  vehicleEfficiencyKwhPer100km: number;
  publicChargingPct: number;
  chargingPreference: 'daytime' | 'evening' | 'mixed';
  monthlyProduction: number[];
  dayPricePerKwh: number;
  nightPricePerKwh: number;
  batteryKwh?: number;
  annualProduction?: number;
  panelCount?: number;
}

export interface EvChargingResult {
  annualHomeKwh: number;
  solarCoveredKwh: number;
  solarCoveragePct: number;
  annualSavingVsGrid: number;
  batterEveningShiftValue: number;
  recommendedExtraPanels: number;
}

export function calcEvCharging(params: EvChargingParams): EvChargingResult {
  const {
    annualMileageKm,
    vehicleEfficiencyKwhPer100km,
    publicChargingPct,
    monthlyProduction,
    dayPricePerKwh,
    nightPricePerKwh,
    batteryKwh = 0,
    annualProduction,
    panelCount,
  } = params;

  const annualHomeKwh =
    (annualMileageKm * vehicleEfficiencyKwhPer100km) / 100 * (1 - publicChargingPct);

  const totalProduction = monthlyProduction.reduce((a, b) => a + b, 0);

  // 40% of production available in home-charging window
  const rawSolarCovered = totalProduction * 0.4;
  const solarCoveredKwh = Math.min(rawSolarCovered, annualHomeKwh);
  const solarCoveragePct = annualHomeKwh > 0 ? solarCoveredKwh / annualHomeKwh : 0;
  const annualSavingVsGrid = solarCoveredKwh * dayPricePerKwh;

  // Battery evening shift: additional 20% of production shifted to evening
  let batterEveningShiftValue = 0;
  if (batteryKwh > 0) {
    const eveningShift = Math.min(totalProduction * 0.2, annualHomeKwh);
    batterEveningShiftValue = eveningShift * (dayPricePerKwh - nightPricePerKwh);
  }

  // Recommended extra panels to cover remaining EV demand
  let recommendedExtraPanels = 0;
  const remainingDemand = annualHomeKwh - solarCoveredKwh;
  if (remainingDemand > 0 && annualProduction && panelCount && panelCount > 0) {
    const annualKwhPerPanel = annualProduction / panelCount;
    recommendedExtraPanels = Math.ceil(remainingDemand / (0.4 * annualKwhPerPanel));
  }

  return {
    annualHomeKwh,
    solarCoveredKwh,
    solarCoveragePct,
    annualSavingVsGrid,
    batterEveningShiftValue,
    recommendedExtraPanels,
  };
}
