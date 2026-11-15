import { getDatabase } from '../db';
import { Budget } from '../schema';
import { calculateBudgetStatus, BudgetStatus } from '../../utils/calculations';

export interface BudgetWithSpending {
  budget: Budget;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  status: BudgetStatus;
}

export async function getBudgetsForMonth(month: string): Promise<Budget[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Budget>('SELECT * FROM budgets WHERE month = ?;', [month]);
}

export async function setBudget(
  month: string,
  categoryId: string | null,
  amount: number
): Promise<Budget> {
  const db = await getDatabase();
  const existing = categoryId
    ? await db.getFirstAsync<Budget>(
        'SELECT * FROM budgets WHERE month = ? AND category_id = ?;',
        [month, categoryId]
      )
    : await db.getFirstAsync<Budget>(
        'SELECT * FROM budgets WHERE month = ? AND category_id IS NULL;',
        [month]
      );

  const now = new Date().toISOString();
  if (existing) {
    await db.runAsync('UPDATE budgets SET amount = ? WHERE id = ?;', [
      Math.round(amount),
      existing.id,
    ]);
    return { ...existing, amount: Math.round(amount) };
  } else {
    const id = `bdg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await db.runAsync(
      'INSERT INTO budgets (id, month, category_id, amount, created_at) VALUES (?, ?, ?, ?, ?);',
      [id, month, categoryId, Math.round(amount), now]
    );
    return { id, month, category_id: categoryId, amount: Math.round(amount), created_at: now };
  }
}

export async function getOverallMonthlyBudget(month: string): Promise<Budget | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<Budget>(
    'SELECT * FROM budgets WHERE month = ? AND category_id IS NULL;',
    [month]
  );
}

export async function deleteBudget(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM budgets WHERE id = ?;', [id]);
}

export async function getMonthlyBudgetOverview(
  month: string
): Promise<{ overall: BudgetWithSpending | null; categoryBudgets: BudgetWithSpending[] }> {
  const db = await getDatabase();
  const budgets = await getBudgetsForMonth(month);

  // Get total expense for month
  const totalExpenseRow = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND date LIKE ?;",
    [`${month}%`]
  );
  const totalSpent = totalExpenseRow?.total || 0;

  let overall: BudgetWithSpending | null = null;
  const categoryBudgets: BudgetWithSpending[] = [];

  for (const b of budgets) {
    if (!b.category_id) {
      // Overall monthly budget
      const status = calculateBudgetStatus(totalSpent, b.amount);
      overall = {
        budget: b,
        categoryName: 'Total Anggaran Bulanan',
        categoryIcon: 'PieChart',
        categoryColor: '#35D07F',
        status,
      };
    } else {
      // Category budget
      const catRow = await db.getFirstAsync<{ name: string; icon: string; color: string }>(
        'SELECT name, icon, color FROM categories WHERE id = ?;',
        [b.category_id]
      );
      const spentRow = await db.getFirstAsync<{ total: number }>(
        "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND category_id = ? AND date LIKE ?;",
        [b.category_id, `${month}%`]
      );
      const spent = spentRow?.total || 0;
      const status = calculateBudgetStatus(spent, b.amount);

      categoryBudgets.push({
        budget: b,
        categoryName: catRow?.name || 'Kategori',
        categoryIcon: catRow?.icon || 'Folder',
        categoryColor: catRow?.color || '#35D07F',
        status,
      });
    }
  }

  return { overall, categoryBudgets };
}
