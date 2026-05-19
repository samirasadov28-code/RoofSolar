'use client';

import { WizardProgress } from '@/components/WizardProgress';
import { Step1Address } from '@/components/wizard/Step1Address';
import { Step2Roof } from '@/components/wizard/Step2Roof';
import { Step3Consumption } from '@/components/wizard/Step3Consumption';
import { Step4System } from '@/components/wizard/Step4System';
import { Step5Tariffs } from '@/components/wizard/Step5Tariffs';
import { Step6Financing } from '@/components/wizard/Step6Financing';
import { Step7Review } from '@/components/wizard/Step7Review';
import { useWizardStore } from '@/lib/store/wizardStore';
import Link from 'next/link';

export default function CalculatorPage() {
  const { step, setStep } = useWizardStore();

  const next = () => setStep(Math.min(step + 1, 7));
  const back = () => setStep(Math.max(step - 1, 1));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-192.png" alt="RoofSolar" width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
            <span className="font-bold text-gray-900">RoofSolar</span>
          </Link>
          <WizardProgress current={step} />
        </div>
      </header>

      {/* Wizard */}
      <main className="max-w-2xl mx-auto px-6 pt-10 pb-24 sm:py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === 1 && <Step1Address onNext={next} />}
          {step === 2 && <Step2Roof onNext={next} onBack={back} />}
          {step === 3 && <Step3Consumption onNext={next} onBack={back} />}
          {step === 4 && <Step4System onNext={next} onBack={back} />}
          {step === 5 && <Step5Tariffs onNext={next} onBack={back} />}
          {step === 6 && <Step6Financing onNext={next} onBack={back} />}
          {step === 7 && <Step7Review onBack={back} />}
        </div>
      </main>
    </div>
  );
}
