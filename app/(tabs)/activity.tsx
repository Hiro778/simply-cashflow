import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../hooks/useAppStore';
import { useTheme } from '../../hooks/useTheme';
import { Transaction, TransactionSource } from '../../database/schema';
import { TransactionItem } from '../../components/TransactionItem';
import { TransactionModal } from '../../components/TransactionModal';
import { FinancialCalendar } from '../../components/FinancialCalendar';
import { SurfaceCard } from '../../components/SurfaceCard';
import { formatIDR } from '../../utils/currency';
import {
  Search,
  Plus,
  Calendar,
  List,
  Filter,
  ArrowUpDown,
  X,
} from 'lucide-react-native';
import { BorderRadius, Spacing } from '../../constants/theme';

const SOURCES: (TransactionSource | 'all')[] = [
  'all',
  'manual',
  'DANA',
  'GoPay',
  'OVO',
  'ShopeePay',
  'BCA',
  'BRI',
  'Mandiri',
  'QRIS',
];

export default function ActivityScreen() {
  const { colors, isDark } = useTheme();
  const {
    allTransactions,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<TransactionSource | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    let result = [...allTransactions];

    if (viewMode === 'calendar') {
      result = result.filter((t) => t.date === calendarSelectedDate);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.category_name.toLowerCase().includes(q) ||
          (t.merchant && t.merchant.toLowerCase().includes(q)) ||
          (t.reference_id && t.reference_id.toLowerCase().includes(q))
      );
    }

    if (selectedType !== 'all') {
      result = result.filter((t) => t.type === selectedType);
    }

    if (selectedCategoryId !== 'all') {
      result = result.filter((t) => t.category_id === selectedCategoryId);
    }

    if (selectedSource !== 'all') {
      result = result.filter((t) => (t.source || 'manual') === selectedSource);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return a.date.localeCompare(b.date);
        case 'amount_desc':
          return b.amount - a.amount;
        case 'amount_asc':
          return a.amount - b.amount;
        case 'date_desc':
        default:
          return b.date.localeCompare(a.date);
      }
    });

    return result;
  }, [
    allTransactions,
    searchQuery,
    selectedType,
    selectedCategoryId,
    selectedSource,
    sortBy,
    viewMode,
    calendarSelectedDate,
  ]);

  // Totals for filtered transactions
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of filteredTransactions) {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    }
    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Aktivitas Keuangan</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {filteredTransactions.length} transaksi tercatat
          </Text>
        </View>

        <View style={styles.headerActions}>
          {/* Calendar / List View Mode Toggle */}
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
          >
            {viewMode === 'list' ? (
              <Calendar size={18} color={colors.primary} />
            ) : (
              <List size={18} color={colors.primary} />
            )}
          </TouchableOpacity>

          {/* Add Transaction Button */}
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              setEditingTransaction(null);
              setIsModalVisible(true);
            }}
          >
            <Plus size={18} color={isDark ? '#080F0C' : '#FFFFFF'} strokeWidth={2.5} />
            <Text style={[styles.addBtnText, { color: isDark ? '#080F0C' : '#FFFFFF' }]}>
              Catat
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar View (if active) */}
      {viewMode === 'calendar' && (
        <FinancialCalendar
          transactions={allTransactions}
          selectedDate={calendarSelectedDate}
          onSelectDate={setCalendarSelectedDate}
        />
      )}

      {/* Search Input */}
      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Cari transaksi, merchant, catatan..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={16} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Row 1: Type Tabs */}
      <View style={styles.typeTabsRow}>
        {(['all', 'expense', 'income'] as const).map((t) => {
          const isSelected = selectedType === t;
          const label = t === 'all' ? 'Semua' : t === 'expense' ? 'Pengeluaran' : 'Pemasukan';
          return (
            <TouchableOpacity
              key={t}
              style={[
                styles.typePill,
                {
                  backgroundColor: isSelected
                    ? isDark ? 'rgba(57, 217, 138, 0.2)' : colors.primarySoft
                    : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedType(t)}
            >
              <Text
                style={[
                  styles.typePillText,
                  {
                    color: isSelected ? colors.primary : colors.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Filter Row 2: Source Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsRow}
      >
        {SOURCES.map((s) => {
          const isSelected = selectedSource === s;
          const label = s === 'all' ? 'Semua Sumber' : s;
          return (
            <TouchableOpacity
              key={s}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected
                    ? isDark ? 'rgba(57, 217, 138, 0.2)' : colors.primarySoft
                    : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedSource(s)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: isSelected ? colors.primary : colors.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Filter Summary Bar */}
      <View style={[styles.summaryBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
            Masuk ({formatIDR(summary.income)})
          </Text>
        </View>
        <View>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
            Keluar ({formatIDR(summary.expense)})
          </Text>
        </View>
        <View>
          <Text
            style={[
              styles.summaryNet,
              { color: summary.net >= 0 ? colors.income : colors.expense },
            ]}
          >
            Net: {formatIDR(summary.net)}
          </Text>
        </View>
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <SurfaceCard style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Tidak Ada Transaksi Ditemukan
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Ubah kriteria pencarian atau filter Anda untuk melihat transaksi lain.
            </Text>
          </SurfaceCard>
        }
        renderItem={({ item }) => {
          const cat = categories.find((c) => c.id === item.category_id);
          return (
            <TransactionItem
              transaction={item}
              categoryIcon={cat?.icon}
              categoryColor={cat?.color}
              onPress={() => handleEdit(item)}
            />
          );
        }}
      />

      {/* Transaction Modal */}
      <TransactionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        categories={categories}
        initialTransaction={editingTransaction}
        onSave={async (tx) => {
          if (editingTransaction) {
            await updateTransaction(tx);
          } else {
            await addTransaction(tx);
          }
        }}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: BorderRadius.md,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  typeTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  typePill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  typePillText: {
    fontSize: 12,
  },
  filterChipsRow: {
    gap: 6,
    paddingBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 11,
  },
  summaryNet: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  listContent: {
    paddingBottom: 28,
  },
  emptyContainer: {
    paddingVertical: 32,
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
