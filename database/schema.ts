export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  is_default: number;
  created_at: string;
}

export type TransactionSource =
  | 'manual'
  | 'DANA'
  | 'GoPay'
  | 'OVO'
  | 'ShopeePay'
  | 'BCA'
  | 'BRI'
  | 'Mandiri'
  | 'QRIS'
  | 'other';

export type PaymentMethod =
  | 'cash'
  | 'transfer'
  | 'e-wallet'
  | 'qris'
  | 'debit'
  | 'credit';

export interface Transaction {
  id: string;
  amount: number; // Integer in Indonesian Rupiah (IDR)
  type: 'income' | 'expense';
  category_id: string;
  category_name: string;
  description: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  merchant?: string;
  source?: TransactionSource;
  payment_method?: PaymentMethod;
  reference_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM
  category_id: string | null; // null for total overall monthly budget
  amount: number;
  created_at: string;
}

export type SavingsGoalStatus = 'active' | 'completed' | 'paused' | 'archived';

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string; // YYYY-MM-DD
  description?: string;
  icon?: string;
  color?: string;
  status: SavingsGoalStatus;
  created_at: string;
  updated_at: string;
}

export interface SavingsContribution {
  id: string;
  goal_id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  created_at: string;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type RecurringStatus = 'scheduled' | 'due' | 'confirmed' | 'skipped';

export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  category_name: string;
  frequency: RecurringFrequency;
  start_date: string;
  next_due_date: string;
  is_active: number;
  auto_record: number;
  status: RecurringStatus;
  created_at: string;
  updated_at: string;
}

export type CaptureStatus = 'auto_saved' | 'pending_review' | 'ignored' | 'dismissed';

export interface CapturedNotification {
  id: string;
  package_name: string;
  app_name: string;
  title: string;
  body: string;
  notification_timestamp: number;
  parsed_amount: number | null;
  parsed_type: 'income' | 'expense' | null;
  parsed_merchant: string | null;
  parsed_category_id: string | null;
  parsed_category_name: string | null;
  confidence: number;
  fingerprint: string;
  status: CaptureStatus;
  transaction_id?: string | null;
  created_at: string;
}

export interface AppSetting {
  key: string;
  value: string;
}

export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'created_at'>[] = [
  { id: 'cat-inc-1', name: 'Gaji', type: 'income', icon: 'Briefcase', color: '#168653', is_default: 1 },
  { id: 'cat-inc-2', name: 'Freelance', type: 'income', icon: 'Laptop', color: '#39D98A', is_default: 1 },
  { id: 'cat-inc-3', name: 'Bisnis', type: 'income', icon: 'Store', color: '#22C55E', is_default: 1 },
  { id: 'cat-inc-4', name: 'Investasi', type: 'income', icon: 'TrendingUp', color: '#10B981', is_default: 1 },
  { id: 'cat-inc-5', name: 'Pemasukan Lain', type: 'income', icon: 'PlusCircle', color: '#059669', is_default: 1 },
];

export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'created_at'>[] = [
  { id: 'cat-exp-1', name: 'Makanan & Minuman', type: 'expense', icon: 'Utensils', color: '#D96D70', is_default: 1 },
  { id: 'cat-exp-2', name: 'Transportasi', type: 'expense', icon: 'Car', color: '#FB923C', is_default: 1 },
  { id: 'cat-exp-3', name: 'Belanja', type: 'expense', icon: 'ShoppingBag', color: '#F472B6', is_default: 1 },
  { id: 'cat-exp-4', name: 'Pendidikan', type: 'expense', icon: 'GraduationCap', color: '#A78BFA', is_default: 1 },
  { id: 'cat-exp-5', name: 'Hiburan', type: 'expense', icon: 'Film', color: '#38BDF8', is_default: 1 },
  { id: 'cat-exp-6', name: 'Tagihan & Utilitas', type: 'expense', icon: 'Receipt', color: '#D9A441', is_default: 1 },
  { id: 'cat-exp-7', name: 'Kesehatan', type: 'expense', icon: 'HeartPulse', color: '#EC4899', is_default: 1 },
  { id: 'cat-exp-8', name: 'Pengeluaran Lain', type: 'expense', icon: 'HelpCircle', color: '#94A3B8', is_default: 1 },
];

export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_default INTEGER DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  amount INTEGER NOT NULL CHECK(amount > 0),
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  category_id TEXT NOT NULL,
  category_name TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  time TEXT,
  merchant TEXT,
  source TEXT DEFAULT 'manual',
  payment_method TEXT DEFAULT 'cash',
  reference_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL,
  category_id TEXT,
  amount INTEGER NOT NULL CHECK(amount > 0),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);

CREATE TABLE IF NOT EXISTS savings_goals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_amount INTEGER NOT NULL CHECK(target_amount > 0),
  current_amount INTEGER NOT NULL DEFAULT 0 CHECK(current_amount >= 0),
  target_date TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'target',
  color TEXT DEFAULT '#39D98A',
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paused', 'archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS savings_contributions (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK(amount > 0),
  date TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (goal_id) REFERENCES savings_goals (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_contributions_goal ON savings_contributions(goal_id);

CREATE TABLE IF NOT EXISTS recurring_transactions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK(amount > 0),
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  category_id TEXT NOT NULL,
  category_name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date TEXT NOT NULL,
  next_due_date TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  auto_record INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'due', 'confirmed', 'skipped')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE INDEX IF NOT EXISTS idx_recurring_due ON recurring_transactions(next_due_date);

CREATE TABLE IF NOT EXISTS captured_notifications (
  id TEXT PRIMARY KEY,
  package_name TEXT NOT NULL,
  app_name TEXT NOT NULL,
  title TEXT,
  body TEXT,
  notification_timestamp INTEGER NOT NULL,
  parsed_amount INTEGER,
  parsed_type TEXT CHECK(parsed_type IN ('income', 'expense')),
  parsed_merchant TEXT,
  parsed_category_id TEXT,
  parsed_category_name TEXT,
  confidence REAL NOT NULL,
  fingerprint TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('auto_saved', 'pending_review', 'ignored', 'dismissed')),
  transaction_id TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_captured_fingerprint ON captured_notifications(fingerprint);
CREATE INDEX IF NOT EXISTS idx_captured_status ON captured_notifications(status);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;
