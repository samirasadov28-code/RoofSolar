export interface FinancingParams {
  netCapex: number;
  financingMode: 'outright' | 'loan' | 'mortgage';
  loanCoveragePct: number;
  annualRatePct: number;
  tenorYears: number;
}

export interface FinancingResult {
  monthlyPayment: number;
  loanAmount: number;
  totalInterestPaid: number;
  upfrontCash: number;
}

export function calcFinancing(params: FinancingParams): FinancingResult {
  const { netCapex, financingMode, loanCoveragePct, annualRatePct, tenorYears } = params;

  if (financingMode === 'outright') {
    return {
      monthlyPayment: 0,
      loanAmount: 0,
      totalInterestPaid: 0,
      upfrontCash: netCapex,
    };
  }

  const loanAmount = netCapex * loanCoveragePct;
  const upfrontCash = netCapex * (1 - loanCoveragePct);
  const monthlyRate = annualRatePct / 12;
  const n = tenorYears * 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / n;
  } else {
    const compounded = Math.pow(1 + monthlyRate, n);
    monthlyPayment = loanAmount * (monthlyRate * compounded) / (compounded - 1);
  }

  const totalInterestPaid = monthlyPayment * n - loanAmount;

  return { monthlyPayment, loanAmount, totalInterestPaid, upfrontCash };
}
