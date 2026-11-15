import { create } from 'zustand';
import { Transaction, Category, SavingsGoal, Budget } from '../database/schema';
import { calculateSummary, FinancialSummary } from '../utils/calculations';
import { getCurrentMonthString } from '../utils/dates';
import {
  getAllTransactions,
  getTransactionsByMonth,
  insertTransaction,
  updateTransaction as updateTxDb,
  deleteTransaction as deleteTxDb,
} from '../database/repositories/transactionRepository';
import { getAllCategories } from '../database/repositories/categoryRepository';
import {
  getMonthlyBudgetOverview,
  setBudget,
  BudgetWithSpending,
} from '../database/repositories/budgetRepository';
import {
  getGoalsWithMetrics,
  insertSavingsGoal,
  updateSavingsGoal as updateGoalDb,
  deleteSavingsGoal as deleteGoalDb,
  addSavingsContribution as addContribDb,
  SavingsGoalWithMetrics,
} from '../database/repositories/savingsRepository';
import { getDatabase } from '../database/db';

interface AppState {
  isInitialized: boolean;
  isLoading: boolean;
  currentMonth: string;
  allTransactions: Transaction[];
  monthTransactions: Transaction[];
  categories: Category[];
  monthSummary: FinancialSummary;
  allTimeSummary: FinancialSummary;
  overallBudget: BudgetWithSpending | null;
  categoryBudgets: BudgetWithSpending[];
  savingsGoals: SavingsGoalWithMetrics[];

  // Actions
  initialize: () => Promise<void>;
  setCurrentMonth: (month: string) => Promise<void>;
  refresh: () => Promise<void>;

  // Transaction Actions
  addTransaction: (tx: Omit<Transaction, 'created_at' | 'updated_at'>) => Promise<void>;
  updateTransaction: (tx: Omit<Transaction, 'created_at' | 'updated_at'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Budget Actions
  setOverallBudget: (amount: number) => Promise<void>;
  setCategoryBudget: (categoryId: string, amount: number) => Promise<void>;

  // Savings Actions
  addSavingsGoal: (goal: Omit<SavingsGoal, 'current_amount' | 'status' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSavingsGoal: (goal: Partial<SavingsGoal> & { id: string }) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  addSavingsContribution: (goalId: string, amount: number, date: string, note?: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isInitialized: false,
  isLoading: true,
  currentMonth: getCurrentMonthString(),
  allTransactions: [],
  monthTransactions: [],
  categories: [],
  monthSummary: { totalIncome: 0, totalExpense: 0, netBalance: 0, savingsRate: 0 },
  allTimeSummary: { totalIncome: 0, totalExpense: 0, netBalance: 0, savingsRate: 0 },
  overallBudget: null,
  categoryBudgets: [],
  savingsGoals: [],

  initialize: async () => {
    try {
      set({ isLoading: true });
      await getDatabase(); // triggers table creation & category seeding
      const month = get().currentMonth;
      const categories = await getAllCategories();
      const allTx = await getAllTransactions();
      const monthTx = await getTransactionsByMonth(month);
      const budgetOverview = await getMonthlyBudgetOverview(month);
      const savingsGoals = await getGoalsWithMetrics();

      set({
        isInitialized: true,
        isLoading: false,
        categories,
        allTransactions: allTx,
        monthTransactions: monthTx,
        monthSummary: calculateSummary(monthTx),
        allTimeSummary: calculateSummary(allTx),
        overallBudget: budgetOverview.overall,
        categoryBudgets: budgetOverview.categoryBudgets,
        savingsGoals,
      });
    } catch (error) {
      console.error('Failed to initialize app state:', error);
      set({ isLoading: false });
    }
  },

  setCurrentMonth: async (month: string) => {
    set({ currentMonth: month, isLoading: true });
    const monthTx = await getTransactionsByMonth(month);
    const budgetOverview = await getMonthlyBudgetOverview(month);
    set({
      monthTransactions: monthTx,
      monthSummary: calculateSummary(monthTx),
      overallBudget: budgetOverview.overall,
      categoryBudgets: budgetOverview.categoryBudgets,
      isLoading: false,
    });
  },

  refresh: async () => {
    const month = get().currentMonth;
    const categories = await getAllCategories();
    const allTx = await getAllTransactions();
    const monthTx = await getTransactionsByMonth(month);
    const budgetOverview = await getMonthlyBudgetOverview(month);
    const savingsGoals = await getGoalsWithMetrics();

    set({
      categories,
      allTransactions: allTx,
      monthTransactions: monthTx,
      monthSummary: calculateSummary(monthTx),
      allTimeSummary: calculateSummary(allTx),
      overallBudget: budgetOverview.overall,
      categoryBudgets: budgetOverview.categoryBudgets,
      savingsGoals,
    });
  },

  addTransaction: async (tx) => {
    await insertTransaction(tx);
    await get().refresh();
  },

  updateTransaction: async (tx) => {
    await updateTxDb(tx);
    await get().refresh();
  },

  deleteTransaction: async (id) => {
    await deleteTxDb(id);
    await get().refresh();
  },

  setOverallBudget: async (amount) => {
    const month = get().currentMonth;
    await setBudget(month, null, amount);
    await get().refresh();
  },

  setCategoryBudget: async (categoryId, amount) => {
    const month = get().currentMonth;
    await setBudget(month, categoryId, amount);
    await get().refresh();
  },

  addSavingsGoal: async (goal) => {
    await insertSavingsGoal(goal);
    await get().refresh();
  },

  updateSavingsGoal: async (goal) => {
    await updateGoalDb(goal);
    await get().refresh();
  },

  deleteSavingsGoal: async (id) => {
    await deleteGoalDb(id);
    await get().refresh();
  },

  addSavingsContribution: async (goalId, amount, date, note) => {
    await addContribDb(goalId, amount, date, note);
    await get().refresh();
  },
}));
