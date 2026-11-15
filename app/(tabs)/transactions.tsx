import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../hooks/useAppStore';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { TransactionItem } from '../../components/TransactionItem';
import { TransactionModal } from '../../components/TransactionModal';
import { GlassCard } from '../../components/GlassCard';
import { Transaction } from '../../database/schema';
import {
  Search,
  Plus,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  X,
} from 'lucide-react-native';

export default function TransactionsScreen() {
  const {
    allTransactions,
    categories,
    refresh,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      // Type filter
      if (selectedType !== 'all' && tx.type !== selectedType) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && tx.category_id !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const descMatch = (tx.description || '').toLowerCase().includes(q);
        const catMatch = tx.category_name.toLowerCase().includes(q);
        if (!descMatch && !catMatch) return false;
      }
      return true;
    });
  }, [allTransactions, selectedType, selectedCategory, searchQuery]);

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsModalVisible(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Riwayat Transaksi</Text>
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
            <Plus size={18} color="#080D0B" strokeWidth={2.5} />
            <Text style={styles.addBtnText}>Catat Baru</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari transaksi atau catatan..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setSelectedType('all')}
            style={[
              styles.filterPill,
              selectedType === 'all' && styles.filterPillActive,
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedType === 'all' && styles.filterPillTextActive,
              ]}
            >
              Semua
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedType('income')}
            style={[
              styles.filterPill,
              selectedType === 'income' && styles.filterPillActiveIncome,
            ]}
          >
            <ArrowUpRight
              size={13}
              color={selectedType === 'income' ? '#080D0B' : Colors.income}
            />
            <Text
              style={[
                styles.filterPillText,
                selectedType === 'income' && styles.filterPillTextIncomeActive,
              ]}
            >
              Pemasukan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedType('expense')}
            style={[
              styles.filterPill,
              selectedType === 'expense' && styles.filterPillActiveExpense,
            ]}
          >
            <ArrowDownLeft
              size={13}
              color={selectedType === 'expense' ? '#FFF' : Colors.expense}
            />
            <Text
              style={[
                styles.filterPillText,
                selectedType === 'expense' && styles.filterPillTextActive,
              ]}
            >
              Pengeluaran
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transaction List */}
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const cat = categories.find((c) => c.id === item.category_id);
            return (
              <TransactionItem
                transaction={item}
                categoryIcon={cat?.icon || 'Folder'}
                categoryColor={cat?.color || Colors.primary}
                onPress={() => handleOpenEdit(item)}
              />
            );
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Tidak Ada Transaksi</Text>
              <Text style={styles.emptyDesc}>
                {searchQuery || selectedType !== 'all'
                  ? 'Tidak ada transaksi yang cocok dengan filter yang dipilih.'
                  : 'Belum ada transaksi yang dicatat. Tekan "Catat Baru" untuk memulai.'}
              </Text>
            </GlassCard>
          }
        />

        {/* Add/Edit Modal */}
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
          onDelete={async (id) => {
            await deleteTransaction(id);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  addBtnText: {
    color: '#080D0B',
    fontWeight: '700',
    fontSize: 13,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: Spacing.sm,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 4,
  },
  filterPillActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: '#FFF',
  },
  filterPillActiveIncome: {
    backgroundColor: Colors.income,
    borderColor: Colors.income,
  },
  filterPillActiveExpense: {
    backgroundColor: Colors.expense,
    borderColor: Colors.expense,
  },
  filterPillText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFF',
  },
  filterPillTextIncomeActive: {
    color: '#080D0B',
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
