import {
  calculateSummary,
  calculateBudgetStatus,
  calculateSavingsMetrics,
  assessFinancialHealth,
} from '../utils/calculations';
import { formatIDR, formatIDRCompact, parseIDR } from '../utils/currency';
import { formatReadableDate, formatReadableMonth, getDaysRemaining, getMonthsRemaining } from '../utils/dates';
import { generateCSV, parseCSV, validateBackupJSON } from '../utils/exportImport';

describe('Financial Calculations Engine', () => {
  test('calculateSummary handles empty transactions', () => {
    const summary = calculateSummary([]);
    expect(summary.totalIncome).toBe(0);
    expect(summary.totalExpense).toBe(0);
    expect(summary.netBalance).toBe(0);
    expect(summary.savingsRate).toBe(0);
  });

  test('calculateSummary calculates totals and positive savings rate', () => {
    const transactions = [
      { type: 'income' as const, amount: 10_000_000 },
      { type: 'income' as const, amount: 2_000_000 },
      { type: 'expense' as const, amount: 4_000_000 },
      { type: 'expense' as const, amount: 2_000_000 },
    ];
    const summary = calculateSummary(transactions);
    expect(summary.totalIncome).toBe(12_000_000);
    expect(summary.totalExpense).toBe(6_000_000);
    expect(summary.netBalance).toBe(6_000_000);
    expect(summary.savingsRate).toBe(50); // 50% savings rate
  });

  test('calculateSummary caps savings rate at 0 when expenses exceed income', () => {
    const transactions = [
      { type: 'income' as const, amount: 5_000_000 },
      { type: 'expense' as const, amount: 7_000_000 },
    ];
    const summary = calculateSummary(transactions);
    expect(summary.totalIncome).toBe(5_000_000);
    expect(summary.totalExpense).toBe(7_000_000);
    expect(summary.netBalance).toBe(-2_000_000);
    expect(summary.savingsRate).toBe(0);
  });

  test('calculateBudgetStatus thresholds (safe, warning, danger)', () => {
    // 50% spent -> safe
    const safe = calculateBudgetStatus(500_000, 1_000_000);
    expect(safe.percentage).toBe(50);
    expect(safe.level).toBe('safe');
    expect(safe.remaining).toBe(500_000);
    expect(safe.isOverspent).toBe(false);

    // 80% spent -> warning
    const warning = calculateBudgetStatus(800_000, 1_000_000);
    expect(warning.percentage).toBe(80);
    expect(warning.level).toBe('warning');
    expect(warning.remaining).toBe(200_000);
    expect(warning.isOverspent).toBe(false);

    // 110% spent -> danger
    const danger = calculateBudgetStatus(1_100_000, 1_000_000);
    expect(danger.percentage).toBe(110);
    expect(danger.level).toBe('danger');
    expect(danger.remaining).toBe(0);
    expect(danger.isOverspent).toBe(true);
  });

  test('calculateSavingsMetrics produces accurate daily, weekly, and monthly requirements', () => {
    // Target 10 million, saved 2 million, remaining 8 million, 80 days
    const metrics = calculateSavingsMetrics(10_000_000, 2_000_000, 80);
    expect(metrics.targetAmount).toBe(10_000_000);
    expect(metrics.currentAmount).toBe(2_000_000);
    expect(metrics.remainingAmount).toBe(8_000_000);
    expect(metrics.percentage).toBe(20);
    expect(metrics.requiredDaily).toBe(100_000); // 8,000,000 / 80
    expect(metrics.requiredWeekly).toBeGreaterThan(0);
    expect(metrics.requiredMonthly).toBeGreaterThan(0);
  });

  test('assessFinancialHealth provides constructive feedback', () => {
    const emptyHealth = assessFinancialHealth(0, 0);
    expect(emptyHealth.title).toBe('Mulai Mencatat');

    const surplusHealth = assessFinancialHealth(10_000_000, 4_000_000);
    expect(surplusHealth.title).toBe('Sangat Sehat');
    expect(surplusHealth.score).toBeGreaterThanOrEqual(60);

    const deficitHealth = assessFinancialHealth(5_000_000, 8_000_000);
    expect(deficitHealth.title).toBe('Pengeluaran Berlebih');
    expect(deficitHealth.badgeColor).toBe('#FF7272');
  });
});

