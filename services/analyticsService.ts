import { getDatabase } from '../database/db';
import { Transaction, RecurringTransaction } from '../database/schema';
import {
  calculateSummary,
  calculateSafeToSpend,
  calculateSmartBudgetPace,
  SafeToSpendResult,
  SmartBudgetPace,
  assessFinancialHealth,
  HealthAssessment,
} from '../utils/calculations';
import { getUpcomingBills } from '../database/repositories/recurringRepository';
import { getOverallMonthlyBudget } from '../database/repositories/budgetRepository';
import { getAllSavingsGoals } from '../database/repositories/savingsRepository';
import { getSetting } from '../database/repositories/settingsRepository';

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
}

export interface SpendingTrendItem {
  label: string; // e.g. "Mgg 1", "Mgg 2", "Mgg 3", "Mgg 4+"
  amount: number;
}

export interface MonthlyComparison {
  currentMonth: string;
  previousMonth: string;
  currentIncome: number;
  previousIncome: number;
  currentExpense: number;
  previousExpense: number;
  incomeGrowth: number; // percentage
  expenseGrowth: number; // percentage
}

export interface MonthlyRecapReport {
  month: string;
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  savingsRate: number;
  largestExpense: Transaction | null;
  topCategory: CategoryBreakdownItem | null;
  categoryBreakdown: CategoryBreakdownItem[];
  health: HealthAssessment;
  budgetStatus: {
    limit: number;
    spent: number;
    percentage: number;
  } | null;
}

export async function getCategoryExpenseBreakdown(month: string): Promise<CategoryBreakdownItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    category_id: string;
    category_name: string;
    total: number;
    color: string;
    icon: string;
  }>(
    `SELECT t.category_id, t.category_name, SUM(t.amount) as total,
            COALESCE(c.color, '#39D98A') as color,
            COALESCE(c.icon, 'Folder') as icon
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.type = 'expense' AND t.date LIKE ?
     GROUP BY t.category_id, t.category_name
     ORDER BY total DESC;`,
    [`${month}%`]
  );

  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);

  return rows.map((r) => ({
    categoryId: r.category_id,
    categoryName: r.category_name,
    color: r.color,
    icon: r.icon,
    amount: r.total,
    percentage: grandTotal > 0 ? Math.round((r.total / grandTotal) * 100) : 0,
  }));
}

export async function getWeeklySpendingTrends(month: string): Promise<SpendingTrendItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ day: number; amount: number }>(
    `SELECT CAST(strftime('%d', date) AS INTEGER) as day, SUM(amount) as amount
     FROM transactions
     WHERE type = 'expense' AND date LIKE ?
     GROUP BY day
     ORDER BY day ASC;`,
    [`${month}%`]
  );

  const buckets = [
    { label: 'Mgg 1', amount: 0 },
    { label: 'Mgg 2', amount: 0 },
    { label: 'Mgg 3', amount: 0 },
    { label: 'Mgg 4+', amount: 0 },
  ];

  for (const row of rows) {
    if (row.day <= 7) {
      buckets[0].amount += row.amount;
    } else if (row.day <= 14) {
      buckets[1].amount += row.amount;
    } else if (row.day <= 21) {
      buckets[2].amount += row.amount;
    } else {
      buckets[3].amount += row.amount;
    }
  }

  return buckets;
}

