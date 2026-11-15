import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../hooks/useAppStore';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { GlassCard } from '../../components/GlassCard';
import { CircularProgress } from '../../components/CircularProgress';
import { CategoryIcon } from '../../components/CategoryIcon';
import { formatIDR, formatIDRCompact } from '../../utils/currency';
import { formatReadableMonth } from '../../utils/dates';
import {
  getCategoryExpenseBreakdown,
  getWeeklySpendingTrends,
  getMonthlyComparison,
  CategoryBreakdownItem,
  SpendingTrendItem,
  MonthlyComparison,
} from '../../services/analyticsService';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const { currentMonth, monthSummary } = useAppStore();
  const [categoriesBreakdown, setCategoriesBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [weeklyTrends, setWeeklyTrends] = useState<SpendingTrendItem[]>([]);
  const [comparison, setComparison] = useState<MonthlyComparison | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalytics = async () => {
    try {
      const breakdown = await getCategoryExpenseBreakdown(currentMonth);
      const trends = await getWeeklySpendingTrends(currentMonth);
      const comp = await getMonthlyComparison(currentMonth);
      setCategoriesBreakdown(breakdown);
      setWeeklyTrends(trends);
      setComparison(comp);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [currentMonth, monthSummary]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadAnalytics();
    setIsRefreshing(false);
  };

  const totalFlow = monthSummary.totalIncome + monthSummary.totalExpense;
  const incomePercent = totalFlow > 0 ? Math.round((monthSummary.totalIncome / totalFlow) * 100) : 0;
  const expensePercent = totalFlow > 0 ? Math.round((monthSummary.totalExpense / totalFlow) * 100) : 0;

  const maxWeeklyAmount = Math.max(1, ...weeklyTrends.map((t) => t.amount));

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
        <View style={styles.header}>
          <Text style={styles.title}>Analisis Keuangan</Text>
          <Text style={styles.subtitle}>{formatReadableMonth(currentMonth)}</Text>
        </View>

        {/* Circular Income vs Expense Ratio */}
        <GlassCard style={styles.card} highlight>
          <View style={styles.cardHeaderRow}>
            <PieIcon size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Arus Kas: Masuk vs Keluar</Text>
          </View>

          <View style={styles.flowComparisonRow}>
            <View style={styles.flowCircleContainer}>
              <CircularProgress
                size={110}
                strokeWidth={12}
                progress={incomePercent}
                color={Colors.income}
                trackColor="rgba(255, 114, 114, 0.3)"
                label={`${incomePercent}%`}
                sublabel="Pemasukan"
              />
            </View>

            <View style={styles.flowDetails}>
              <View style={styles.flowDetailItem}>
                <View style={styles.dotIncome} />
                <View>
                  <Text style={styles.flowDetailLabel}>Pemasukan ({incomePercent}%)</Text>
                  <Text style={styles.flowDetailAmountIncome}>
                    {formatIDR(monthSummary.totalIncome)}
                  </Text>
                </View>
              </View>

              <View style={styles.flowDetailItem}>
                <View style={styles.dotExpense} />
                <View>
                  <Text style={styles.flowDetailLabel}>Pengeluaran ({expensePercent}%)</Text>
                  <Text style={styles.flowDetailAmountExpense}>
                    {formatIDR(monthSummary.totalExpense)}
                  </Text>
                </View>
              </View>

              <View style={styles.flowDetailItem}>
                <View style={styles.dotNet} />
                <View>
                  <Text style={styles.flowDetailLabel}>Sisa Bersih</Text>
                  <Text style={styles.flowDetailAmountNet}>
                    {formatIDR(monthSummary.netBalance)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Weekly Spending Trends */}
        <GlassCard style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <BarChart3 size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Tren Pengeluaran Mingguan</Text>
          </View>

          <View style={styles.barsContainer}>
            {weeklyTrends.map((trend, idx) => {
              const heightPercent = Math.max(8, Math.round((trend.amount / maxWeeklyAmount) * 100));
              return (
                <View key={idx} style={styles.barColumn}>
                  <Text style={styles.barAmountText}>
                    {formatIDRCompact(trend.amount)}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPercent}%`,
                          backgroundColor:
                            trend.amount > 0 ? Colors.primary : 'rgba(255, 255, 255, 0.08)',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabelText}>{trend.label}</Text>
                </View>
              );
            })}
          </View>
        </GlassCard>

        {/* Category Expense Breakdown */}
        <GlassCard style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <PieIcon size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Distribusi Pengeluaran per Kategori</Text>
          </View>

          {categoriesBreakdown.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada pengeluaran di bulan ini.</Text>
          ) : (
            categoriesBreakdown.map((item) => (
              <View key={item.categoryId} style={styles.categoryRow}>
                <CategoryIcon
                  name={item.icon}
                  color={item.color}
                  size={18}
                />
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryNameRow}>
                    <Text style={styles.categoryName}>{item.categoryName}</Text>
                    <Text style={styles.categoryAmount}>
                      {formatIDR(item.amount)} ({item.percentage}%)
                    </Text>
                  </View>
                  <View style={styles.catProgressTrack}>
                    <View
                      style={[
                        styles.catProgressFill,
                        {
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
        </GlassCard>

        {/* Monthly Comparison */}
        {comparison && (
          <GlassCard style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <TrendingUp size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Perbandingan dengan Bulan Lalu</Text>
            </View>

            <View style={styles.compGrid}>
              <View style={styles.compBox}>
                <Text style={styles.compLabel}>Pertumbuhan Pemasukan</Text>
                <Text
                  style={[
                    styles.compValue,
                    {
                      color:
                        comparison.incomeGrowth >= 0
                          ? Colors.income
                          : Colors.expense,
                    },
                  ]}
                >
                  {comparison.incomeGrowth >= 0 ? '+' : ''}
                  {comparison.incomeGrowth}%
                </Text>
                <Text style={styles.compSub}>
                  Lalu: {formatIDRCompact(comparison.previousIncome)}
                </Text>
              </View>

              <View style={styles.compBox}>
                <Text style={styles.compLabel}>Perubahan Pengeluaran</Text>
                <Text
                  style={[
                    styles.compValue,
                    {
                      color:
                        comparison.expenseGrowth <= 0
                          ? Colors.income
                          : Colors.expense,
                    },
                  ]}
                >
                  {comparison.expenseGrowth >= 0 ? '+' : ''}
                  {comparison.expenseGrowth}%
                </Text>
                <Text style={styles.compSub}>
                  Lalu: {formatIDRCompact(comparison.previousExpense)}
                </Text>
              </View>
            </View>
          </GlassCard>
        )}
      </ScrollView>
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
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  flowComparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.xs,
  },
  flowCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowDetails: {
    gap: 12,
  },
  flowDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotIncome: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.income,
  },
  dotExpense: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.expense,
  },
  dotNet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.textSecondary,
  },
  flowDetailLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  flowDetailAmountIncome: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.income,
    fontVariant: ['tabular-nums'],
  },
  flowDetailAmountExpense: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.expense,
    fontVariant: ['tabular-nums'],
  },
  flowDetailAmountNet: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barAmountText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  barTrack: {
    width: 26,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 13,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 13,
  },
  barLabelText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 8,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    gap: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  catProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  catProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
  compGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  compBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  compLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  compValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  compSub: {
    fontSize: 10,
    color: Colors.textMuted,
  },
});
