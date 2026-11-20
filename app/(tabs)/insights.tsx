import React, { useState, useEffect } from 'react';
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
import { CategoryIcon } from '../../components/CategoryIcon';
import { formatIDR } from '../../utils/currency';
import { formatReadableMonth } from '../../utils/dates';
import { assessFinancialHealth } from '../../utils/calculations';
import {
  getCategoryExpenseBreakdown,
  getWeeklySpendingTrends,
  getMonthlyComparison,
  CategoryBreakdownItem,
  SpendingTrendItem,
  MonthlyComparison,
} from '../../services/analyticsService';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  Activity,
  Award,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BorderRadius, Spacing } from '../../constants/theme';

export default function InsightsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { currentMonth, monthSummary, refresh } = useAppStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [breakdown, setBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [weeklyTrends, setWeeklyTrends] = useState<SpendingTrendItem[]>([]);
  const [comparison, setComparison] = useState<MonthlyComparison | null>(null);

  const loadData = async () => {
    const b = await getCategoryExpenseBreakdown(currentMonth);
    const w = await getWeeklySpendingTrends(currentMonth);
    const c = await getMonthlyComparison(currentMonth);
    setBreakdown(b);
    setWeeklyTrends(w);
    setComparison(c);
  };

  useEffect(() => {
    loadData();
  }, [currentMonth, monthSummary]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    await loadData();
    setIsRefreshing(false);
  };

  const health = assessFinancialHealth(monthSummary.totalIncome, monthSummary.totalExpense);

  const maxWeeklyAmount = Math.max(1, ...weeklyTrends.map((w) => w.amount));

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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Wawasan Keuangan</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {formatReadableMonth(currentMonth)}
            </Text>
          </View>

          {/* Monthly Recap Button */}
          <TouchableOpacity
            style={[styles.recapBtn, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}
            onPress={() => router.push('/recap')}
          >
            <FileText size={16} color={colors.primary} />
            <Text style={[styles.recapBtnText, { color: colors.primary }]}>Rekap</Text>
          </TouchableOpacity>
        </View>

        {/* Financial Health Score Card */}
        <SurfaceCard style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerTitleRow}>
              <Award size={20} color={health.badgeColor} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Kesehatan Keuangan
              </Text>
            </View>
            <View style={[styles.healthBadge, { backgroundColor: isDark ? 'rgba(57, 217, 138, 0.15)' : colors.primarySoft, borderColor: health.badgeColor }]}>
              <Text style={[styles.healthBadgeText, { color: health.badgeColor }]}>
                Skor {health.score}/100
              </Text>
            </View>
          </View>

          <Text style={[styles.healthTitle, { color: health.badgeColor }]}>
            {health.title}
          </Text>
          <Text style={[styles.healthDesc, { color: colors.textSecondary }]}>
            {health.description}
          </Text>

          {/* Cashflow Ratio Indicator */}
          <View style={styles.ratioSection}>
            <View style={[styles.ratioTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
              <View
                style={[
                  styles.ratioFill,
                  {
                    backgroundColor: colors.income,
                    width: `${monthSummary.savingsRate}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.ratioLabels}>
              <Text style={[styles.ratioText, { color: colors.textMuted }]}>
                Rasio Tabungan: <Text style={{ color: colors.income, fontWeight: '700' }}>{monthSummary.savingsRate}%</Text>
              </Text>
              <Text style={[styles.ratioText, { color: colors.textMuted }]}>
                Terpakai: <Text style={{ color: colors.expense, fontWeight: '700' }}>{100 - monthSummary.savingsRate}%</Text>
              </Text>
            </View>
          </View>
        </SurfaceCard>

        {/* Net Cashflow Summary */}
        <SurfaceCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 12 }]}>
            Arus Kas Bersih (Net Cashflow)
          </Text>

          <View style={styles.cashflowGrid}>
            <View style={styles.cashflowBox}>
              <View style={[styles.iconCircle, { backgroundColor: colors.incomeBackground }]}>
                <ArrowUpRight size={18} color={colors.income} />
              </View>
              <Text style={[styles.boxLabel, { color: colors.textMuted }]}>Total Pemasukan</Text>
              <Text style={[styles.boxAmount, { color: colors.income }]}>
                {formatIDR(monthSummary.totalIncome)}
              </Text>
            </View>

            <View style={styles.cashflowBox}>
              <View style={[styles.iconCircle, { backgroundColor: colors.expenseBackground }]}>
                <ArrowDownLeft size={18} color={colors.expense} />
              </View>
              <Text style={[styles.boxLabel, { color: colors.textMuted }]}>Total Pengeluaran</Text>
              <Text style={[styles.boxAmount, { color: colors.expense }]}>
                {formatIDR(monthSummary.totalExpense)}
              </Text>
            </View>
          </View>

          <View style={[styles.netRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.netLabel, { color: colors.textSecondary }]}>Selisih Bersih</Text>
            <Text
              style={[
                styles.netValue,
                { color: monthSummary.netBalance >= 0 ? colors.income : colors.expense },
              ]}
            >
              {monthSummary.netBalance >= 0 ? '+' : ''}
              {formatIDR(monthSummary.netBalance)}
            </Text>
          </View>
        </SurfaceCard>

        {/* Weekly Spending Trend */}
        <SurfaceCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 12 }]}>
            Tren Belanja Mingguan
          </Text>

          <View style={styles.barChartContainer}>
            {weeklyTrends.map((w, idx) => {
              const heightPercent = maxWeeklyAmount > 0 ? (w.amount / maxWeeklyAmount) * 100 : 0;
              return (
                <View key={w.label} style={styles.barCol}>
                  <Text style={[styles.barAmount, { color: colors.textMuted }]}>
                    {w.amount > 0 ? formatIDR(w.amount, false).split('.')[0] + 'rb' : '-'}
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${Math.max(6, Math.min(100, heightPercent))}%`,
                          backgroundColor: idx === weeklyTrends.length - 1 ? colors.primary : colors.primarySoft,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                    {w.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </SurfaceCard>

        {/* Expense Category Breakdown */}
        <SurfaceCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 14 }]}>
            Distribusi Kategori Pengeluaran
          </Text>

          {breakdown.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Belum ada data pengeluaran bulan ini.
            </Text>
          ) : (
            breakdown.map((item) => (
              <View key={item.categoryId} style={styles.categoryItem}>
                <View style={styles.catLeft}>
                  <CategoryIcon name={item.icon} color={item.color} size={18} />
                  <View style={styles.catNameWrap}>
                    <Text style={[styles.catName, { color: colors.text }]}>
                      {item.categoryName}
                    </Text>
                    <View style={[styles.catBarTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
                      <View
                        style={[
                          styles.catBarFill,
                          {
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.catRight}>
                  <Text style={[styles.catAmount, { color: colors.text }]}>
                    {formatIDR(item.amount)}
                  </Text>
                  <Text style={[styles.catPercent, { color: colors.textMuted }]}>
                    {item.percentage}%
                  </Text>
                </View>
              </View>
            ))
          )}
        </SurfaceCard>

        {/* Month over Month Comparison */}
        {comparison && (
          <SurfaceCard style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 12 }]}>
              Perbandingan dengan Bulan Lalu
            </Text>

            <View style={styles.compRow}>
              <View>
                <Text style={[styles.compLabel, { color: colors.textMuted }]}>Pengeluaran</Text>
                <Text style={[styles.compValue, { color: colors.text }]}>
                  {formatIDR(comparison.currentExpense)} vs {formatIDR(comparison.previousExpense)}
                </Text>
              </View>
              <View
                style={[
                  styles.growthBadge,
                  {
                    backgroundColor:
                      comparison.expenseGrowth <= 0
                        ? isDark ? 'rgba(57, 217, 138, 0.15)' : colors.primarySoft
                        : colors.expenseBackground,
                  },
                ]}
              >
                {comparison.expenseGrowth <= 0 ? (
                  <TrendingDown size={14} color={colors.primary} />
                ) : (
                  <TrendingUp size={14} color={colors.expense} />
                )}
                <Text
                  style={[
                    styles.growthText,
                    {
                      color:
                        comparison.expenseGrowth <= 0
                          ? colors.primary
                          : colors.expense,
                    },
                  ]}
                >
                  {comparison.expenseGrowth > 0 ? '+' : ''}
                  {comparison.expenseGrowth}%
                </Text>
              </View>
            </View>
          </SurfaceCard>
        )}
      </ScrollView>
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
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  recapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  recapBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    marginVertical: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  healthBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  healthBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  healthDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  ratioSection: {
    marginTop: 14,
  },
  ratioTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratioFill: {
    height: '100%',
    borderRadius: 4,
  },
  ratioLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  ratioText: {
    fontSize: 11,
  },
  cashflowGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  cashflowBox: {
    flex: 1,
    paddingVertical: 6,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  boxLabel: {
    fontSize: 11,
  },
  boxAmount: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  netLabel: {
    fontSize: 13,
  },
  netValue: {
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 16,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barAmount: {
    fontSize: 9,
    marginBottom: 4,
  },
  barTrack: {
    width: 22,
    height: 80,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  catNameWrap: {
    marginLeft: 10,
    flex: 1,
  },
  catName: {
    fontSize: 13,
    fontWeight: '600',
  },
  catBarTrack: {
    height: 4,
    borderRadius: 2,
    marginTop: 5,
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  catRight: {
    alignItems: 'flex-end',
  },
  catAmount: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  catPercent: {
    fontSize: 11,
    marginTop: 1,
  },
  compRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compLabel: {
    fontSize: 12,
  },
  compValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