export async function getMonthlyComparison(currentMonth: string): Promise<MonthlyComparison> {
  const db = await getDatabase();

  const [yearStr, monthStr] = currentMonth.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);
  const prevDate = new Date(y, m - 2, 1);
  const prevYear = prevDate.getFullYear();
  const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
  const previousMonth = `${prevYear}-${prevMonth}`;

  const currentRows = await db.getAllAsync<{ type: 'income' | 'expense'; total: number }>(
    'SELECT type, SUM(amount) as total FROM transactions WHERE date LIKE ? GROUP BY type;',
    [`${currentMonth}%`]
  );

  const prevRows = await db.getAllAsync<{ type: 'income' | 'expense'; total: number }>(
    'SELECT type, SUM(amount) as total FROM transactions WHERE date LIKE ? GROUP BY type;',
    [`${previousMonth}%`]
  );

  let currentIncome = 0;
  let currentExpense = 0;
  for (const r of currentRows) {
    if (r.type === 'income') currentIncome = r.total;
    if (r.type === 'expense') currentExpense = r.total;
  }

  let previousIncome = 0;
  let previousExpense = 0;
  for (const r of prevRows) {
    if (r.type === 'income') previousIncome = r.total;
    if (r.type === 'expense') previousExpense = r.total;
  }

  const incomeGrowth =
    previousIncome > 0
      ? Math.round(((currentIncome - previousIncome) / previousIncome) * 100)
      : 0;
  const expenseGrowth =
    previousExpense > 0
      ? Math.round(((currentExpense - previousExpense) / previousExpense) * 100)
      : 0;

  return {
    currentMonth,
    previousMonth,
    currentIncome,
    previousIncome,
    currentExpense,
    previousExpense,
    incomeGrowth,
    expenseGrowth,
  };
}

export async function getSafeToSpendOverview(currentMonth: string): Promise<SafeToSpendResult> {
  const db = await getDatabase();

  // 1. Current real cash balance (all-time income minus expense)
  const balanceRow = await db.getFirstAsync<{ income: number; expense: number }>(
    `SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
     FROM transactions;`
  );
  const currentBalance = (balanceRow?.income || 0) - (balanceRow?.expense || 0);

  // 2. Upcoming unpaid bills for current month
  const bills = await getUpcomingBills(30);
  const upcomingBillsTotal = bills.reduce((sum, b) => sum + b.amount, 0);

  // 3. User-defined reserved funds
  const reserveStr = await getSetting('safe_to_spend_reserve');
  const reservedFunds = reserveStr ? parseInt(reserveStr, 10) || 0 : 0;

  // 4. Remaining planned savings allocations this month
  const goals = await getAllSavingsGoals();
  const plannedSavings = goals
    .filter((g) => g.status === 'active')
    .reduce((sum, g) => sum + Math.max(0, g.target_amount - g.current_amount), 0);
  // We allocate monthly fraction of remaining savings
  const monthlyPlannedSavings = Math.round(plannedSavings / 12);

  // Days remaining in month
  const now = new Date();
  const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysRemaining = Math.max(1, totalDays - currentDay + 1);

  return calculateSafeToSpend({
    currentBalance,
    upcomingBillsTotal,
    reservedFunds,
    plannedSavingsAllocations: monthlyPlannedSavings,
    daysRemainingInMonth: daysRemaining,
  });
}

export async function getSmartBudgetPaceOverview(month: string): Promise<SmartBudgetPace | null> {
  const db = await getDatabase();
  const overall = await getOverallMonthlyBudget(month);
  if (!overall || overall.amount <= 0) return null;

  const expenseRow = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND date LIKE ?;",
    [`${month}%`]
  );
  const totalSpent = expenseRow?.total || 0;

  const now = new Date();
  const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();

  return calculateSmartBudgetPace(overall.amount, totalSpent, currentDay, totalDays);
}

export async function generateMonthlyRecap(month: string): Promise<MonthlyRecapReport> {
  const db = await getDatabase();

  const monthTx = await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE date LIKE ? ORDER BY amount DESC;',
    [`${month}%`]
  );

  const summary = calculateSummary(monthTx);
  const largestExpense = monthTx.find((t) => t.type === 'expense') || null;
  const breakdown = await getCategoryExpenseBreakdown(month);
  const topCategory = breakdown.length > 0 ? breakdown[0] : null;
  const health = assessFinancialHealth(summary.totalIncome, summary.totalExpense);

  const overall = await getOverallMonthlyBudget(month);
  const budgetStatus = overall
    ? {
        limit: overall.amount,
        spent: summary.totalExpense,
        percentage: Math.round((summary.totalExpense / overall.amount) * 100),
      }
    : null;

  return {
    month,
    totalIncome: summary.totalIncome,
    totalExpense: summary.totalExpense,
    netCashflow: summary.netBalance,
    savingsRate: summary.savingsRate,
    largestExpense,
    topCategory,
    categoryBreakdown: breakdown,
    health,
    budgetStatus,
  };
}
