/**
 * Financial Intelligence Calculation Engine for Simply Cashflow 2.0
 * Operates purely on integers (IDR) to prevent floating-point anomalies.
 * 100% Deterministic and Local.
 */

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number; // 0 to 100
}

export function calculateSummary(
  transactions: { type: 'income' | 'expense'; amount: number }[]
): FinancialSummary {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of transactions) {
    if (t.type === 'income') {
      totalIncome += Math.round(t.amount);
    } else if (t.type === 'expense') {
      totalExpense += Math.round(t.amount);
    }
  }

  const netBalance = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0
      ? Math.max(0, Math.min(100, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)))
      : 0;

  return {
    totalIncome,
    totalExpense,
    netBalance,
    savingsRate,
  };
}

export interface BudgetStatus {
  spent: number;
  limit: number;
  remaining: number;
  percentage: number;
  level: 'safe' | 'warning' | 'danger';
  isOverspent: boolean;
}

export function calculateBudgetStatus(spent: number, limit: number): BudgetStatus {
  if (limit <= 0) {
    return {
      spent,
      limit: 0,
      remaining: 0,
      percentage: 0,
      level: 'safe',
      isOverspent: false,
    };
  }

  const cleanSpent = Math.max(0, Math.round(spent));
  const cleanLimit = Math.max(1, Math.round(limit));
  const percentage = Math.round((cleanSpent / cleanLimit) * 100);
  const remaining = Math.max(0, cleanLimit - cleanSpent);
  const isOverspent = cleanSpent > cleanLimit;

  let level: 'safe' | 'warning' | 'danger' = 'safe';
  if (percentage >= 100) {
    level = 'danger';
  } else if (percentage >= 75) {
    level = 'warning';
  }

  return {
    spent: cleanSpent,
    limit: cleanLimit,
    remaining,
    percentage,
    level,
    isOverspent,
  };
}

export interface SmartBudgetPace {
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  daysPassed: number;
  totalDaysInMonth: number;
  daysRemaining: number;
  idealSpendToDate: number;
  paceRatio: number; // > 1.0 means spending faster than calendar pace
  recommendedDailyAllowance: number;
  projectedMonthEndExpense: number;
  status: 'under_pace' | 'on_track' | 'fast_pace' | 'overspent';
}

export function calculateSmartBudgetPace(
  limit: number,
  spent: number,
  currentDay: number,
  totalDaysInMonth: number
): SmartBudgetPace {
  const cleanLimit = Math.max(0, Math.round(limit));
  const cleanSpent = Math.max(0, Math.round(spent));
  const safeTotalDays = Math.max(1, totalDaysInMonth);
  const safeCurrentDay = Math.min(safeTotalDays, Math.max(1, currentDay));
  const daysRemaining = Math.max(1, safeTotalDays - safeCurrentDay);

  const percentage = cleanLimit > 0 ? Math.round((cleanSpent / cleanLimit) * 100) : 0;
  const remaining = Math.max(0, cleanLimit - cleanSpent);
  const idealDaily = cleanLimit / safeTotalDays;
  const idealSpendToDate = Math.round(idealDaily * safeCurrentDay);

  const paceRatio = idealSpendToDate > 0 ? Number((cleanSpent / idealSpendToDate).toFixed(2)) : 1.0;
  const recommendedDailyAllowance = Math.round(remaining / daysRemaining);

  const averageDailySpend = cleanSpent / safeCurrentDay;
  const projectedMonthEndExpense = Math.round(averageDailySpend * safeTotalDays);

  let status: 'under_pace' | 'on_track' | 'fast_pace' | 'overspent' = 'on_track';
  if (cleanSpent > cleanLimit) {
    status = 'overspent';
  } else if (paceRatio > 1.15) {
    status = 'fast_pace';
  } else if (paceRatio < 0.85) {
    status = 'under_pace';
  }

  return {
    limit: cleanLimit,
    spent: cleanSpent,
    remaining,
    percentage,
    daysPassed: safeCurrentDay,
    totalDaysInMonth: safeTotalDays,
    daysRemaining,
    idealSpendToDate,
    paceRatio,
    recommendedDailyAllowance,
    projectedMonthEndExpense,
    status,
  };
}

export interface SafeToSpendResult {
  currentBalance: number;
  upcomingBillsTotal: number;
  reservedFunds: number;
  plannedSavingsAllocations: number;
  safeToSpend: number;
  dailySafeToSpend: number;
  status: 'comfortable' | 'cautious' | 'depleted';
}

/**
 * Formula: SafeToSpend = CurrentBalance - UpcomingBills - ReservedFunds - PlannedSavingsAllocations
 * Distinguishes actual balance from reserved funds and commitments without double subtraction.
 */
