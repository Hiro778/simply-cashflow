import * as SQLite from 'expo-sqlite';
import {
  CREATE_TABLES_SQL,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
} from './schema';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbInitPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  if (dbInitPromise) {
    return dbInitPromise;
  }

  dbInitPromise = (async () => {
    try {
      const db = await SQLite.openDatabaseAsync('simply_cashflow.db');
      await initDatabase(db);
      dbInstance = db;
      return db;
    } catch (err) {
      dbInitPromise = null;
      throw err;
    }
  })();

  return dbInitPromise;
}

export async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  // Use WAL journal mode for concurrent read/write and foreign keys
  try {
    await db.execAsync('PRAGMA journal_mode = WAL;');
  } catch (err) {
    console.warn('PRAGMA journal_mode note:', err);
  }
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // 1. Run migrations first if legacy transactions table exists
  await migrateSchemaV2(db);

  // 2. Create tables & standard indices
  await db.execAsync(CREATE_TABLES_SQL);

  // 3. Ensure index on source exists safely
  try {
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);');
  } catch (err) {
    console.warn('idx_transactions_source note:', err);
  }

  // 4. Seed default categories if table is empty
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
    // Check if transactions table exists
    const tableExists = await db.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='transactions';"
    );
    if (!tableExists) {
      return;
    }

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
  } catch (err) {
    console.warn('Database migration note:', err);
  }
}
