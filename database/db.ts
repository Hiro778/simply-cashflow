import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL, DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from './schema';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await SQLite.openDatabaseAsync('simply_cashflow.db');
  await initDatabase(dbInstance);
  return dbInstance;
}

export async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync(CREATE_TABLES_SQL);

  // Seed default categories if table is empty
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM categories;');
  if (!row || row.count === 0) {
    const now = new Date().toISOString();
    for (const cat of [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES]) {
      await db.runAsync(
        'INSERT OR IGNORE INTO categories (id, name, type, icon, color, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
        [cat.id, cat.name, cat.type, cat.icon, cat.color, cat.is_default, now]
      );
    }
  }
}
