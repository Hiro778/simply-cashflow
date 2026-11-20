import {
  calculateSummary,
  calculateBudgetStatus,
  calculateSavingsMetrics,
} from '../utils/calculations';
import {
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  Transaction,
} from '../database/schema';

describe('Database Schema & Repository Logic', () => {
  test('Default categories are correctly populated with proper metadata', () => {
    expect(DEFAULT_INCOME_CATEGORIES.length).toBe(5);
    expect(DEFAULT_EXPENSE_CATEGORIES.length).toBe(8);

    const salary = DEFAULT_INCOME_CATEGORIES.find((c) => c.name === 'Gaji');
    expect(salary).toBeDefined();
    expect(salary?.type).toBe('income');
    expect(salary?.icon).toBe('Briefcase');

    const food = DEFAULT_EXPENSE_CATEGORIES.find((c) => c.name === 'Makanan & Minuman');
    expect(food).toBeDefined();
    expect(food?.type).toBe('expense');
    expect(food?.color).toBe('#D96D70');
  });

  test('Transaction CRUD simulation maintains integrity and integer precision', () => {
    const store: Transaction[] = [];

    // 1. Create Transaction
    const tx1: Transaction = {
      id: 'tx-001',
      amount: 15000000,
      type: 'income',
      category_id: 'cat-inc-1',
      category_name: 'Salary',
      description: 'Gaji Pokok',
      date: '2026-11-01',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.push(tx1);

    expect(store.length).toBe(1);
    expect(store[0].amount).toBe(15000000);

    // 2. Add Expense
    const tx2: Transaction = {
      id: 'tx-002',
      amount: 2500000,
      type: 'expense',
      category_id: 'cat-exp-1',
      category_name: 'Food',
      description: 'Belanja Dapur',
      date: '2026-11-05',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.push(tx2);

    expect(store.length).toBe(2);

    // 3. Update Transaction
    const index = store.findIndex((t) => t.id === 'tx-002');
    store[index] = {
      ...store[index],
      amount: 3000000,
      description: 'Belanja Dapur & Stok',
    };

    expect(store[index].amount).toBe(3000000);

    // 4. Calculate Net
    const summary = calculateSummary(store);
    expect(summary.totalIncome).toBe(15000000);
    expect(summary.totalExpense).toBe(3000000);
    expect(summary.netBalance).toBe(12000000);
    expect(summary.savingsRate).toBe(80);

    // 5. Delete Transaction
    const filtered = store.filter((t) => t.id !== 'tx-001');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('tx-002');
  });

  test('Budget thresholds calculate correct warnings for categories', () => {
    const foodBudgetLimit = 4000000;
    const foodSpent = 3500000; // 87.5% -> warning

    const status = calculateBudgetStatus(foodSpent, foodBudgetLimit);
    expect(status.percentage).toBe(88);
    expect(status.level).toBe('warning');
    expect(status.isOverspent).toBe(false);
    expect(status.remaining).toBe(500000);
  });

  test('Savings target dynamically updates progress on deposit', () => {
    const targetAmount = 20000000;
    let currentAmount = 5000000;
    const daysRemaining = 120;

    let metrics = calculateSavingsMetrics(targetAmount, currentAmount, daysRemaining);
    expect(metrics.percentage).toBe(25);
    expect(metrics.remainingAmount).toBe(15000000);

    // Deposit 5,000,000
    currentAmount += 5000000;
    metrics = calculateSavingsMetrics(targetAmount, currentAmount, daysRemaining);
    expect(metrics.percentage).toBe(50);
    expect(metrics.remainingAmount).toBe(10000000);
  });
});
