// Pure mortgage calculation logic — no bot dependencies

export interface AnnuityResult {
  monthlyPayment: number;
  totalPayment: number;
  overpayment: number;
  firstPaymentBreakdown: {
    principal: number;
    interest: number;
  };
}

export interface DifferentiatedResult {
  firstMonthPayment: number;
  lastMonthPayment: number;
  averagePayment: number;
  totalPayment: number;
  overpayment: number;
}

export interface ScheduleRow {
  month: number;
  payment: number;
  principalPart: number;
  interestPart: number;
  remainingDebt: number;
}

/**
 * Calculate annuity (equal monthly payments) mortgage.
 */
export function calculateAnnuity(
  principal: number,
  annualRate: number,
  termYears: number
): AnnuityResult {
  const months = termYears * 12;
  const monthlyRate = annualRate / 100 / 12;

  let monthlyPayment: number;

  if (monthlyRate === 0) {
    monthlyPayment = principal / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    monthlyPayment = principal * (monthlyRate * factor) / (factor - 1);
  }

  const totalPayment = monthlyPayment * months;
  const overpayment = totalPayment - principal;

  const firstInterest = principal * monthlyRate;
  const firstPrincipal = monthlyPayment - firstInterest;

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    overpayment: Math.round(overpayment * 100) / 100,
    firstPaymentBreakdown: {
      principal: Math.round(firstPrincipal * 100) / 100,
      interest: Math.round(firstInterest * 100) / 100,
    },
  };
}

/**
 * Calculate differentiated (decreasing monthly payments) mortgage.
 */
export function calculateDifferentiated(
  principal: number,
  annualRate: number,
  termYears: number
): DifferentiatedResult {
  const months = termYears * 12;
  const monthlyRate = annualRate / 100 / 12;
  const principalPart = principal / months;

  let totalPayment = 0;
  let firstMonthPayment = 0;
  let lastMonthPayment = 0;

  for (let i = 0; i < months; i++) {
    const remainingDebt = principal - principalPart * i;
    const interestPart = remainingDebt * monthlyRate;
    const payment = principalPart + interestPart;
    totalPayment += payment;

    if (i === 0) firstMonthPayment = payment;
    if (i === months - 1) lastMonthPayment = payment;
  }

  const averagePayment = totalPayment / months;
  const overpayment = totalPayment - principal;

  return {
    firstMonthPayment: Math.round(firstMonthPayment * 100) / 100,
    lastMonthPayment: Math.round(lastMonthPayment * 100) / 100,
    averagePayment: Math.round(averagePayment * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    overpayment: Math.round(overpayment * 100) / 100,
  };
}

/**
 * Generate a month-by-month payment schedule.
 */
export function generatePaymentSchedule(
  principal: number,
  annualRate: number,
  termYears: number,
  type: "annuity" | "differentiated"
): ScheduleRow[] {
  const months = termYears * 12;
  const monthlyRate = annualRate / 100 / 12;
  const schedule: ScheduleRow[] = [];

  if (type === "annuity") {
    let factor: number;
    let monthlyPayment: number;

    if (monthlyRate === 0) {
      monthlyPayment = principal / months;
    } else {
      factor = Math.pow(1 + monthlyRate, months);
      monthlyPayment = principal * (monthlyRate * factor) / (factor - 1);
    }

    let remaining = principal;

    for (let i = 1; i <= months; i++) {
      const interestPart = remaining * monthlyRate;
      const principalPart = monthlyPayment - interestPart;
      remaining -= principalPart;

      schedule.push({
        month: i,
        payment: Math.round(monthlyPayment * 100) / 100,
        principalPart: Math.round(principalPart * 100) / 100,
        interestPart: Math.round(interestPart * 100) / 100,
        remainingDebt: Math.max(0, Math.round(remaining * 100) / 100),
      });
    }
  } else {
    const monthlyPrincipal = principal / months;
    let remaining = principal;

    for (let i = 1; i <= months; i++) {
      const interestPart = remaining * monthlyRate;
      const payment = monthlyPrincipal + interestPart;
      remaining -= monthlyPrincipal;

      schedule.push({
        month: i,
        payment: Math.round(payment * 100) / 100,
        principalPart: Math.round(monthlyPrincipal * 100) / 100,
        interestPart: Math.round(interestPart * 100) / 100,
        remainingDebt: Math.max(0, Math.round(remaining * 100) / 100),
      });
    }
  }

  return schedule;
}

/**
 * Return the default mortgage rate for a given property type.
 */
export function getDefaultRate(propertyType: string): number {
  switch (propertyType) {
    case "new":
      return 6.0;
    case "secondary":
      return 10.5;
    case "house":
      return 10.9;
    default:
      return 10.5;
  }
}
