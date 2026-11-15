/**
 * Financial calculation engine for Simply Cashflow.
 * Operates purely on integers to prevent floating-point anomalies.
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
      totalIncome += t.amount;
    } else if (t.type === 'expense') {
      totalExpense += t.amount;
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

  const percentage = Math.round((spent / limit) * 100);
  const remaining = Math.max(0, limit - spent);
  const isOverspent = spent > limit;

  let level: 'safe' | 'warning' | 'danger' = 'safe';
  if (percentage >= 100) {
    level = 'danger';
  } else if (percentage >= 75) {
    level = 'warning';
  }

  return {
    spent,
    limit,
    remaining,
    percentage,
    level,
    isOverspent,
  };
}

export interface SavingsGoalMetrics {
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentage: number;
  requiredDaily: number;
  requiredWeekly: number;
  requiredMonthly: number;
}

export function calculateSavingsMetrics(
  targetAmount: number,
  currentAmount: number,
  daysRemaining: number
): SavingsGoalMetrics {
  const safeTarget = Math.max(1, targetAmount);
  const safeCurrent = Math.max(0, currentAmount);
  const remainingAmount = Math.max(0, safeTarget - safeCurrent);
  const percentage = Math.min(100, Math.round((safeCurrent / safeTarget) * 100));

  const safeDays = Math.max(1, daysRemaining);
  const safeMonths = Math.max(1, Math.ceil(safeDays / 30.41));
  const safeWeeks = Math.max(1, Math.ceil(safeDays / 7));

  const requiredDaily = Math.round(remainingAmount / safeDays);
  const requiredWeekly = Math.round(remainingAmount / safeWeeks);
  const requiredMonthly = Math.round(remainingAmount / safeMonths);

  return {
    targetAmount: safeTarget,
    currentAmount: safeCurrent,
    remainingAmount,
    percentage,
    requiredDaily,
    requiredWeekly,
    requiredMonthly,
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
      badgeColor: '#80E6AC',
    };
  }

  if (income === 0 && expense > 0) {
    return {
      score: 20,
      title: 'Defisit Penuh',
      description: 'Pengeluaran tercatat tanpa pemasukan. Segera catat sumber pendapatan Anda.',
      badgeColor: '#FF7272',
    };
  }

  const ratio = (income - expense) / income;
  const score = Math.max(10, Math.min(100, Math.round(ratio * 100)));

  if (ratio >= 0.4) {
    return {
      score,
      title: 'Sangat Sehat',
      description: 'Luar biasa! Rasio tabungan Anda di atas 40%. Pertahankan disiplin finansial ini.',
      badgeColor: '#35D07F',
    };
  } else if (ratio >= 0.2) {
    return {
      score,
      title: 'Kondisi Baik',
      description: 'Arus kas stabil dengan porsi tabungan sehat di atas 20%.',
      badgeColor: '#80E6AC',
    };
  } else if (ratio >= 0) {
    return {
      score,
      title: 'Waspada Ketat',
      description: 'Pengeluaran mendekati total pemasukan. Awasi pos pengeluaran sekunder.',
      badgeColor: '#F4C76B',
    };
  } else {
    return {
      score: Math.max(10, 50 + score),
      title: 'Pengeluaran Berlebih',
      description: 'Pengeluaran melebihi pemasukan bulan ini. Tinjau kembali anggaran belanja Anda.',
      badgeColor: '#FF7272',
    };
  }
}
