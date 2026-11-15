import { getDatabase } from '../database/db';
import { Transaction } from '../database/schema';

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
}

export interface SpendingTrendItem {
  label: string; // e.g. "Mgg 1", "Mgg 2" or "1-7 Nov"
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
            COALESCE(c.color, '#35D07F') as color,
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

  // Group into 4 weekly buckets: Day 1-7, 8-14, 15-21, 22-end
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
  
  // Parse year and month to determine previous month
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
