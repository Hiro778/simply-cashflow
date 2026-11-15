export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  is_default: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  amount: number; // Integer in Indonesian Rupiah (IDR)
  type: 'income' | 'expense';
  category_id: string;
  category_name: string;
  description: string;
  date: string; // YYYY-MM-DD
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

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string; // YYYY-MM-DD
  description?: string;
  icon?: string;
  color?: string;
  status: 'active' | 'completed';
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

export interface AppSetting {
  key: string;
  value: string;
}

export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'created_at'>[] = [
  { id: 'cat-inc-1', name: 'Salary', type: 'income', icon: 'Briefcase', color: '#35D07F', is_default: 1 },
  { id: 'cat-inc-2', name: 'Freelance', type: 'income', icon: 'Laptop', color: '#80E6AC', is_default: 1 },
  { id: 'cat-inc-3', name: 'Business', type: 'income', icon: 'Store', color: '#4ADE80', is_default: 1 },
  { id: 'cat-inc-4', name: 'Investment', type: 'income', icon: 'TrendingUp', color: '#22C55E', is_default: 1 },
  { id: 'cat-inc-5', name: 'Other income', type: 'income', icon: 'PlusCircle', color: '#10B981', is_default: 1 },
];

export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'created_at'>[] = [
  { id: 'cat-exp-1', name: 'Food', type: 'expense', icon: 'Utensils', color: '#FF7272', is_default: 1 },
  { id: 'cat-exp-2', name: 'Transportation', type: 'expense', icon: 'Car', color: '#FB923C', is_default: 1 },
  { id: 'cat-exp-3', name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#F472B6', is_default: 1 },
  { id: 'cat-exp-4', name: 'Education', type: 'expense', icon: 'GraduationCap', color: '#A78BFA', is_default: 1 },
  { id: 'cat-exp-5', name: 'Entertainment', type: 'expense', icon: 'Film', color: '#38BDF8', is_default: 1 },
  { id: 'cat-exp-6', name: 'Bills', type: 'expense', icon: 'Receipt', color: '#FBBF24', is_default: 1 },
  { id: 'cat-exp-7', name: 'Health', type: 'expense', icon: 'HeartPulse', color: '#EC4899', is_default: 1 },
  { id: 'cat-exp-8', name: 'Other expenses', type: 'expense', icon: 'HelpCircle', color: '#94A3B8', is_default: 1 },
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
  color TEXT DEFAULT '#35D07F',
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed')),
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

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;