export function calculateSafeToSpend(inputs: {
  currentBalance: number;
  upcomingBillsTotal: number;
  reservedFunds?: number;
  plannedSavingsAllocations?: number;
  daysRemainingInMonth?: number;
}): SafeToSpendResult {
  const balance = Math.max(0, Math.round(inputs.currentBalance));
  const bills = Math.max(0, Math.round(inputs.upcomingBillsTotal));
  const reserve = Math.max(0, Math.round(inputs.reservedFunds || 0));
  const savings = Math.max(0, Math.round(inputs.plannedSavingsAllocations || 0));

  const commitments = bills + reserve + savings;
  const safeToSpend = Math.max(0, balance - commitments);

  const days = Math.max(1, inputs.daysRemainingInMonth || 1);
  const dailySafeToSpend = Math.round(safeToSpend / days);

  let status: 'comfortable' | 'cautious' | 'depleted' = 'comfortable';
  if (safeToSpend === 0) {
    status = 'depleted';
  } else if (safeToSpend < (bills + savings) * 0.3) {
    status = 'cautious';
  }

  return {
    currentBalance: balance,
    upcomingBillsTotal: bills,
    reservedFunds: reserve,
    plannedSavingsAllocations: savings,
    safeToSpend,
    dailySafeToSpend,
    status,
  };
}

export interface SavingsMilestones {
  milestone25: boolean;
  milestone50: boolean;
  milestone75: boolean;
  milestone100: boolean;
  nextMilestonePercent: number;
}

export interface SavingsGoalMetrics {
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentage: number;
  requiredDaily: number;
  requiredWeekly: number;
  requiredMonthly: number;
  milestones: SavingsMilestones;
}

export function calculateSavingsMetrics(
  targetAmount: number,
  currentAmount: number,
  daysRemaining: number
): SavingsGoalMetrics {
  const safeTarget = Math.max(1, Math.round(targetAmount));
  const safeCurrent = Math.max(0, Math.round(currentAmount));
  const remainingAmount = Math.max(0, safeTarget - safeCurrent);
  const percentage = Math.min(100, Math.round((safeCurrent / safeTarget) * 100));

  const safeDays = Math.max(1, daysRemaining);
  const safeMonths = Math.max(1, Math.ceil(safeDays / 30.41));
  const safeWeeks = Math.max(1, Math.ceil(safeDays / 7));

  const requiredDaily = Math.round(remainingAmount / safeDays);
  const requiredWeekly = Math.round(remainingAmount / safeWeeks);
  const requiredMonthly = Math.round(remainingAmount / safeMonths);

  const m25 = percentage >= 25;
  const m50 = percentage >= 50;
  const m75 = percentage >= 75;
  const m100 = percentage >= 100;

  let nextMilestone = 100;
  if (!m25) nextMilestone = 25;
  else if (!m50) nextMilestone = 50;
  else if (!m75) nextMilestone = 75;

  return {
    targetAmount: safeTarget,
    currentAmount: safeCurrent,
    remainingAmount,
    percentage,
    requiredDaily,
    requiredWeekly,
    requiredMonthly,
    milestones: {
      milestone25: m25,
      milestone50: m50,
      milestone75: m75,
      milestone100: m100,
      nextMilestonePercent: nextMilestone,
    },
  };
}

export interface HealthAssessment {
  score: number; // 0 to 100
  title: string;
  description: string;
  badgeColor: string;
}

export function assessFinancialHealth(
  income: number,
  expense: number
): HealthAssessment {
  if (income === 0 && expense === 0) {
    return {
      score: 100,
      title: 'Mulai Mencatat',
      description: 'Tambahkan transaksi pertama Anda untuk menganalisis kesehatan keuangan.',
      badgeColor: '#39D98A',
    };
  }

  if (income === 0 && expense > 0) {
    return {
      score: 20,
      title: 'Defisit Penuh',
      description: 'Pengeluaran tercatat tanpa pemasukan. Segera catat sumber pendapatan Anda.',
      badgeColor: '#D96D70',
    };
  }

  const ratio = (expense / income) * 100;

  if (ratio <= 50) {
    return {
      score: 95,
      title: 'Sangat Sehat',
      description: 'Cashflow prima! Lebih dari 50% pendapatan Anda berhasil disimpan atau diinvestasikan.',
      badgeColor: '#168653',
    };
  } else if (ratio <= 70) {
    return {
      score: 80,
      title: 'Sehat & Terkendali',
      description: 'Arus kas Anda seimbang dengan porsi tabungan yang konsisten.',
      badgeColor: '#39D98A',
    };
  } else if (ratio <= 90) {
    return {
      score: 60,
      title: 'Waspada Pengeluaran',
      description: 'Sebagian besar pendapatan terpakai. Awasi pos-pos pengeluaran sekunder.',
      badgeColor: '#D9A441',
    };
  } else if (ratio <= 100) {
    return {
      score: 45,
      title: 'Batas Kritis',
      description: 'Pengeluaran hampir menyamai pendapatan. Kurangi belanja non-esensial.',
      badgeColor: '#D9A441',
    };
  } else {
    return {
      score: 25,
      title: 'Pengeluaran Berlebih',
      description: 'Cashflow defisit. Pengeluaran bulan ini melampaui seluruh pemasukan Anda.',
      badgeColor: '#D96D70',
    };
  }
}
