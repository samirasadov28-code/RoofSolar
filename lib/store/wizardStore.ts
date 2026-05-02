'use client';

import { create } from 'zustand';

export interface WizardInputs {
  // Step 1 — Address
  address: string;
  lat: number | null;
  lon: number | null;
  countryCode: string;
  displayName: string;

  // Step 2 — Roof
  roofAreaM2: number;
  azimuthDeg: number;
  tiltDeg: number;
  shadingLossPct: number;

  // Step 3 — Consumption
  annualKwh: number;
  monthlyBill: number | null;
  unitPrice: number | null;

  // Step 3 — Consumption
  consumptionProfile: 'daytime' | 'mixed' | 'evening';

  // Step 4 — System
  panelCount: number;
  systemKwp: number;
  inverterType: 'standard' | 'hybrid';
  hasBattery: boolean;
  batteryKwh: number;
  hasEv: boolean;
  annualMileageKm: number;
  vehicleEfficiencyKwhPer100km: number;
  chargingPreference: 'daytime' | 'evening' | 'mixed';
  publicChargingPct: number;

  // Step 5 — Tariffs & cost
  tariffType: 'fixed' | 'tou';
  importPricePerKwh: number;
  exportPricePerKwh: number;
  grant: number;
  systemCostGross: number;   // user-editable gross system cost
  dayPricePerKwh: number;
  nightPricePerKwh: number;
  performArbitrage: boolean;

  // Step 6 — Financing
  financingMode: 'outright' | 'loan' | 'mortgage';
  loanCoveragePct: number;
  annualRatePct: number;
  tenorYears: number;

  // Step 7 — Review / results
  calculationId: string | null;
}

interface WizardStore {
  step: number;
  inputs: WizardInputs;
  setStep: (step: number) => void;
  setInputs: (partial: Partial<WizardInputs>) => void;
  reset: () => void;
}

const defaultInputs: WizardInputs = {
  address: '',
  lat: null,
  lon: null,
  countryCode: 'ie',
  displayName: '',

  roofAreaM2: 50,
  azimuthDeg: 180,
  tiltDeg: 35,
  shadingLossPct: 5,

  annualKwh: 4200,
  monthlyBill: null,
  unitPrice: null,
  consumptionProfile: 'mixed',

  panelCount: 12,
  systemKwp: 4.8,
  inverterType: 'standard',
  hasBattery: false,
  batteryKwh: 5,
  hasEv: false,
  annualMileageKm: 15000,
  vehicleEfficiencyKwhPer100km: 18,
  chargingPreference: 'mixed',
  publicChargingPct: 0.20,

  tariffType: 'fixed',
  importPricePerKwh: 0.433,
  exportPricePerKwh: 0.21,
  grant: 3000,
  systemCostGross: 0,  // 0 = use auto-estimate (panelCount × 900 + battery)
  dayPricePerKwh: 0.433,
  nightPricePerKwh: 0.15,
  performArbitrage: false,

  financingMode: 'loan',
  loanCoveragePct: 1.0,
  annualRatePct: 0.065,
  tenorYears: 10,

  calculationId: null,
};

export const useWizardStore = create<WizardStore>((set) => ({
  step: 1,
  inputs: { ...defaultInputs },
  setStep: (step) => set({ step }),
  setInputs: (partial) =>
    set((state) => ({ inputs: { ...state.inputs, ...partial } })),
  reset: () => set({ step: 1, inputs: { ...defaultInputs } }),
}));
