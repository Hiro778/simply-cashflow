import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../hooks/useAppStore';
import { SurfaceCard } from '../components/SurfaceCard';
import { Button } from '../components/Button';
import { RecurringModal } from '../components/RecurringModal';
import { CategoryIcon } from '../components/CategoryIcon';
import { RecurringTransaction } from '../database/schema';
import { formatIDR } from '../utils/currency';
import { formatReadableDate } from '../utils/dates';
import {
  Repeat,
  Plus,
  Calendar,
  CheckCircle2,
  SkipForward,
  MoreVertical,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react-native';
import { BorderRadius, Spacing } from '../constants/theme';

export default function RecurringScreen() {
  const { colors, isDark } = useTheme();
  const {
    recurringTransactions,
    categories,
    refresh,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    confirmRecurring,
    skipRecurring,
  } = useAppStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const handleConfirm = async (id: string, title: string) => {
    Alert.alert(
      'Konfirmasi Bayar',
      `Catat "${title}" ke transaksi pembukuan hari ini dan majukan jadwal ke periode berikutnya?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Konfirmasi Bayar',
          onPress: async () => {
            await confirmRecurring(id);
          },
        },
      ]
    );
  };

  const handleSkip = async (id: string) => {
    Alert.alert(
      'Lewati Jadwal',
      'Lewati pembayaran periode ini tanpa membuat catatan pengeluaran?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Lewati',
          onPress: async () => {
            await skipRecurring(id);
          },
        },
      ]
    );
  };

  const expenseTotal = recurringTransactions
    .filter((r) => r.is_active === 1 && r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const incomeTotal = recurringTransactions
    .filter((r) => r.is_active === 1 && r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Summary Banner */}
      <SurfaceCard style={styles.card} highlight>
        <Text style={[styles.summaryTitle, { color: colors.textSecondary }]}>
          Estimasi Komitmen Rutin Bulanan
        </Text>
        <Text style={[styles.summaryAmount, { color: colors.expense }]}>
          -{formatIDR(expenseTotal, true)}
        </Text>
        {incomeTotal > 0 && (
          <Text style={[styles.summaryIncome, { color: colors.income }]}>
            + Pemasukan Rutin: {formatIDR(incomeTotal, true)}
          </Text>
        )}
      </SurfaceCard>

      {/* Header and Add Button */}
      <View style={styles.listHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Daftar Jadwal Transaksi ({recurringTransactions.length})
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            setEditingItem(null);
            setIsModalVisible(true);
          }}
        >
          <Plus size={16} color={isDark ? '#080F0C' : '#FFFFFF'} strokeWidth={2.5} />
          <Text style={[styles.addBtnText, { color: isDark ? '#080F0C' : '#FFFFFF' }]}>
            Tambah Jadwal
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recurring Items */}
      {recurringTransactions.length === 0 ? (
        <SurfaceCard style={styles.emptyCard}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Belum Ada Transaksi Rutin
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Tambahkan tagihan bulanan seperti internet, listrik, kosan, atau gaji agar diperhitungkan di Safe to Spend.
          </Text>
        </SurfaceCard>
      ) : (
        recurringTransactions.map((item) => {
          const cat = categories.find((c) => c.id === item.category_id);
          const isIncome = item.type === 'income';

          return (
            <SurfaceCard key={item.id} style={styles.itemCard}>
              <View style={styles.itemTop}>
                <View style={styles.itemLeft}>
                  <CategoryIcon
                    name={cat?.icon || 'Repeat'}
                    color={cat?.color || colors.primary}
                    size={20}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
                      {item.frequency.toUpperCase()} • Jatuh tempo: {formatReadableDate(item.next_due_date)}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemRight}>
                  <Text
                    style={[
                      styles.itemAmount,
                      { color: isIncome ? colors.income : colors.expense },
                    ]}
                  >
                    {isIncome ? '+' : '-'}{formatIDR(item.amount)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingItem(item);
                      setIsModalVisible(true);
                    }}
                    style={styles.moreBtn}
                  >
                    <MoreVertical size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Action Buttons: Confirm Pay or Skip */}
              <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  style={[styles.skipBtn, { borderColor: colors.border }]}
                  onPress={() => handleSkip(item.id)}
                >
                  <SkipForward size={14} color={colors.textSecondary} />
                  <Text style={[styles.skipText, { color: colors.textSecondary }]}>
                    Lewati
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: colors.primarySoft }]}
                  onPress={() => handleConfirm(item.id, item.title)}
                >
                  <CheckCircle2 size={15} color={colors.primary} />
                  <Text style={[styles.confirmText, { color: colors.primary }]}>
                    Konfirmasi Bayar
                  </Text>
                </TouchableOpacity>
              </View>
            </SurfaceCard>
          );
        })
      )}

      {/* Modal */}
      <RecurringModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        categories={categories}
        initialItem={editingItem}
        onSave={async (item) => {
          if (editingItem) {
            await updateRecurring({ ...item, id: editingItem.id });
          } else {
            await addRecurring(item);
          }
        }}
        onDelete={async (id) => {
          await deleteRecurring(id);
        }}
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
  card: {
    marginVertical: 6,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 26,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  summaryIncome: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
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
  itemCard: {
    marginVertical: 6,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemInfo: {
    marginLeft: 10,
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  moreBtn: {
    padding: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  skipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  confirmText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    paddingVertical: 32,
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 12,
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