describe('IDR Currency Formatting & Parsing', () => {
  test('formatIDR formats standard and negative Indonesian Rupiah correctly', () => {
    expect(formatIDR(1500000)).toBe('Rp 1.500.000');
    expect(formatIDR(0)).toBe('Rp 0');
    expect(formatIDR(-250000)).toBe('-Rp 250.000');
    expect(formatIDR(750000, false)).toBe('750.000');
  });

  test('formatIDRCompact handles thousands, millions, and billions', () => {
    expect(formatIDRCompact(500000)).toBe('Rp 500 rb');
    expect(formatIDRCompact(1500000)).toBe('Rp 1,5 jt');
    expect(formatIDRCompact(2000000000)).toBe('Rp 2 M');
  });

  test('parseIDR extracts integers accurately from various string inputs', () => {
    expect(parseIDR('Rp 1.500.000')).toBe(1500000);
    expect(parseIDR('1.500.000')).toBe(1500000);
    expect(parseIDR('Rp 25000')).toBe(25000);
    expect(parseIDR(750000)).toBe(750000);
    expect(parseIDR('')).toBe(0);
  });
});

describe('Dates and Planning Helpers', () => {
  test('formatReadableDate converts YYYY-MM-DD to Indonesian format', () => {
    expect(formatReadableDate('2026-11-15')).toBe('15 Nov 2026');
  });

  test('formatReadableMonth converts YYYY-MM to full Indonesian month', () => {
    expect(formatReadableMonth('2026-11')).toBe('November 2026');
  });

  test('getDaysRemaining returns non-negative days', () => {
    const days = getDaysRemaining('2026-12-31');
    expect(days).toBeGreaterThanOrEqual(0);
  });
});

describe('Export and Import Engine', () => {
  const dummyTransactions = [
    {
      id: 'tx-1',
      amount: 10000000,
      type: 'income' as const,
      category_id: 'cat-inc-1',
      category_name: 'Salary',
      description: 'Gaji Bulanan',
      date: '2026-11-01',
      created_at: '2026-11-01T10:00:00Z',
      updated_at: '2026-11-01T10:00:00Z',
    },
    {
      id: 'tx-2',
      amount: 50000,
      type: 'expense' as const,
      category_id: 'cat-exp-1',
      category_name: 'Food',
      description: 'Makan Siang',
      date: '2026-11-02',
      created_at: '2026-11-02T12:00:00Z',
      updated_at: '2026-11-02T12:00:00Z',
    },
  ];

  test('generateCSV creates valid CSV text with headers', () => {
    const csv = generateCSV(dummyTransactions);
    expect(csv).toContain('ID,Date,Type,Category,Amount,Description');
    expect(csv).toContain('"tx-1","2026-11-01","income","Salary",10000000,"Gaji Bulanan"');
    expect(csv).toContain('"tx-2","2026-11-02","expense","Food",50000,"Makan Siang"');
  });

  test('parseCSV reads CSV back into transaction objects', () => {
    const csv = generateCSV(dummyTransactions);
    const parsed = parseCSV(csv);
    expect(parsed.length).toBe(2);
    expect(parsed[0].amount).toBe(10000000);
    expect(parsed[0].type).toBe('income');
    expect(parsed[1].amount).toBe(50000);
    expect(parsed[1].type).toBe('expense');
  });

  test('validateBackupJSON validates structure and rejects corrupted data', () => {
    const validJson = {
      version: '1.0.0',
      exported_at: '2026-11-15T10:00:00Z',
      data: {
        transactions: dummyTransactions,
        budgets: [],
        savings_goals: [],
        savings_contributions: [],
      },
    };

    const validated = validateBackupJSON(validJson);
    expect(validated.data.transactions.length).toBe(2);

    expect(() => validateBackupJSON(null)).toThrow();
    expect(() => validateBackupJSON({ version: '1.0.0' })).toThrow();
  });
});
