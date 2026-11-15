import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getDatabase } from '../database/db';
import { getAllTransactions, replaceAllTransactions } from '../database/repositories/transactionRepository';
import { getAllSavingsGoals } from '../database/repositories/savingsRepository';
import { generateCSV, parseCSV, validateBackupJSON, BackupData } from '../utils/exportImport';
import { Transaction, Budget, SavingsGoal, SavingsContribution } from '../database/schema';

export async function exportJSONBackup(): Promise<string> {
  const db = await getDatabase();
  const transactions = await getAllTransactions();
  const categories = await db.getAllAsync('SELECT * FROM categories;');
  const budgets = await db.getAllAsync<Budget>('SELECT * FROM budgets;');
  const savings_goals = await getAllSavingsGoals();
  const savings_contributions = await db.getAllAsync<SavingsContribution>('SELECT * FROM savings_contributions;');

  const backupData: BackupData = {
    version: '1.0.0',
    exported_at: new Date().toISOString(),
    data: {
      transactions,
      categories: categories as any,
      budgets,
      savings_goals,
      savings_contributions,
    },
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const fileName = `simply_cashflow_backup_${Date.now()}.json`;

  try {
    const file = new File(Paths.document, fileName);
    file.create();
    file.write(jsonString);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Backup Simply Cashflow',
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
    // Replace transactions
    await replaceAllTransactions(validated.data.transactions);

    // Replace savings goals and contributions
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
            g.color || '#35D07F',
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

    // Replace budgets
    if (validated.data.budgets && validated.data.budgets.length > 0) {
      await db.runAsync('DELETE FROM budgets;');
      for (const b of validated.data.budgets) {
        await db.runAsync(
          'INSERT INTO budgets (id, month, category_id, amount, created_at) VALUES (?, ?, ?, ?, ?);',
          [b.id, b.month, b.category_id || null, b.amount, b.created_at || new Date().toISOString()]
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
    category_name: t.category_name || 'Lainnya',
    description: t.description || '',
    date: t.date || new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  await replaceAllTransactions(completeTransactions);
  return completeTransactions.length;
}
