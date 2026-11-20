import { create } from 'zustand';
import {
  Transaction,
  Category,
  SavingsGoal,
  Budget,
  RecurringTransaction,
  CapturedNotification,
} from '../database/schema';
import {
  calculateSummary,
  FinancialSummary,
  SafeToSpendResult,
  SmartBudgetPace,
} from '../utils/calculations';
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
import {
  getAllRecurring,
  getUpcomingBills,
  insertRecurring as insertRecDb,
  updateRecurring as updateRecDb,
  deleteRecurring as deleteRecDb,
  confirmRecurringPayment,
  skipRecurringPayment,
} from '../database/repositories/recurringRepository';
import {
  getPendingReviewCaptured,
  approvePendingCapture,
  updateCapturedStatus,
} from '../database/repositories/captureRepository';
import {
  getSafeToSpendOverview,
  getSmartBudgetPaceOverview,
} from '../services/analyticsService';
import { SmartCaptureBridgeService } from '../services/smartCapture/smartCaptureService';
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
  recurringTransactions: RecurringTransaction[];
  upcomingBills: RecurringTransaction[];
  pendingCaptures: CapturedNotification[];
  safeToSpend: SafeToSpendResult;
  smartBudgetPace: SmartBudgetPace | null;

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

  // Recurring Actions
  addRecurring: (rec: Omit<RecurringTransaction, 'created_at' | 'updated_at'>) => Promise<void>;
  updateRecurring: (rec: Partial<RecurringTransaction> & { id: string }) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;
  confirmRecurring: (id: string) => Promise<void>;
  skipRecurring: (id: string) => Promise<void>;

  // Smart Capture Actions
  syncCaptures: () => Promise<void>;
  approveCapture: (id: string, overrides?: any) => Promise<void>;
  dismissCapture: (id: string) => Promise<void>;
}

const defaultSafeToSpend: SafeToSpendResult = {
  currentBalance: 0,
  upcomingBillsTotal: 0,
  reservedFunds: 0,
  plannedSavingsAllocations: 0,
  safeToSpend: 0,
  dailySafeToSpend: 0,
  status: 'comfortable',
};

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
  recurringTransactions: [],
  upcomingBills: [],
  pendingCaptures: [],
  safeToSpend: defaultSafeToSpend,
  smartBudgetPace: null,

  initialize: async () => {
    try {
      set({ isLoading: true });
      await getDatabase(); // triggers table creation & category seeding & v2 migrations

      const month = get().currentMonth;
      const categories = await getAllCategories();
      const allTx = await getAllTransactions();
      const monthTx = await getTransactionsByMonth(month);
      const budgetOverview = await getMonthlyBudgetOverview(month);
      const savingsGoals = await getGoalsWithMetrics();
      const recurringTransactions = await getAllRecurring();
      const upcomingBills = await getUpcomingBills(30);
      const pendingCaptures = await getPendingReviewCaptured();
      const safeToSpend = await getSafeToSpendOverview(month);
      const smartBudgetPace = await getSmartBudgetPaceOverview(month);

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
        recurringTransactions,
        upcomingBills,
        pendingCaptures,
        safeToSpend,
        smartBudgetPace,
      });

      // Background check for pending notifications from native Android service
      SmartCaptureBridgeService.syncBufferedNotifications(() => {
        get().refresh();
      });

      // Listen for live captures if app is open
      SmartCaptureBridgeService.startLiveListener(() => {
        get().refresh();
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
    const safeToSpend = await getSafeToSpendOverview(month);
    const smartBudgetPace = await getSmartBudgetPaceOverview(month);

    set({
      monthTransactions: monthTx,
      monthSummary: calculateSummary(monthTx),
      overallBudget: budgetOverview.overall,
      categoryBudgets: budgetOverview.categoryBudgets,
      safeToSpend,
      smartBudgetPace,
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
    const recurringTransactions = await getAllRecurring();
    const upcomingBills = await getUpcomingBills(30);
    const pendingCaptures = await getPendingReviewCaptured();
    const safeToSpend = await getSafeToSpendOverview(month);
    const smartBudgetPace = await getSmartBudgetPaceOverview(month);

    set({
      categories,
      allTransactions: allTx,
      monthTransactions: monthTx,
      monthSummary: calculateSummary(monthTx),
      allTimeSummary: calculateSummary(allTx),
      overallBudget: budgetOverview.overall,
      categoryBudgets: budgetOverview.categoryBudgets,
      savingsGoals,
      recurringTransactions,
      upcomingBills,
      pendingCaptures,
      safeToSpend,
      smartBudgetPace,
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
    await setBudget(get().currentMonth, null, amount);
    await get().refresh();
  },

  setCategoryBudget: async (categoryId, amount) => {
    await setBudget(get().currentMonth, categoryId, amount);
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

  addRecurring: async (rec) => {
    await insertRecDb(rec);
    await get().refresh();
  },

  updateRecurring: async (rec) => {
    await updateRecDb(rec);
    await get().refresh();
  },

  deleteRecurring: async (id) => {
    await deleteRecDb(id);
    await get().refresh();
  },

  confirmRecurring: async (id) => {
    await confirmRecurringPayment(id);
    await get().refresh();
  },

  skipRecurring: async (id) => {
    await skipRecurringPayment(id);
    await get().refresh();
  },

  syncCaptures: async () => {
    await SmartCaptureBridgeService.syncBufferedNotifications();
    await get().refresh();
  },

  approveCapture: async (id, overrides) => {
    await approvePendingCapture(id, overrides);
    await get().refresh();
  },

  dismissCapture: async (id) => {
    await updateCapturedStatus(id, 'dismissed');
    await get().refresh();
  },
}));
