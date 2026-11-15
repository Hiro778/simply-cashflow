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
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { GlassCard } from '../../components/GlassCard';
import { CircularProgress } from '../../components/CircularProgress';
import { TransactionItem } from '../../components/TransactionItem';
import { TransactionModal } from '../../components/TransactionModal';
import { BudgetModal } from '../../components/BudgetModal';
import { formatIDR } from '../../utils/currency';
import { formatReadableMonth } from '../../utils/dates';
import { assessFinancialHealth } from '../../utils/calculations';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  ShieldCheck,
  Target,
  AlertTriangle,
  ChevronRight,
  Wallet,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const {
    currentMonth,
    allTransactions,
    monthTransactions,
    monthSummary,
    allTimeSummary,
    overallBudget,
    savingsGoals,
    categories,
    refresh,
    addTransaction,
    setOverallBudget,
    setCategoryBudget,
  } = useAppStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddTxModalVisible, setIsAddTxModalVisible] = useState(false);
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const health = assessFinancialHealth(
    monthSummary.totalIncome,
    monthSummary.totalExpense
  );

  const recentTransactions = monthTransactions.slice(0, 5);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>SIMPLY CASHFLOW</Text>
            <Text style={styles.monthSubtitle}>
              {formatReadableMonth(currentMonth)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddTxModalVisible(true)}
          >
            <Plus size={20} color="#080D0B" strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Catat</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Balance Card */}
        <GlassCard style={styles.heroCard} highlight>
          <View style={styles.heroHeader}>
            <View style={styles.balanceIconBg}>
              <Wallet size={18} color={Colors.primary} />
            </View>
            <Text style={styles.heroLabel}>Total Saldo Tersedia</Text>
          </View>

          <Text style={styles.heroBalance}>
            {formatIDR(allTimeSummary.netBalance)}
          </Text>

          <View style={styles.heroDivider} />

          {/* Monthly In / Out Badges */}
          <View style={styles.flowRow}>
            <View style={styles.flowItem}>
              <View style={styles.flowBadgeIncome}>
                <ArrowUpRight size={14} color={Colors.income} />
                <Text style={styles.flowTextIncome}>Pemasukan</Text>
              </View>
              <Text style={styles.flowAmountIncome}>
                {formatIDR(monthSummary.totalIncome)}
              </Text>
            </View>

            <View style={styles.flowItem}>
              <View style={styles.flowBadgeExpense}>
                <ArrowDownLeft size={14} color={Colors.expense} />
                <Text style={styles.flowTextExpense}>Pengeluaran</Text>
              </View>
              <Text style={styles.flowAmountExpense}>
                {formatIDR(monthSummary.totalExpense)}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Circular Savings Rate & Financial Health Row */}
        <View style={styles.metricsRow}>
          {/* Circular Savings Rate */}
          <GlassCard style={styles.metricCardHalf}>
            <Text style={styles.cardHeaderSmall}>Rasio Tabungan</Text>
            <View style={styles.circularContainer}>
              <CircularProgress
                size={86}
                strokeWidth={9}
                progress={monthSummary.savingsRate}
                color={Colors.primary}
                label={`${monthSummary.savingsRate}%`}
                sublabel="Disimpan"
              />
            </View>
            <Text style={styles.savingsAmountText}>
              Net: {formatIDR(monthSummary.netBalance)}
            </Text>
          </GlassCard>

          {/* Health Score Card */}
          <GlassCard style={styles.metricCardHalf}>
            <View style={styles.healthHeader}>
              <ShieldCheck size={18} color={health.badgeColor} />
              <Text style={[styles.healthBadge, { color: health.badgeColor }]}>
                {health.title}
              </Text>
            </View>
            <Text style={styles.healthDescription} numberOfLines={3}>
              {health.description}
            </Text>
            <View style={styles.healthScoreRow}>
              <Text style={styles.healthScoreLabel}>Skor Finansial:</Text>
              <Text style={[styles.healthScoreVal, { color: health.badgeColor }]}>
                {health.score}/100
              </Text>
            </View>
          </GlassCard>
        </View>

        {/* Monthly Budget Overview */}
        <GlassCard style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <View style={styles.budgetTitleRow}>
              <Target size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Anggaran Belanja</Text>
            </View>
            <TouchableOpacity onPress={() => setIsBudgetModalVisible(true)}>
              <Text style={styles.linkText}>
                {overallBudget ? 'Ubah Batas' : 'Atur Batas'}
              </Text>
            </TouchableOpacity>
          </View>

          {overallBudget ? (
            <View style={styles.budgetContent}>
              <View style={styles.budgetNumbers}>
                <Text style={styles.budgetSpent}>
                  Terpakai {formatIDR(overallBudget.status.spent)}
                </Text>
                <Text style={styles.budgetLimit}>
                  dari {formatIDR(overallBudget.budget.amount)}
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, overallBudget.status.percentage)}%`,
                      backgroundColor:
                        overallBudget.status.level === 'danger'
                          ? Colors.expense
                          : overallBudget.status.level === 'warning'
                          ? Colors.warning
                          : Colors.primary,
                    },
                  ]}
                />
              </View>

              <View style={styles.budgetFooter}>
                <Text
                  style={[
                    styles.budgetRemaining,
                    overallBudget.status.isOverspent && styles.overspentText,
                  ]}
                >
                  {overallBudget.status.isOverspent
                    ? `Melebihi Batas: ${formatIDR(
                        overallBudget.status.spent - overallBudget.budget.amount
                      )}`
                    : `Sisa Anggaran: ${formatIDR(overallBudget.status.remaining)}`}
                </Text>
                <Text style={styles.budgetPercent}>
                  {overallBudget.status.percentage}%
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyBudgetContainer}>
              <Text style={styles.emptyBudgetText}>
                Belum ada batas anggaran bulanan yang ditentukan.
              </Text>
              <TouchableOpacity
                onPress={() => setIsBudgetModalVisible(true)}
                style={styles.setBudgetBtn}
              >
                <Text style={styles.setBudgetBtnText}>Pasang Anggaran</Text>
              </TouchableOpacity>
            </View>
          )}
        </GlassCard>

        {/* Savings Goals Highlights */}
        {savingsGoals.length > 0 && (
          <GlassCard style={styles.savingsCard}>
            <View style={styles.budgetHeader}>
              <View style={styles.budgetTitleRow}>
                <TrendingUp size={18} color={Colors.primary} />
                <Text style={styles.cardTitle}>Target Impian</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/savings')}>
                <View style={styles.seeAllRow}>
                  <Text style={styles.linkText}>Lihat Semua</Text>
                  <ChevronRight size={14} color={Colors.primary} />
                </View>
              </TouchableOpacity>
            </View>

            {savingsGoals.slice(0, 2).map((item) => (
              <View key={item.goal.id} style={styles.goalMiniItem}>
                <View style={styles.goalMiniInfo}>
                  <Text style={styles.goalMiniName}>{item.goal.name}</Text>
                  <Text style={styles.goalMiniAmounts}>
                    {formatIDR(item.goal.current_amount)} /{' '}
                    {formatIDR(item.goal.target_amount)}
                  </Text>
                </View>
                <CircularProgress
                  size={46}
                  strokeWidth={5}
                  progress={item.metrics.percentage}
                  color={item.goal.color || Colors.primary}
                  label={`${item.metrics.percentage}%`}
                />
              </View>
            ))}
          </GlassCard>
        )}

        {/* Recent Transactions Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaksi Terbaru</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
            <View style={styles.seeAllRow}>
              <Text style={styles.linkText}>Semua</Text>
              <ChevronRight size={14} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <GlassCard style={styles.emptyStateCard}>
            <Text style={styles.emptyStateTitle}>Belum Ada Transaksi</Text>
            <Text style={styles.emptyStateDesc}>
              Mulai catat transaksi pertama Anda dengan menekan tombol Catat di atas.
            </Text>
          </GlassCard>
        ) : (
          recentTransactions.map((tx) => {
            const cat = categories.find((c) => c.id === tx.category_id);
            return (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                categoryIcon={cat?.icon || 'Folder'}
                categoryColor={cat?.color || Colors.primary}
                onPress={() => router.push('/(tabs)/transactions')}
              />
            );
          })
        )}
      </ScrollView>

      {/* Add Transaction Modal */}
      <TransactionModal
        visible={isAddTxModalVisible}
        onClose={() => setIsAddTxModalVisible(false)}
        categories={categories}
        onSave={async (tx) => {
          await addTransaction(tx);
        }}
      />

      {/* Budget Modal */}
      <BudgetModal
        visible={isBudgetModalVisible}
        onClose={() => setIsBudgetModalVisible(false)}
        categories={categories}
        initialAmount={overallBudget?.budget.amount || 0}
        onSave={async (catId, amount) => {
          if (catId) {
            await setCategoryBudget(catId, amount);
          } else {
            await setOverallBudget(amount);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 1.2,
  },
  monthSubtitle: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    gap: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#080D0B',
    fontWeight: '700',
    fontSize: 13,
  },
  heroCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  balanceIconBg: {
    backgroundColor: 'rgba(53, 208, 127, 0.15)',
    padding: 6,
    borderRadius: BorderRadius.full,
  },
  heroLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  heroBalance: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: Spacing.md,
  },
  flowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flowItem: {
    flex: 1,
  },
  flowBadgeIncome: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  flowTextIncome: {
    fontSize: 11,
    color: Colors.income,
    fontWeight: '600',
  },
  flowAmountIncome: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  flowBadgeExpense: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  flowTextExpense: {
    fontSize: 11,
    color: Colors.expense,
    fontWeight: '600',
  },
  flowAmountExpense: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  metricCardHalf: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderSmall: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  circularContainer: {
    marginVertical: 4,
  },
  savingsAmountText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 6,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  healthBadge: {
    fontSize: 13,
    fontWeight: '700',
  },
  healthDescription: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  healthScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  healthScoreLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  healthScoreVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  budgetCard: {
    marginBottom: Spacing.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  budgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  linkText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  budgetContent: {
    marginTop: 4,
  },
  budgetNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetSpent: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  budgetLimit: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetRemaining: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  overspentText: {
    color: Colors.expense,
    fontWeight: '700',
  },
  budgetPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyBudgetContainer: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  emptyBudgetText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  setBudgetBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(53, 208, 127, 0.15)',
  },
  setBudgetBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  savingsCard: {
    marginBottom: Spacing.md,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  goalMiniItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  goalMiniInfo: {
    flex: 1,
  },
  goalMiniName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  goalMiniAmounts: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyStateCard: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  emptyStateDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
