import { getDatabase } from '../db';

export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?;',
    [key]
  );
  return row ? row.value : defaultValue;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);',
    [key, value]
  );
}

export async function clearAllData(): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM savings_contributions;');
    await db.runAsync('DELETE FROM savings_goals;');
    await db.runAsync('DELETE FROM budgets;');
    await db.runAsync('DELETE FROM transactions;');
  });
}
