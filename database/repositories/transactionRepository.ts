import { getDatabase } from '../db';
import { Transaction, TransactionSource, PaymentMethod } from '../schema';

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions ORDER BY date DESC, created_at DESC;'
  );
}

export async function getTransactionsByMonth(month: string): Promise<Transaction[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE date LIKE ? ORDER BY date DESC, created_at DESC;',
    [`${month}%`]
  );
}

export async function getTransactionsByDate(date: string): Promise<Transaction[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE date = ? ORDER BY created_at DESC;',
    [date]
  );
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<Transaction>(
    'SELECT * FROM transactions WHERE id = ?;',
    [id]
  );
}

export async function insertTransaction(
  tx: Omit<Transaction, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string }
): Promise<Transaction> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const time = tx.time || new Date().toTimeString().substring(0, 5);
  const source = tx.source || 'manual';
  const payment_method = tx.payment_method || 'cash';

  await db.runAsync(
    `INSERT INTO transactions (id, amount, type, category_id, category_name, description, date, time, merchant, source, payment_method, reference_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      tx.id,
      Math.round(tx.amount),
      tx.type,
      tx.category_id,
      tx.category_name,
      tx.description || '',
      tx.date,
      time,
      tx.merchant || '',
      source,
      payment_method,
      tx.reference_id || '',
      tx.created_at || now,
      tx.updated_at || now,
    ]
  );

  return {
    ...tx,
    amount: Math.round(tx.amount),
    time,
    source,
    payment_method,
    merchant: tx.merchant || '',
    reference_id: tx.reference_id || '',
    created_at: tx.created_at || now,
    updated_at: tx.updated_at || now,
  };
}

export async function updateTransaction(
  tx: Omit<Transaction, 'created_at' | 'updated_at'>
): Promise<Transaction> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const existing = await getTransactionById(tx.id);

  await db.runAsync(
    `UPDATE transactions
     SET amount = ?, type = ?, category_id = ?, category_name = ?, description = ?, date = ?, time = ?, merchant = ?, source = ?, payment_method = ?, reference_id = ?, updated_at = ?
     WHERE id = ?;`,
    [
      Math.round(tx.amount),
      tx.type,
      tx.category_id,
      tx.category_name,
      tx.description || '',
      tx.date,
      tx.time ?? (existing?.time || ''),
      tx.merchant ?? (existing?.merchant || ''),
      tx.source ?? (existing?.source || 'manual'),
      tx.payment_method ?? (existing?.payment_method || 'cash'),
      tx.reference_id ?? (existing?.reference_id || ''),
      now,
      tx.id,
    ]
  );

  return {
    ...tx,
    amount: Math.round(tx.amount),
    time: tx.time ?? existing?.time,
    merchant: tx.merchant ?? existing?.merchant,
    source: tx.source ?? existing?.source ?? 'manual',
    payment_method: tx.payment_method ?? existing?.payment_method ?? 'cash',
    reference_id: tx.reference_id ?? existing?.reference_id,
    created_at: existing?.created_at || now,
    updated_at: now,
  };
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions WHERE id = ?;', [id]);
}

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  type?: 'income' | 'expense' | 'all';
  source?: TransactionSource | 'all';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

export async function searchTransactions(filters: SearchFilters = {}): Promise<Transaction[]> {
  const db = await getDatabase();
  let sql = 'SELECT * FROM transactions WHERE 1=1';
  const params: any[] = [];

  if (filters.query && filters.query.trim() !== '') {
    const q = `%${filters.query.trim()}%`;
    sql += ' AND (description LIKE ? OR category_name LIKE ? OR merchant LIKE ? OR reference_id LIKE ?)';
    params.push(q, q, q, q);
  }

  if (filters.categoryId && filters.categoryId !== 'all') {
    sql += ' AND category_id = ?';
    params.push(filters.categoryId);
  }

  if (filters.type && filters.type !== 'all') {
    sql += ' AND type = ?';
    params.push(filters.type);
  }

  if (filters.source && filters.source !== 'all') {
    sql += ' AND source = ?';
    params.push(filters.source);
  }

  if (filters.startDate) {
    sql += ' AND date >= ?';
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    sql += ' AND date <= ?';
    params.push(filters.endDate);
  }

  if (filters.minAmount !== undefined && filters.minAmount > 0) {
    sql += ' AND amount >= ?';
    params.push(filters.minAmount);
  }

  if (filters.maxAmount !== undefined && filters.maxAmount > 0) {
    sql += ' AND amount <= ?';
    params.push(filters.maxAmount);
  }

  switch (filters.sortBy) {
    case 'date_asc':
      sql += ' ORDER BY date ASC, created_at ASC;';
      break;
    case 'amount_desc':
      sql += ' ORDER BY amount DESC, date DESC;';
      break;
    case 'amount_asc':
      sql += ' ORDER BY amount ASC, date DESC;';
      break;
    case 'date_desc':
    default:
      sql += ' ORDER BY date DESC, created_at DESC;';
      break;
  }

  return await db.getAllAsync<Transaction>(sql, params);
}

export async function clearAllTransactions(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions;');
}

export async function replaceAllTransactions(transactions: Transaction[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM transactions;');
    const now = new Date().toISOString();
    for (const tx of transactions) {
      await db.runAsync(
        `INSERT INTO transactions (id, amount, type, category_id, category_name, description, date, time, merchant, source, payment_method, reference_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          tx.id,
          Math.round(tx.amount),
          tx.type,
          tx.category_id,
          tx.category_name,
          tx.description || '',
          tx.date,
          tx.time || '',
          tx.merchant || '',
          tx.source || 'manual',
          tx.payment_method || 'cash',
          tx.reference_id || '',
          tx.created_at || now,
          tx.updated_at || now,
        ]
      );
    }
  });
}
