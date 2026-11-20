import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../hooks/useAppStore';
import { SurfaceCard } from '../components/SurfaceCard';
import { CategoryIcon } from '../components/CategoryIcon';
import {
  generateMonthlyRecap,
  MonthlyRecapReport,
} from '../services/analyticsService';
import { exportCSVReport } from '../services/backupService';
import { formatIDR } from '../utils/currency';
import { formatReadableMonth, formatReadableDate } from '../utils/dates';
import {
  FileText,
  Download,
  Share2,
  Award,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  Target,
  Sparkles,
} from 'lucide-react-native';
import { BorderRadius, Spacing } from '../constants/theme';

export default function RecapScreen() {
  const { colors, isDark } = useTheme();
  const { currentMonth } = useAppStore();

  const [recap, setRecap] = useState<MonthlyRecapReport | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    generateMonthlyRecap(currentMonth).then(setRecap);
  }, [currentMonth]);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await exportCSVReport();
    } catch (e) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat membagikan laporan CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!recap) return null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Title Card */}
      <SurfaceCard style={styles.heroCard} highlight>
        <View style={styles.heroHeader}>
          <FileText size={22} color={colors.primary} />
          <Text style={[styles.heroBadge, { color: colors.primary }]}>
            Laporan Keuangan Bulanan
          </Text>
        </View>
        <Text style={[styles.heroMonth, { color: colors.text }]}>
          {formatReadableMonth(recap.month)}
        </Text>
        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
          Ringkasan arus kas bersih, tingkat tabungan, dan kinerja pos pengeluaran Anda.
        </Text>
      </SurfaceCard>

      {/* Primary Financial Overview Grid */}
      <SurfaceCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>
          Arus Kas & Rasio Tabungan
        </Text>

        <View style={styles.overviewRow}>
          <View style={styles.overviewCol}>
            <Text style={[styles.overviewLabel, { color: colors.textMuted }]}>Pemasukan</Text>
            <Text style={[styles.overviewVal, { color: colors.income }]}>
              {formatIDR(recap.totalIncome)}
            </Text>
          </View>
          <View style={styles.overviewCol}>
            <Text style={[styles.overviewLabel, { color: colors.textMuted }]}>Pengeluaran</Text>
            <Text style={[styles.overviewVal, { color: colors.expense }]}>
              {formatIDR(recap.totalExpense)}
            </Text>
          </View>
        </View>

        <View style={[styles.netCashflowRow, { borderTopColor: colors.border }]}>
          <View>
            <Text style={[styles.netTitle, { color: colors.textSecondary }]}>Net Cashflow</Text>
            <Text
              style={[
                styles.netNumber,
                { color: recap.netCashflow >= 0 ? colors.income : colors.expense },
              ]}
            >
              {recap.netCashflow >= 0 ? '+' : ''}{formatIDR(recap.netCashflow)}
            </Text>
          </View>

          <View style={styles.savingsRateBadge}>
            <Text style={[styles.savingsRateNum, { color: colors.primary }]}>
              {recap.savingsRate}%
            </Text>
            <Text style={[styles.savingsRateLbl, { color: colors.textMuted }]}>
              Disimpan
            </Text>
          </View>
        </View>
      </SurfaceCard>

      {/* Highlights: Largest Expense & Top Category */}
      <SurfaceCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>
          Sorotan Pos Belanja
        </Text>

        {recap.largestExpense && (
          <View style={[styles.highlightRow, { borderBottomColor: colors.border }]}>
            <View style={styles.highlightLeft}>
              <Text style={[styles.highlightType, { color: colors.textMuted }]}>
                Pengeluaran Terbesar
              </Text>
              <Text style={[styles.highlightTitle, { color: colors.text }]}>
                {recap.largestExpense.merchant || recap.largestExpense.category_name}
              </Text>
              {recap.largestExpense.description ? (
                <Text style={[styles.highlightDesc, { color: colors.textSecondary }]}>
                  "{recap.largestExpense.description}" • {formatReadableDate(recap.largestExpense.date)}
                </Text>
              ) : null}
            </View>
            <Text style={[styles.highlightAmount, { color: colors.expense }]}>
              -{formatIDR(recap.largestExpense.amount)}
            </Text>
          </View>
        )}

        {recap.topCategory && (
          <View style={styles.highlightRow}>
            <View style={styles.highlightLeft}>
              <Text style={[styles.highlightType, { color: colors.textMuted }]}>
                Kategori Belanja Dominan
              </Text>
              <Text style={[styles.highlightTitle, { color: colors.text }]}>
                {recap.topCategory.categoryName}
              </Text>
              <Text style={[styles.highlightDesc, { color: colors.textSecondary }]}>
                Menyerap {recap.topCategory.percentage}% dari seluruh pengeluaran bulan ini
              </Text>
            </View>
            <Text style={[styles.highlightAmount, { color: colors.text }]}>
              {formatIDR(recap.topCategory.amount)}
            </Text>
          </View>
        )}
      </SurfaceCard>

      {/* Category Distribution */}
      <SurfaceCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 10 }]}>
          Rincian Distribusi Kategori
        </Text>

        {recap.categoryBreakdown.map((item) => (
          <View key={item.categoryId} style={styles.catItemRow}>
            <View style={styles.catItemLeft}>
              <CategoryIcon name={item.icon} color={item.color} size={16} />
              <Text style={[styles.catItemName, { color: colors.text }]}>
                {item.categoryName}
              </Text>
            </View>
            <View style={styles.catItemRight}>
              <Text style={[styles.catItemAmount, { color: colors.text }]}>
                {formatIDR(item.amount)}
              </Text>
              <Text style={[styles.catItemPercent, { color: colors.textMuted }]}>
                {item.percentage}%
              </Text>
            </View>
          </View>
        ))}
      </SurfaceCard>

      {/* Share / Export CSV Action */}
      <TouchableOpacity
        style={[styles.exportActionBtn, { backgroundColor: colors.primary }]}
        onPress={handleExportCSV}
        disabled={isExporting}
      >
        <Download size={18} color={isDark ? '#080F0C' : '#FFFFFF'} />
        <Text
          style={[
            styles.exportActionText,
            { color: isDark ? '#080F0C' : '#FFFFFF' },
          ]}
        >
          {isExporting ? 'Mengekspor...' : 'Ekspor Laporan Transaksi (CSV)'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    marginVertical: 6,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  heroBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroMonth: {
    fontSize: 24,
    fontWeight: '800',
  },
  heroSubtitle: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  card: {
    marginVertical: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  overviewCol: {
    flex: 1,
  },
  overviewLabel: {
    fontSize: 11,
  },
  overviewVal: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  netCashflowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  netTitle: {
    fontSize: 12,
  },
  netNumber: {
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  savingsRateBadge: {
    alignItems: 'center',
  },
  savingsRateNum: {
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  savingsRateLbl: {
    fontSize: 10,
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  highlightLeft: {
    flex: 1,
    marginRight: 10,
  },
  highlightType: {
    fontSize: 11,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  highlightDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  highlightAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  catItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  catItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catItemName: {
    fontSize: 13,
    fontWeight: '500',
  },
  catItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catItemAmount: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  catItemPercent: {
    fontSize: 11,
    width: 32,
    textAlign: 'right',
  },
  exportActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    marginTop: 14,
  },
  exportActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
