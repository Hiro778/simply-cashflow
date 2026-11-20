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
import { useTheme } from '../hooks/useTheme';
import { BorderRadius, Spacing } from '../constants/theme';
import {
  Category,
  Transaction,
  TransactionSource,
  PaymentMethod,
} from '../database/schema';
import { CategoryIcon } from './CategoryIcon';
import { Button } from './Button';
import { formatIDR, parseIDR } from '../utils/currency';
import { getTodayString } from '../utils/dates';
import { X, Trash2, ArrowUpRight, ArrowDownLeft, Calendar, Clock, Store } from 'lucide-react-native';

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  initialTransaction?: Transaction | null;
  onSave: (tx: Omit<Transaction, 'created_at' | 'updated_at'>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const SOURCES: TransactionSource[] = [
  'manual',
  'DANA',
  'GoPay',
  'OVO',
  'ShopeePay',
  'BCA',
  'BRI',
  'Mandiri',
  'QRIS',
  'other',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  visible,
  onClose,
  categories,
  initialTransaction,
  onSave,
  onDelete,
}) => {
  const { colors, isDark } = useTheme();

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amountRaw, setAmountRaw] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [merchant, setMerchant] = useState<string>('');
  const [source, setSource] = useState<TransactionSource>('manual');
  const [date, setDate] = useState<string>(getTodayString());
  const [time, setTime] = useState<string>('');
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
          color: colors.primary,
          is_default: 1,
          created_at: '',
        }
      );
      setMerchant(initialTransaction.merchant || '');
      setSource(initialTransaction.source || 'manual');
      setDate(initialTransaction.date);
      setTime(initialTransaction.time || '');
      setDescription(initialTransaction.description || '');
    } else {
      setType('expense');
      setAmountRaw('');
      const defaultCat = categories.find((c) => c.type === 'expense');
      setSelectedCategory(defaultCat || null);
      setMerchant('');
      setSource('manual');
      setDate(getTodayString());
      setTime(new Date().toTimeString().substring(0, 5));
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
      Alert.alert('Perhatian', 'Masukkan jumlah transaksi yang valid.');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Perhatian', 'Pilih salah satu kategori transaksi.');
      return;
    }

    setIsSaving(true);
    try {
      const id =
        initialTransaction?.id ||
        `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      await onSave({
        id,
        amount,
        type,
        category_id: selectedCategory.id,
        category_name: selectedCategory.name,
        merchant: merchant.trim() || undefined,
        source,
        payment_method: source === 'manual' ? 'cash' : 'e-wallet',
        description: description.trim(),
        date,
        time: time || undefined,
      });

      onClose();
    } catch (error) {
      Alert.alert('Kesalahan', 'Gagal menyimpan transaksi. Coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!initialTransaction || !onDelete) return;

    Alert.alert('Hapus Transaksi', 'Apakah Anda yakin ingin menghapus catatan ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await onDelete(initialTransaction.id);
            onClose();
          } catch (e) {
            Alert.alert('Gagal', 'Tidak dapat menghapus transaksi.');
          }
        },
      },
    ]);
  };

  const formattedPreview = parseIDR(amountRaw) > 0 ? formatIDR(parseIDR(amountRaw)) : 'Rp 0';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheetContainer,
            { backgroundColor: colors.surface, borderTopColor: colors.border },
          ]}
        >
          {/* Grabber handle */}
          <View style={styles.handleContainer}>
            <View
              style={[
                styles.handle,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' },
              ]}
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {initialTransaction ? 'Ubah Transaksi' : 'Catat Transaksi'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Type Switcher */}
            <View style={[styles.typeSwitcher, { backgroundColor: isDark ? '#182820' : colors.primarySoft }]}>
              <TouchableOpacity
                style={[
                  styles.typeTab,
                  type === 'expense' && [styles.typeTabActive, { backgroundColor: colors.expenseBackground, borderColor: colors.expense }],
                ]}
                onPress={() => handleTypeChange('expense')}
              >
                <ArrowDownLeft
                  size={16}
                  color={type === 'expense' ? colors.expense : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeTabText,
                    {
                      color:
                        type === 'expense'
                          ? colors.expense
                          : colors.textSecondary,
                    },
                  ]}
                >
                  Pengeluaran
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeTab,
                  type === 'income' && [styles.typeTabActive, { backgroundColor: isDark ? 'rgba(57, 217, 138, 0.2)' : '#FFFFFF', borderColor: colors.income }],
                ]}
                onPress={() => handleTypeChange('income')}
              >
                <ArrowUpRight
                  size={16}
                  color={type === 'income' ? colors.income : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeTabText,
                    {
                      color:
                        type === 'income'
                          ? colors.income
                          : colors.textSecondary,
                    },
                  ]}
                >
                  Pemasukan
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.amountInputBlock}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                Jumlah Transaksi (IDR)
              </Text>
              <TextInput
                style={[
                  styles.amountInput,
                  {
                    color: type === 'income' ? colors.income : colors.expense,
                    borderBottomColor: colors.border,
                  },
                ]}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={amountRaw}
                onChangeText={handleAmountChange}
                autoFocus={!initialTransaction}
              />
              <Text style={[styles.amountPreview, { color: colors.textSecondary }]}>
                {formattedPreview}
              </Text>
            </View>

            {/* Merchant / Recipient */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                Merchant / Penerima (Opsional)
              </Text>
              <View style={[styles.textInputWrap, { backgroundColor: isDark ? colors.surfaceElevated : '#F9FBF9', borderColor: colors.border }]}>
                <Store size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="cth. Starbucks, Tokopedia, Gaji Kantor"
                  placeholderTextColor={colors.textMuted}
                  value={merchant}
                  onChangeText={setMerchant}
                />
              </View>
            </View>

            {/* Category Selector */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                Kategori
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryPillsRow}
              >
                {filteredCategories.map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.catPill,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? 'rgba(57, 217, 138, 0.2)'
                              : colors.primarySoft
                            : isDark
                            ? colors.surfaceElevated
                            : '#F9FBF9',
                          borderColor: isSelected
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <CategoryIcon
                        name={cat.icon}
                        color={isSelected ? colors.primary : colors.textSecondary}
                        size={16}
                      />
                      <Text
                        style={[
                          styles.catPillText,
                          {
                            color: isSelected
                              ? colors.primary
                              : colors.text,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Source Selector */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                Sumber Dana / Dompet
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryPillsRow}
              >
                {SOURCES.map((s) => {
                  const isSelected = source === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.sourcePill,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? 'rgba(57, 217, 138, 0.2)'
                              : colors.primarySoft
                            : isDark
                            ? colors.surfaceElevated
                            : '#F9FBF9',
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setSource(s)}
                    >
                      <Text
                        style={[
                          styles.sourcePillText,
                          {
                            color: isSelected ? colors.primary : colors.textSecondary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Date & Time */}
            <View style={styles.rowFields}>
              <View style={[styles.fieldBlock, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                  Tanggal (YYYY-MM-DD)
                </Text>
                <View style={[styles.textInputWrap, { backgroundColor: isDark ? colors.surfaceElevated : '#F9FBF9', borderColor: colors.border }]}>
                  <Calendar size={16} color={colors.textMuted} style={{ marginRight: 6 }} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={date}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={[styles.fieldBlock, { width: 120 }]}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                  Waktu
                </Text>
                <View style={[styles.textInputWrap, { backgroundColor: isDark ? colors.surfaceElevated : '#F9FBF9', borderColor: colors.border }]}>
                  <Clock size={16} color={colors.textMuted} style={{ marginRight: 6 }} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={time}
                    onChangeText={setTime}
                    placeholder="HH:mm"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </View>

            {/* Note / Description */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                Catatan Tambahan (Opsional)
              </Text>
              <View style={[styles.textInputWrap, { backgroundColor: isDark ? colors.surfaceElevated : '#F9FBF9', borderColor: colors.border }]}>
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="Keterangan transaksi..."
                  placeholderTextColor={colors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionButtons}>
              <Button
                title={initialTransaction ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
                onPress={handleSubmit}
                loading={isSaving}
                size="lg"
                style={{ flex: 1 }}
              />

              {initialTransaction && onDelete && (
                <TouchableOpacity
                  style={[styles.deleteButton, { borderColor: colors.expense }]}
                  onPress={handleDelete}
                >
                  <Trash2 size={20} color={colors.expense} />
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
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheetContainer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 1,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  typeSwitcher: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: 16,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeTabActive: {},
  typeTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  amountInputBlock: {
    alignItems: 'center',
    marginVertical: 10,
  },
  amountInput: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    borderBottomWidth: 1.5,
    minWidth: 200,
    paddingVertical: 4,
    fontVariant: ['tabular-nums'],
  },
  amountPreview: {
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
  fieldBlock: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
  },
  categoryPillsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 6,
  },
  catPillText: {
    fontSize: 12,
  },
  sourcePill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sourcePillText: {
    fontSize: 12,
  },
  rowFields: {
    flexDirection: 'row',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  deleteButton: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
