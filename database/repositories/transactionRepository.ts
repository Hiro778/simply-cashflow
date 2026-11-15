import { getDatabase } from '../db';
import { Transaction } from '../schema';

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

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<Transaction>(
    'SELECT * FROM transactions WHERE id = ?;',
    [id]
  );
}

export async function insertTransaction(
  tx: Omit<Transaction, 'created_at' | 'updated_at'>
): Promise<Transaction> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  
  await db.runAsync(
    `INSERT INTO transactions (id, amount, type, category_id, category_name, description, date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      tx.id,
      Math.round(tx.amount),
      tx.type,
      tx.category_id,
      tx.category_name,
      tx.description || '',
      tx.date,
      now,
      now,
    ]
  );

  return {
    ...tx,
    amount: Math.round(tx.amount),
    created_at: now,
    updated_at: now,
  };
}

export async function updateTransaction(
  tx: Omit<Transaction, 'created_at' | 'updated_at'>
): Promise<Transaction> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE transactions
     SET amount = ?, type = ?, category_id = ?, category_name = ?, description = ?, date = ?, updated_at = ?
     WHERE id = ?;`,
    [
      Math.round(tx.amount),
      tx.type,
      tx.category_id,
      tx.category_name,
      tx.description || '',
      tx.date,
      now,
      tx.id,
    ]
  );

  return {
    ...tx,
    amount: Math.round(tx.amount),
    created_at: now,
    updated_at: now,
  };
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions WHERE id = ?;', [id]);
}

export async function searchTransactions(
  searchQuery?: string,
  categoryId?: string,
  type?: 'income' | 'expense'
): Promise<Transaction[]> {
  const db = await getDatabase();
  let query = 'SELECT * FROM transactions WHERE 1=1';
  const params: any[] = [];

  if (searchQuery && searchQuery.trim() !== '') {
    query += ' AND (description LIKE ? OR category_name LIKE ?)';
    params.push(`%${searchQuery.trim()}%`, `%${searchQuery.trim()}%`);
  }

  if (categoryId && categoryId !== 'all') {
    query += ' AND category_id = ?';
    params.push(categoryId);
  }

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  query += ' ORDER BY date DESC, created_at DESC;';

  return await db.getAllAsync<Transaction>(query, params);
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
        `INSERT INTO transactions (id, amount, type, category_id, category_name, description, date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          tx.id,
          Math.round(tx.amount),
          tx.type,
          tx.category_id,
          tx.category_name,
          tx.description || '',
          tx.date,
          tx.created_at || now,
          tx.updated_at || now,
        ]
      );
    }
  });
}
