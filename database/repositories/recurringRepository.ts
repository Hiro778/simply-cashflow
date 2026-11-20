import { getDatabase } from '../db';
import { RecurringTransaction, RecurringFrequency, RecurringStatus } from '../schema';
import { insertTransaction } from './transactionRepository';

export async function getAllRecurring(): Promise<RecurringTransaction[]> {
  const db = await getDatabase();
  return await db.getAllAsync<RecurringTransaction>(
    'SELECT * FROM recurring_transactions ORDER BY next_due_date ASC, created_at DESC;'
  );
}

export async function getActiveRecurring(): Promise<RecurringTransaction[]> {
  const db = await getDatabase();
  return await db.getAllAsync<RecurringTransaction>(
    'SELECT * FROM recurring_transactions WHERE is_active = 1 ORDER BY next_due_date ASC;'
  );
}

export async function getUpcomingBills(limitDays: number = 30): Promise<RecurringTransaction[]> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + limitDays * 86400000).toISOString().split('T')[0];

  return await db.getAllAsync<RecurringTransaction>(
    `SELECT * FROM recurring_transactions 
     WHERE is_active = 1 AND type = 'expense' AND next_due_date <= ? AND next_due_date >= ?
     ORDER BY next_due_date ASC;`,
    [maxDate, today]
  );
}

export async function insertRecurring(
  item: Omit<RecurringTransaction, 'created_at' | 'updated_at'>
): Promise<RecurringTransaction> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO recurring_transactions (id, title, amount, type, category_id, category_name, frequency, start_date, next_due_date, is_active, auto_record, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      item.id,
      item.title,
      Math.round(item.amount),
      item.type,
      item.category_id,
      item.category_name,
      item.frequency,
      item.start_date,
      item.next_due_date,
      item.is_active,
      item.auto_record,
      item.status || 'scheduled',
      now,
      now,
    ]
  );

  return {
    ...item,
    amount: Math.round(item.amount),
    created_at: now,
    updated_at: now,
  };
}

export async function updateRecurring(
  item: Partial<RecurringTransaction> & { id: string }
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const existing = await db.getFirstAsync<RecurringTransaction>(
    'SELECT * FROM recurring_transactions WHERE id = ?;',
    [item.id]
  );
  if (!existing) return;

  await db.runAsync(
    `UPDATE recurring_transactions
     SET title = ?, amount = ?, type = ?, category_id = ?, category_name = ?, frequency = ?, start_date = ?, next_due_date = ?, is_active = ?, auto_record = ?, status = ?, updated_at = ?
     WHERE id = ?;`,
    [
      item.title ?? existing.title,
      item.amount !== undefined ? Math.round(item.amount) : existing.amount,
      item.type ?? existing.type,
      item.category_id ?? existing.category_id,
      item.category_name ?? existing.category_name,
      item.frequency ?? existing.frequency,
      item.start_date ?? existing.start_date,
      item.next_due_date ?? existing.next_due_date,
      item.is_active ?? existing.is_active,
      item.auto_record ?? existing.auto_record,
      item.status ?? existing.status,
      now,
      item.id,
    ]
  );
}

export async function deleteRecurring(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM recurring_transactions WHERE id = ?;', [id]);
}

export function computeNextDueDate(currentDue: string, freq: RecurringFrequency): string {
  const date = new Date(currentDue);
  switch (freq) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Confirms a recurring payment:
 * 1. Creates a real transaction in the ledger
 * 2. Advances the recurring schedule to the next due date
 */
export async function confirmRecurringPayment(
  recurringId: string,
  paymentDate: string = new Date().toISOString().split('T')[0]
): Promise<void> {
  const db = await getDatabase();
  const item = await db.getFirstAsync<RecurringTransaction>(
    'SELECT * FROM recurring_transactions WHERE id = ?;',
    [recurringId]
  );
  if (!item) return;

  // Insert real transaction
  const txId = `tx-rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  await insertTransaction({
    id: txId,
    amount: item.amount,
    type: item.type,
    category_id: item.category_id,
    category_name: item.category_name,
    description: `[Rutin: ${item.title}]`,
    date: paymentDate,
    source: 'manual',
    payment_method: 'transfer',
    reference_id: item.id,
  });

  // Advance schedule
  const nextDate = computeNextDueDate(item.next_due_date, item.frequency);
  await updateRecurring({
    id: item.id,
    next_due_date: nextDate,
    status: 'scheduled',
  });
}

export async function skipRecurringPayment(recurringId: string): Promise<void> {
  const db = await getDatabase();
  const item = await db.getFirstAsync<RecurringTransaction>(
    'SELECT * FROM recurring_transactions WHERE id = ?;',
    [recurringId]
  );
  if (!item) return;

  const nextDate = computeNextDueDate(item.next_due_date, item.frequency);
  await updateRecurring({
    id: item.id,
    next_due_date: nextDate,
    status: 'skipped',
  });
}
