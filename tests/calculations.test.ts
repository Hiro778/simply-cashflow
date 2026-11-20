import {
  calculateSummary,
  calculateBudgetStatus,
  calculateSavingsMetrics,
  assessFinancialHealth,
  calculateSafeToSpend,
  calculateSmartBudgetPace,
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

  test('calculateSmartBudgetPace evaluates calendar pace accurately', () => {
    // Budget: 3,000,000, spent: 1,000,000 on day 10 of 30 days -> on_track (1.0 ratio)
    const onTrack = calculateSmartBudgetPace(3_000_000, 1_000_000, 10, 30);
    expect(onTrack.paceRatio).toBe(1.0);
    expect(onTrack.status).toBe('on_track');
    expect(onTrack.recommendedDailyAllowance).toBe(100_000); // 2,000,000 remaining / 20 days remaining (or 21)

    // Budget: 3,000,000, spent: 2,000,000 on day 10 of 30 days -> fast_pace (2.0 ratio)
    const fastPace = calculateSmartBudgetPace(3_000_000, 2_000_000, 10, 30);
    expect(fastPace.paceRatio).toBeGreaterThan(1.15);
    expect(fastPace.status).toBe('fast_pace');

    // Budget: 3,000,000, spent: 3,500,000 -> overspent
    const over = calculateSmartBudgetPace(3_000_000, 3_500_000, 15, 30);
    expect(over.status).toBe('overspent');
  });

  test('calculateSafeToSpend implements transparent formula without double counting', () => {
    // Balance: 10,000,000, Bills: 2,000,000, Reserve: 1,000,000, Savings: 1,500,000, 15 days remaining
    const res = calculateSafeToSpend({
      currentBalance: 10_000_000,
      upcomingBillsTotal: 2_000_000,
      reservedFunds: 1_000_000,
      plannedSavingsAllocations: 1_500_000,
      daysRemainingInMonth: 15,
    });

    expect(res.currentBalance).toBe(10_000_000);
    expect(res.upcomingBillsTotal).toBe(2_000_000);
    expect(res.reservedFunds).toBe(1_000_000);
    expect(res.plannedSavingsAllocations).toBe(1_500_000);
    // Safe to spend = 10,000,000 - 4,500,000 = 5,500,000
    expect(res.safeToSpend).toBe(5_500_000);
    expect(res.dailySafeToSpend).toBe(Math.round(5_500_000 / 15));
    expect(res.status).toBe('comfortable');

    // Zero balance -> depleted
    const depleted = calculateSafeToSpend({
      currentBalance: 2_000_000,
      upcomingBillsTotal: 2_500_000,
    });
    expect(depleted.safeToSpend).toBe(0);
    expect(depleted.status).toBe('depleted');
  });

  test('calculateSavingsMetrics produces accurate daily requirements and milestones', () => {
    // Target 10 million, saved 2.5 million (25%), 75 days remaining
    const metrics = calculateSavingsMetrics(10_000_000, 2_500_000, 75);
    expect(metrics.targetAmount).toBe(10_000_000);
    expect(metrics.currentAmount).toBe(2_500_000);
    expect(metrics.remainingAmount).toBe(7_500_000);
    expect(metrics.percentage).toBe(25);
    expect(metrics.requiredDaily).toBe(100_000);
    expect(metrics.milestones.milestone25).toBe(true);
    expect(metrics.milestones.milestone50).toBe(false);
    expect(metrics.milestones.nextMilestonePercent).toBe(50);
  });

  test('assessFinancialHealth provides constructive feedback and matching badge', () => {
    const emptyHealth = assessFinancialHealth(0, 0);
    expect(emptyHealth.title).toBe('Mulai Mencatat');

    const surplusHealth = assessFinancialHealth(10_000_000, 4_000_000);
    expect(surplusHealth.title).toBe('Sangat Sehat');
    expect(surplusHealth.score).toBeGreaterThanOrEqual(60);

    const deficitHealth = assessFinancialHealth(5_000_000, 8_000_000);
    expect(deficitHealth.title).toBe('Pengeluaran Berlebih');
    expect(deficitHealth.badgeColor).toBe('#D96D70');
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
    expect(formatIDRCompact(50000)).toBe('Rp 50 rb');
    expect(formatIDRCompact(2500000)).toBe('Rp 2,5 jt');
    expect(formatIDRCompact(1200000000)).toBe('Rp 1,2 M');
  });

  test('parseIDR cleans dirty input and handles integer amounts', () => {
    expect(parseIDR('Rp 1.500.000')).toBe(1500000);
    expect(parseIDR('250.000')).toBe(250000);
    expect(parseIDR('')).toBe(0);
    expect(parseIDR(75000)).toBe(75000);
  });
});
