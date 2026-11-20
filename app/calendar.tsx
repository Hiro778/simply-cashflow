import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../hooks/useAppStore';
import { FinancialCalendar } from '../components/FinancialCalendar';
import { SurfaceCard } from '../components/SurfaceCard';
import { TransactionItem } from '../components/TransactionItem';
import { formatIDR } from '../utils/currency';
import { formatReadableDate } from '../utils/dates';
import { Calendar, Plus } from 'lucide-react-native';
import { BorderRadius, Spacing } from '../constants/theme';
import { TransactionModal } from '../components/TransactionModal';

export default function CalendarScreen() {
  const { colors, isDark } = useTheme();
  const { allTransactions, categories, addTransaction, updateTransaction, deleteTransaction } = useAppStore();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  const dayTransactions = useMemo(() => {
    return allTransactions.filter((t) => t.date === selectedDate);
  }, [allTransactions, selectedDate]);

  const daySummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of dayTransactions) {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    }
    return { income, expense, net: income - expense };
  }, [dayTransactions]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Calendar Grid Component */}
      <FinancialCalendar
        transactions={allTransactions}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Selected Day Ledger Header */}
      <View style={styles.dayHeader}>
        <View>
          <Text style={[styles.dayTitle, { color: colors.text }]}>
            {formatReadableDate(selectedDate)}
          </Text>
          <Text style={[styles.daySubtitle, { color: colors.textSecondary }]}>
            {dayTransactions.length} transaksi pada tanggal ini
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setIsModalVisible(true)}
        >
          <Plus size={16} color={isDark ? '#080F0C' : '#FFFFFF'} />
          <Text style={[styles.addBtnText, { color: isDark ? '#080F0C' : '#FFFFFF' }]}>
            Catat
          </Text>
        </TouchableOpacity>
      </View>

      {/* Day Net Summary Bar */}
      {dayTransactions.length > 0 && (
        <SurfaceCard style={styles.summaryBar}>
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLbl, { color: colors.textMuted }]}>Pemasukan</Text>
            <Text style={[styles.summaryVal, { color: colors.income }]}>
              +{formatIDR(daySummary.income)}
            </Text>
          </View>
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLbl, { color: colors.textMuted }]}>Pengeluaran</Text>
            <Text style={[styles.summaryVal, { color: colors.expense }]}>
              -{formatIDR(daySummary.expense)}
            </Text>
          </View>
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLbl, { color: colors.textMuted }]}>Selisih Bersih</Text>
            <Text
              style={[
                styles.summaryVal,
                { color: daySummary.net >= 0 ? colors.income : colors.expense },
              ]}
            >
              {daySummary.net >= 0 ? '+' : ''}{formatIDR(daySummary.net)}
            </Text>
          </View>
        </SurfaceCard>
      )}

      {/* Transactions List */}
      {dayTransactions.length === 0 ? (
        <SurfaceCard style={styles.emptyCard}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Tidak ada transaksi tercatat pada {formatReadableDate(selectedDate)}.
          </Text>
        </SurfaceCard>
      ) : (
        dayTransactions.map((tx) => {
          const cat = categories.find((c) => c.id === tx.category_id);
          return (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              categoryIcon={cat?.icon}
              categoryColor={cat?.color}
            />
          );
        })
      )}

      <TransactionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        categories={categories}
        onSave={addTransaction}
      />
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
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  daySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
    paddingVertical: 10,
  },
  summaryCol: {
    alignItems: 'center',
  },
  summaryLbl: {
    fontSize: 11,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  emptyCard: {
    paddingVertical: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 13,
  },
});
