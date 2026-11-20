import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getDatabase } from '../database/db';
import {
  getAllTransactions,
  replaceAllTransactions,
} from '../database/repositories/transactionRepository';
import { getAllSavingsGoals } from '../database/repositories/savingsRepository';
import { getAllRecurring } from '../database/repositories/recurringRepository';
import { getAllCaptured } from '../database/repositories/captureRepository';
import {
  generateCSV,
  parseCSV,
  validateBackupJSON,
  BackupData,
} from '../utils/exportImport';
import {
  Transaction,
  Budget,
  SavingsGoal,
  SavingsContribution,
  RecurringTransaction,
  CapturedNotification,
} from '../database/schema';

export async function exportJSONBackup(): Promise<string> {
  const db = await getDatabase();
  const transactions = await getAllTransactions();
  const categories = await db.getAllAsync('SELECT * FROM categories;');
  const budgets = await db.getAllAsync<Budget>('SELECT * FROM budgets;');
  const savings_goals = await getAllSavingsGoals();
  const savings_contributions = await db.getAllAsync<SavingsContribution>(
    'SELECT * FROM savings_contributions;'
  );
  const recurring_transactions = await getAllRecurring();
  const captured_notifications = await getAllCaptured();
  const settings = await db.getAllAsync<{ key: string; value: string }>(
    'SELECT * FROM app_settings;'
  );

  const backupData: BackupData = {
    version: '2.0.0',
    exported_at: new Date().toISOString(),
    data: {
      transactions,
      categories: categories as any,
      budgets,
      savings_goals,
      savings_contributions,
      recurring_transactions,
      captured_notifications,
      settings,
    },
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const fileName = `simply_cashflow_backup_v2_${Date.now()}.json`;

  try {
    const file = new File(Paths.document, fileName);
    file.create();
    file.write(jsonString);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Backup Simply Cashflow 2.0',
        UTI: 'public.json',
      });
    }
  } catch (error) {
    console.warn('File share not available or failed:', error);
  }

  return jsonString;
}

export async function exportCSVReport(): Promise<string> {
  const transactions = await getAllTransactions();
  const csvContent = generateCSV(transactions);
  const fileName = `simply_cashflow_transactions_${Date.now()}.csv`;

  try {
    const file = new File(Paths.document, fileName);
    file.create();
    file.write(csvContent);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Laporan Transaksi CSV',
        UTI: 'public.comma-separated-values-text',
      });
    }
  } catch (error) {
    console.warn('File share not available or failed:', error);
  }

  return csvContent;
}

export async function restoreFromJSON(jsonString: string): Promise<number> {
  const parsed = JSON.parse(jsonString);
  const validated = validateBackupJSON(parsed);
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    // 1. Transactions
    await replaceAllTransactions(validated.data.transactions);

    // 2. Savings goals and contributions
    if (validated.data.savings_goals && validated.data.savings_goals.length > 0) {
      await db.runAsync('DELETE FROM savings_contributions;');
      await db.runAsync('DELETE FROM savings_goals;');

      for (const g of validated.data.savings_goals) {
        await db.runAsync(
          `INSERT INTO savings_goals (id, name, target_amount, current_amount, target_date, description, icon, color, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            g.id,
            g.name,
            g.target_amount,
            g.current_amount || 0,
            g.target_date,
            g.description || '',
            g.icon || 'target',
            g.color || '#39D98A',
            g.status || 'active',
            g.created_at || new Date().toISOString(),
            g.updated_at || new Date().toISOString(),
          ]
        );
      }

      if (validated.data.savings_contributions) {
        for (const c of validated.data.savings_contributions) {
          await db.runAsync(
            `INSERT INTO savings_contributions (id, goal_id, amount, date, note, created_at)
             VALUES (?, ?, ?, ?, ?, ?);`,
            [c.id, c.goal_id, c.amount, c.date, c.note || '', c.created_at || new Date().toISOString()]
          );
        }
      }
    }

    // 3. Budgets
    if (validated.data.budgets && validated.data.budgets.length > 0) {
      await db.runAsync('DELETE FROM budgets;');
      for (const b of validated.data.budgets) {
        await db.runAsync(
          'INSERT INTO budgets (id, month, category_id, amount, created_at) VALUES (?, ?, ?, ?, ?);',
          [b.id, b.month, b.category_id || null, b.amount, b.created_at || new Date().toISOString()]
        );
      }
    }

    // 4. Recurring transactions (v2)
    if (validated.data.recurring_transactions && validated.data.recurring_transactions.length > 0) {
      await db.runAsync('DELETE FROM recurring_transactions;');
      for (const r of validated.data.recurring_transactions) {
        await db.runAsync(
          `INSERT INTO recurring_transactions (id, title, amount, type, category_id, category_name, frequency, start_date, next_due_date, is_active, auto_record, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            r.id,
            r.title,
            r.amount,
            r.type,
            r.category_id,
            r.category_name,
            r.frequency,
            r.start_date,
            r.next_due_date,
            r.is_active,
            r.auto_record,
            r.status || 'scheduled',
            r.created_at || new Date().toISOString(),
            r.updated_at || new Date().toISOString(),
          ]
        );
      }
    }
  });

  return validated.data.transactions.length;
}

export async function restoreFromCSV(csvContent: string): Promise<number> {
  const transactions = parseCSV(csvContent);
  if (transactions.length === 0) {
    throw new Error('Tidak ada data transaksi valid dalam file CSV');
  }

  const completeTransactions: Transaction[] = transactions.map((t, idx) => ({
    id: t.id || `csv-${Date.now()}-${idx}`,
    amount: t.amount || 0,
    type: t.type || 'expense',
    category_id: t.category_id || 'cat-exp-8',
    category_name: t.category_name || 'Pengeluaran Lain',
    description: t.description || '',
    date: t.date || new Date().toISOString().split('T')[0],
    merchant: t.merchant || '',
    source: (t.source as any) || 'manual',
    payment_method: (t.payment_method as any) || 'cash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const tx of completeTransactions) {
      await db.runAsync(
        `INSERT OR REPLACE INTO transactions (id, amount, type, category_id, category_name, description, date, time, merchant, source, payment_method, reference_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          tx.id,
          tx.amount,
          tx.type,
          tx.category_id,
          tx.category_name,
          tx.description,
          tx.date,
          tx.time || '',
          tx.merchant || '',
          tx.source || 'manual',
          tx.payment_method || 'cash',
          tx.reference_id || '',
          tx.created_at,
          tx.updated_at,
        ]
      );
    }
  });

  return completeTransactions.length;
}
