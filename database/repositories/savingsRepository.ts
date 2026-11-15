import { getDatabase } from '../db';
import { SavingsGoal, SavingsContribution } from '../schema';
import { calculateSavingsMetrics, SavingsGoalMetrics } from '../../utils/calculations';
import { getDaysRemaining } from '../../utils/dates';

export interface SavingsGoalWithMetrics {
  goal: SavingsGoal;
  metrics: SavingsGoalMetrics;
  daysRemaining: number;
}

export async function getAllSavingsGoals(): Promise<SavingsGoal[]> {
  const db = await getDatabase();
  return await db.getAllAsync<SavingsGoal>(
    'SELECT * FROM savings_goals ORDER BY status ASC, created_at DESC;'
  );
}

export async function getSavingsGoalById(id: string): Promise<SavingsGoal | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<SavingsGoal>(
    'SELECT * FROM savings_goals WHERE id = ?;',
    [id]
  );
}

export async function insertSavingsGoal(
  goal: Omit<SavingsGoal, 'current_amount' | 'status' | 'created_at' | 'updated_at'>
): Promise<SavingsGoal> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO savings_goals (id, name, target_amount, current_amount, target_date, description, icon, color, status, created_at, updated_at)
     VALUES (?, ?, ?, 0, ?, ?, ?, ?, 'active', ?, ?);`,
    [
      goal.id,
      goal.name,
      Math.round(goal.target_amount),
      goal.target_date,
      goal.description || '',
      goal.icon || 'target',
      goal.color || '#35D07F',
      now,
      now,
    ]
  );

  return {
    ...goal,
    target_amount: Math.round(goal.target_amount),
    current_amount: 0,
    status: 'active',
    created_at: now,
    updated_at: now,
  };
}

export async function updateSavingsGoal(
  goal: Partial<SavingsGoal> & { id: string }
): Promise<void> {
  const db = await getDatabase();
  const existing = await getSavingsGoalById(goal.id);
  if (!existing) return;

  const now = new Date().toISOString();
  const target = goal.target_amount !== undefined ? Math.round(goal.target_amount) : existing.target_amount;
  const current = goal.current_amount !== undefined ? Math.round(goal.current_amount) : existing.current_amount;
  const status = current >= target ? 'completed' : (goal.status || existing.status);

  await db.runAsync(
    `UPDATE savings_goals
     SET name = ?, target_amount = ?, current_amount = ?, target_date = ?, description = ?, icon = ?, color = ?, status = ?, updated_at = ?
     WHERE id = ?;`,
    [
      goal.name || existing.name,
      target,
      current,
      goal.target_date || existing.target_date,
      goal.description ?? existing.description,
      goal.icon || existing.icon,
      goal.color || existing.color,
      status,
      now,
      goal.id,
    ]
  );
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM savings_contributions WHERE goal_id = ?;', [id]);
    await db.runAsync('DELETE FROM savings_goals WHERE id = ?;', [id]);
  });
}

export async function addSavingsContribution(
  goalId: string,
  amount: number,
  date: string,
  note?: string
): Promise<SavingsContribution> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const id = `cnt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const cleanAmount = Math.round(amount);

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO savings_contributions (id, goal_id, amount, date, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [id, goalId, cleanAmount, date, note || '', now]
    );

    // Update goal current_amount
    const totalRow = await db.getFirstAsync<{ total: number }>(
      'SELECT COALESCE(SUM(amount), 0) as total FROM savings_contributions WHERE goal_id = ?;',
      [goalId]
    );
    const newTotal = totalRow?.total || 0;

    const goal = await getSavingsGoalById(goalId);
    const status = goal && newTotal >= goal.target_amount ? 'completed' : 'active';

    await db.runAsync(
      'UPDATE savings_goals SET current_amount = ?, status = ?, updated_at = ? WHERE id = ?;',
      [newTotal, status, now, goalId]
    );
  });

  return {
    id,
    goal_id: goalId,
    amount: cleanAmount,
    date,
    note,
    created_at: now,
  };
}

export async function getContributionsForGoal(goalId: string): Promise<SavingsContribution[]> {
  const db = await getDatabase();
  return await db.getAllAsync<SavingsContribution>(
    'SELECT * FROM savings_contributions WHERE goal_id = ? ORDER BY date DESC, created_at DESC;',
    [goalId]
  );
}

export async function getGoalsWithMetrics(): Promise<SavingsGoalWithMetrics[]> {
  const goals = await getAllSavingsGoals();
  return goals.map((goal) => {
    const daysRemaining = getDaysRemaining(goal.target_date);
    const metrics = calculateSavingsMetrics(goal.target_amount, goal.current_amount, daysRemaining);
    return {
      goal,
      metrics,
      daysRemaining,
    };
  });
}
