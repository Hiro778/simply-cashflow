import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../hooks/useAppStore';
import { useTheme } from '../../hooks/useTheme';
import { SurfaceCard } from '../../components/SurfaceCard';
import { SafeToSpendCard } from '../../components/SafeToSpendCard';
import { SmartBudgetCard } from '../../components/SmartBudgetCard';
import { CaptureReviewCard } from '../../components/CaptureReviewCard';
import { TransactionItem } from '../../components/TransactionItem';
import { TransactionModal } from '../../components/TransactionModal';
import { BudgetModal } from '../../components/BudgetModal';
import { CircularProgress } from '../../components/CircularProgress';
import { formatIDR } from '../../utils/currency';
import { formatReadableMonth, formatReadableDate } from '../../utils/dates';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Settings,
  Sparkles,
  Calendar,
  Repeat,
  ChevronRight,
  Target,
  CheckCircle2,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Spacing, BorderRadius } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const {
    currentMonth,
    allTransactions,
    monthTransactions,
    monthSummary,
    allTimeSummary,
    overallBudget,
    savingsGoals,
    upcomingBills,
    pendingCaptures,
    safeToSpend,
    smartBudgetPace,
    categories,
    refresh,
    addTransaction,
    setOverallBudget,
    setCategoryBudget,
    approveCapture,
    dismissCapture,
    confirmRecurring,
  } = useAppStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddTxModalVisible, setIsAddTxModalVisible] = useState(false);
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const recentTransactions = monthTransactions.slice(0, 5);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.appTitle, { color: colors.text }]}>SIMPLY CASHFLOW</Text>
            <Text style={[styles.monthSubtitle, { color: colors.textSecondary }]}>
              {formatReadableMonth(currentMonth)}
            </Text>
          </View>

          <View style={styles.headerActions}>
            {pendingCaptures.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.captureNoticeBtn,
                  { backgroundColor: isDark ? 'rgba(57, 217, 138, 0.2)' : colors.primarySoft },
                ]}
                onPress={() => router.push('/smart-capture')}
              >
                <Sparkles size={16} color={colors.primary} />
                <Text style={[styles.captureNoticeText, { color: colors.primary }]}>
                  {pendingCaptures.length}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => router.push('/settings')}
            >
              <Settings size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Safe to Spend Engine Card */}
        <SafeToSpendCard
          safeToSpend={safeToSpend}
          onEditReserve={() => router.push('/settings')}
        />

        {/* Hero Balance Card */}
        <SurfaceCard style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>
              Saldo Kas Tersedia
            </Text>
            <TouchableOpacity
              onPress={() => setIsBudgetModalVisible(true)}
              style={[styles.budgetChip, { borderColor: colors.border }]}
            >
              <Text style={[styles.budgetChipText, { color: colors.primary }]}>
                {overallBudget ? 'Atur Anggaran' : '+ Pasang Anggaran'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.heroAmount, { color: colors.text }]}>
            {formatIDR(allTimeSummary.netBalance, true)}
          </Text>

          {/* Month Cashflow Row */}
          <View style={[styles.cashflowRow, { borderTopColor: colors.border }]}>
            <View style={styles.cashflowItem}>
              <View style={[styles.flowIconWrap, { backgroundColor: colors.incomeBackground }]}>
                <ArrowUpRight size={16} color={colors.income} />
              </View>
              <View>
                <Text style={[styles.flowLabel, { color: colors.textMuted }]}>Pemasukan Bulan Ini</Text>
                <Text style={[styles.flowValue, { color: colors.income }]}>
                  {formatIDR(monthSummary.totalIncome, true)}
                </Text>
              </View>
            </View>

            <View style={styles.cashflowItem}>
              <View style={[styles.flowIconWrap, { backgroundColor: colors.expenseBackground }]}>
                <ArrowDownLeft size={16} color={colors.expense} />
              </View>
              <View>
                <Text style={[styles.flowLabel, { color: colors.textMuted }]}>Pengeluaran Bulan Ini</Text>
                <Text style={[styles.flowValue, { color: colors.expense }]}>
                  {formatIDR(monthSummary.totalExpense, true)}
                </Text>
              </View>
            </View>
          </View>
        </SurfaceCard>

        {/* Pending Smart Capture Review Queue */}
        {pendingCaptures.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Sparkles size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Verifikasi Notifikasi Otomatis ({pendingCaptures.length})
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/smart-capture')}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>Semua</Text>
              </TouchableOpacity>
            </View>

            {pendingCaptures.slice(0, 2).map((item) => (
              <CaptureReviewCard
                key={item.id}
                capture={item}
                onApprove={approveCapture}
                onDismiss={dismissCapture}
              />
            ))}
          </View>
        )}

        {/* Quick Actions Row */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
            onPress={() => setIsAddTxModalVisible(true)}
          >
            <Plus size={22} color={isDark ? '#080F0C' : '#FFFFFF'} strokeWidth={2.5} />
            <Text style={[styles.quickActionTitlePrimary, { color: isDark ? '#080F0C' : '#FFFFFF' }]}>
              Catat Transaksi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => router.push('/recurring')}
          >
            <Repeat size={20} color={colors.primary} />
            <Text style={[styles.quickActionTitle, { color: colors.text }]}>
              Tagihan Rutin
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => router.push('/calendar')}
          >
            <Calendar size={20} color={colors.primary} />
            <Text style={[styles.quickActionTitle, { color: colors.text }]}>
              Kalender
            </Text>
          </TouchableOpacity>
        </View>

        {/* Smart Budget & Spending Pace */}
        <SmartBudgetCard pace={smartBudgetPace} />

        {/* Upcoming Bills Section */}
        {upcomingBills.length > 0 && (
          <SurfaceCard style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Repeat size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Tagihan Mendatang
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/recurring')}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>Kelola</Text>
              </TouchableOpacity>
            </View>

            {upcomingBills.slice(0, 3).map((bill) => (
              <View
                key={bill.id}
                style={[styles.billRow, { borderBottomColor: colors.border }]}
              >
                <View style={styles.billLeft}>
                  <Text style={[styles.billTitle, { color: colors.text }]}>
                    {bill.title}
                  </Text>
                  <Text style={[styles.billDate, { color: colors.textMuted }]}>
                    Jatuh tempo: {formatReadableDate(bill.next_due_date)}
                  </Text>
                </View>

                <View style={styles.billRight}>
                  <Text style={[styles.billAmount, { color: colors.expense }]}>
                    {formatIDR(bill.amount, true)}
                  </Text>
                  <TouchableOpacity
                    style={[styles.payBtn, { backgroundColor: colors.primarySoft }]}
                    onPress={() => confirmRecurring(bill.id)}
                  >
                    <CheckCircle2 size={14} color={colors.primary} />
                    <Text style={[styles.payBtnText, { color: colors.primary }]}>
                      Bayar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </SurfaceCard>
        )}

        {/* Savings Goals Preview */}
        {savingsGoals.length > 0 && (
          <SurfaceCard style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Target size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Target Impian
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/goals')}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>Semua</Text>
              </TouchableOpacity>
            </View>

            {savingsGoals.slice(0, 2).map(({ goal, metrics }) => (
              <View
                key={goal.id}
                style={[styles.goalRow, { borderBottomColor: colors.border }]}
              >
                <View style={styles.goalInfo}>
                  <Text style={[styles.goalName, { color: colors.text }]}>
                    {goal.name}
                  </Text>
                  <Text style={[styles.goalProgressText, { color: colors.textSecondary }]}>
                    {formatIDR(goal.current_amount)} dari {formatIDR(goal.target_amount)}
                  </Text>
                </View>

                <CircularProgress
                  size={46}
                  strokeWidth={4.5}
                  progress={metrics.percentage}
                  label={`${metrics.percentage}%`}
                  color={goal.color || colors.primary}
                />
              </View>
            ))}
          </SurfaceCard>
        )}

        {/* Recent Transactions */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Transaksi Terkini
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/activity')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <SurfaceCard style={styles.emptyCard}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Belum Ada Transaksi Bulan Ini
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Tekan tombol 'Catat Transaksi' untuk memulai pencatatan keuangan Anda.
              </Text>
            </SurfaceCard>
          ) : (
            recentTransactions.map((tx) => {
              const cat = categories.find((c) => c.id === tx.category_id);
              return (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  categoryIcon={cat?.icon}
                  categoryColor={cat?.color}
                  onPress={() => router.push('/(tabs)/activity')}
                />
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Transaction Entry Bottom Sheet Modal */}
      <TransactionModal
        visible={isAddTxModalVisible}
        onClose={() => setIsAddTxModalVisible(false)}
        categories={categories}
        onSave={addTransaction}
      />

      {/* Budget Configuration Modal */}
      <BudgetModal
        visible={isBudgetModalVisible}
        onClose={() => setIsBudgetModalVisible(false)}
        categories={categories}
        initialAmount={overallBudget?.budget.amount || 0}
        onSave={async (catId, amount) => {
          if (!catId) {
            await setOverallBudget(amount);
          } else {
            await setCategoryBudget(catId, amount);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  monthSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  captureNoticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  captureNoticeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    marginVertical: Spacing.sm,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  budgetChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  budgetChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginVertical: 4,
  },
  cashflowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  cashflowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  flowIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowLabel: {
    fontSize: 11,
  },
  flowValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: Spacing.sm,
  },
  quickActionCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  quickActionTitlePrimary: {
    fontSize: 12,
    fontWeight: '700',
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionContainer: {
    marginVertical: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  billLeft: {
    flex: 1,
  },
  billTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  billDate: {
    fontSize: 11,
    marginTop: 2,
  },
  billRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  billAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  payBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 14,
    fontWeight: '600',
  },
  goalProgressText: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyCard: {
    paddingVertical: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
