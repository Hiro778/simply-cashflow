import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { Category, Transaction } from '../database/schema';
import { CategoryIcon } from './CategoryIcon';
import { Button } from './Button';
import { formatIDR, parseIDR } from '../utils/currency';
import { getTodayString } from '../utils/dates';
import { X, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  initialTransaction?: Transaction | null;
  onSave: (tx: Omit<Transaction, 'created_at' | 'updated_at'>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  visible,
  onClose,
  categories,
  initialTransaction,
  onSave,
  onDelete,
}) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amountRaw, setAmountRaw] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [date, setDate] = useState<string>(getTodayString());
  const [description, setDescription] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmountRaw(initialTransaction.amount.toString());
      const cat = categories.find((c) => c.id === initialTransaction.category_id);
      setSelectedCategory(
        cat || {
          id: initialTransaction.category_id,
          name: initialTransaction.category_name,
          type: initialTransaction.type,
          icon: 'Folder',
          color: Colors.primary,
          is_default: 1,
          created_at: '',
        }
      );
      setDate(initialTransaction.date);
      setDescription(initialTransaction.description || '');
    } else {
      setType('expense');
      setAmountRaw('');
      const defaultCat = categories.find((c) => c.type === 'expense');
      setSelectedCategory(defaultCat || null);
      setDate(getTodayString());
      setDescription('');
    }
  }, [initialTransaction, visible, categories]);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleAmountChange = (text: string) => {
    const num = parseIDR(text);
    setAmountRaw(num === 0 ? '' : num.toString());
  };

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    const firstCat = categories.find((c) => c.type === newType);
    setSelectedCategory(firstCat || null);
  };

  const handleSubmit = async () => {
    const amount = parseIDR(amountRaw);
    if (amount <= 0) {
      Alert.alert('Perhatian', 'Masukkan jumlah transaksi yang valid');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Perhatian', 'Pilih salah satu kategori transaksi');
      return;
    }

    setIsSaving(true);
    try {
      const txData: Omit<Transaction, 'created_at' | 'updated_at'> = {
        id: initialTransaction?.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        amount,
        type,
        category_id: selectedCategory.id,
        category_name: selectedCategory.name,
        description: description.trim(),
        date: date || getTodayString(),
      };

      await onSave(txData);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan transaksi. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!initialTransaction || !onDelete) return;

    Alert.alert(
      'Hapus Transaksi',
      'Apakah Anda yakin ingin menghapus transaksi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete(initialTransaction.id);
              onClose();
            } catch (err) {
              Alert.alert('Error', 'Gagal menghapus transaksi');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {initialTransaction ? 'Ubah Transaksi' : 'Transaksi Baru'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Type Switcher */}
            <View style={styles.typeSwitcher}>
              <TouchableOpacity
                onPress={() => handleTypeChange('expense')}
                style={[
                  styles.typeTab,
                  type === 'expense' && styles.typeTabExpenseActive,
                ]}
              >
                <ArrowDownLeft
                  size={16}
                  color={type === 'expense' ? '#FFF' : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeTabText,
                    type === 'expense' && styles.typeTabTextActive,
                  ]}
                >
                  Pengeluaran
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleTypeChange('income')}
                style={[
                  styles.typeTab,
                  type === 'income' && styles.typeTabIncomeActive,
                ]}
              >
                <ArrowUpRight
                  size={16}
                  color={type === 'income' ? '#080D0B' : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeTabText,
                    type === 'income' && styles.typeTabIncomeTextActive,
                  ]}
                >
                  Pemasukan
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Jumlah (IDR)</Text>
              <View style={styles.amountInputRow}>
                <Text style={styles.currencyPrefix}>Rp</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amountRaw ? formatIDR(parseIDR(amountRaw), false) : ''}
                  onChangeText={handleAmountChange}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Category Selector */}
            <Text style={styles.sectionLabel}>Pilih Kategori</Text>
            <View style={styles.categoryGrid}>
              {filteredCategories.map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.categoryCard,
                      isSelected && {
                        borderColor: cat.color,
                        backgroundColor: `${cat.color}25`,
                      },
                    ]}
                  >
                    <CategoryIcon name={cat.icon} color={cat.color} size={22} />
                    <Text
                      style={[
                        styles.categoryName,
                        isSelected && { color: Colors.text, fontWeight: '700' },
                      ]}
                      numberOfLines={1}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Date Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tanggal (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Catatan (Opsional)</Text>
              <TextInput
                style={styles.textInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Contoh: Belanja bulanan di supermarket"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.footer}>
              <Button
                title={initialTransaction ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
                onPress={handleSubmit}
                loading={isSaving}
                style={styles.saveBtn}
              />

              {initialTransaction && onDelete && (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={styles.deleteBtn}
                >
                  <Trash2 size={18} color={Colors.expense} />
                  <Text style={styles.deleteText}>Hapus</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#101915',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  typeTabExpenseActive: {
    backgroundColor: Colors.expense,
  },
  typeTabIncomeActive: {
    backgroundColor: Colors.primary,
  },
  typeTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeTabTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  typeTabIncomeTextActive: {
    color: '#080D0B',
    fontWeight: '700',
  },
  amountContainer: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
  },
  amountLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    gap: 8,
  },
  categoryName: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.text,
    fontSize: 14,
  },
  footer: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    gap: 12,
  },
  saveBtn: {
    width: '100%',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  deleteText: {
    color: Colors.expense,
    fontSize: 14,
    fontWeight: '600',
  },
});
