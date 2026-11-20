import * as SQLite from 'expo-sqlite';
import {
  CREATE_TABLES_SQL,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
} from './schema';

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

  // Schema migrations for v2.0.0
  await migrateSchemaV2(db);

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

async function migrateSchemaV2(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(transactions);');
    const columnNames = new Set(columns.map((c) => c.name));

    if (!columnNames.has('time')) {
      await db.execAsync('ALTER TABLE transactions ADD COLUMN time TEXT;');
    }
    if (!columnNames.has('merchant')) {
      await db.execAsync('ALTER TABLE transactions ADD COLUMN merchant TEXT;');
    }
    if (!columnNames.has('source')) {
      await db.execAsync("ALTER TABLE transactions ADD COLUMN source TEXT DEFAULT 'manual';");
    }
    if (!columnNames.has('payment_method')) {
      await db.execAsync("ALTER TABLE transactions ADD COLUMN payment_method TEXT DEFAULT 'cash';");
    }
    if (!columnNames.has('reference_id')) {
      await db.execAsync('ALTER TABLE transactions ADD COLUMN reference_id TEXT;');
    }

    // Additional index
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);');
  } catch (err) {
    console.warn('Database migration note:', err);
  }
}
