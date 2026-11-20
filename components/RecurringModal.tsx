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
  RecurringTransaction,
  RecurringFrequency,
} from '../database/schema';
import { CategoryIcon } from './CategoryIcon';
import { Button } from './Button';
import { formatIDR, parseIDR } from '../utils/currency';
import { getTodayString } from '../utils/dates';
import { X, Trash2, Calendar, Repeat, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';

interface RecurringModalProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  initialItem?: RecurringTransaction | null;
  onSave: (item: Omit<RecurringTransaction, 'created_at' | 'updated_at'>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const FREQUENCIES: { id: RecurringFrequency; label: string }[] = [
  { id: 'daily', label: 'Harian' },
  { id: 'weekly', label: 'Mingguan' },
  { id: 'monthly', label: 'Bulanan' },
  { id: 'yearly', label: 'Tahunan' },
];

export const RecurringModal: React.FC<RecurringModalProps> = ({
  visible,
  onClose,
  categories,
  initialItem,
  onSave,
  onDelete,
}) => {
  const { colors, isDark } = useTheme();

  const [title, setTitle] = useState('');
  const [amountRaw, setAmountRaw] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [startDate, setStartDate] = useState(getTodayString());
  const [nextDueDate, setNextDueDate] = useState(getTodayString());
  const [autoRecord, setAutoRecord] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title);
      setAmountRaw(initialItem.amount.toString());
      setType(initialItem.type);
      setFrequency(initialItem.frequency);
      const cat = categories.find((c) => c.id === initialItem.category_id);
      setSelectedCategory(cat || null);
      setStartDate(initialItem.start_date);
      setNextDueDate(initialItem.next_due_date);
      setAutoRecord(initialItem.auto_record === 1);
    } else {
      setTitle('');
      setAmountRaw('');
      setType('expense');
      setFrequency('monthly');
      const defCat = categories.find((c) => c.type === 'expense');
      setSelectedCategory(defCat || null);
      setStartDate(getTodayString());
      setNextDueDate(getTodayString());
      setAutoRecord(false);
    }
  }, [initialItem, visible, categories]);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleAmountChange = (text: string) => {
    const num = parseIDR(text);
    setAmountRaw(num === 0 ? '' : num.toString());
  };

  const handleSubmit = async () => {
    const amount = parseIDR(amountRaw);
    if (!title.trim()) {
      Alert.alert('Perhatian', 'Masukkan judul transaksi rutin');
      return;
    }
    if (amount <= 0) {
      Alert.alert('Perhatian', 'Masukkan nominal yang valid');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Perhatian', 'Pilih kategori transaksi');
      return;
    }

    setIsSaving(true);
    try {
      const id =
        initialItem?.id ||
        `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      await onSave({
        id,
        title: title.trim(),
        amount,
        type,
        category_id: selectedCategory.id,
        category_name: selectedCategory.name,
        frequency,
        start_date: startDate,
        next_due_date: nextDueDate,
        is_active: 1,
        auto_record: autoRecord ? 1 : 0,
        status: initialItem?.status || 'scheduled',
      });

      onClose();
    } catch (e) {
      Alert.alert('Gagal', 'Tidak dapat menyimpan transaksi rutin');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!initialItem || !onDelete) return;

    Alert.alert('Hapus Jadwal', 'Hapus jadwal transaksi rutin ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          await onDelete(initialItem.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View
          style={[
            styles.sheetContainer,
            { backgroundColor: colors.surface, borderTopColor: colors.border },
          ]}
        >
          <View style={styles.handleContainer}>
            <View
              style={[
                styles.handle,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' },
              ]}
            />
          </View>

          <View style={styles.header}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {initialItem ? 'Ubah Transaksi Rutin' : 'Tambah Transaksi Rutin'}
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
            {/* Title */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                Judul (cth. Internet Indihome, Kosan, Gaji)
              </Text>
              <View style={[styles.textInputWrap, { backgroundColor: isDark ? colors.surfaceElevated : '#F9FBF9', borderColor: colors.border }]}>
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="Nama tagihan / pemasukan rutin"
                  placeholderTextColor={colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            {/* Type Switcher */}
            <View style={[styles.typeSwitcher, { backgroundColor: isDark ? '#182820' : colors.primarySoft }]}>
              <TouchableOpacity
                style={[
                  styles.typeTab,
                  type === 'expense' && [styles.typeTabActive, { backgroundColor: colors.expenseBackground, borderColor: colors.expense }],
                ]}
                onPress={() => setType('expense')}
              >
                <ArrowDownLeft
                  size={16}
                  color={type === 'expense' ? colors.expense : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeTabText,
                    { color: type === 'expense' ? colors.expense : colors.textSecondary },
                  ]}
                >
                  Pengeluaran Rutin
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeTab,
                  type === 'income' && [styles.typeTabActive, { backgroundColor: isDark ? 'rgba(57, 217, 138, 0.2)' : '#FFFFFF', borderColor: colors.income }],
                ]}
                onPress={() => setType('income')}
              >
                <ArrowUpRight
                  size={16}
                  color={type === 'income' ? colors.income : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeTabText,
                    { color: type === 'income' ? colors.income : colors.textSecondary },
                  ]}
                >
                  Pemasukan Rutin
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount */}
            <View style={styles.amountInputBlock}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                Nominal (IDR)
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
              />
              <Text style={[styles.amountPreview, { color: colors.textSecondary }]}>
                {parseIDR(amountRaw) > 0 ? formatIDR(parseIDR(amountRaw)) : 'Rp 0'}
              </Text>
            </View>

            {/* Frequency */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                Frekuensi Berulang
              </Text>
              <View style={styles.freqRow}>
                {FREQUENCIES.map((f) => {
                  const isSelected = frequency === f.id;
                  return (
                    <TouchableOpacity
                      key={f.id}
                      style={[
                        styles.freqPill,
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
                      onPress={() => setFrequency(f.id)}
                    >
                      <Text
                        style={[
                          styles.freqText,
                          {
                            color: isSelected ? colors.primary : colors.text,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Category */}
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
                          borderColor: isSelected ? colors.primary : colors.border,
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
                            color: isSelected ? colors.primary : colors.text,
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

            {/* Next Due Date */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                Tanggal Jatuh Tempo Berikutnya (YYYY-MM-DD)
              </Text>
              <View style={[styles.textInputWrap, { backgroundColor: isDark ? colors.surfaceElevated : '#F9FBF9', borderColor: colors.border }]}>
                <Calendar size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  value={nextDueDate}
                  onChangeText={setNextDueDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* Submit */}
            <View style={styles.actionButtons}>
              <Button
                title={initialItem ? 'Perbarui Jadwal' : 'Simpan Jadwal'}
                onPress={handleSubmit}
                loading={isSaving}
                size="lg"
                style={{ flex: 1 }}
              />

              {initialItem && onDelete && (
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
  typeSwitcher: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: 14,
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
    fontSize: 32,
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
  freqRow: {
    flexDirection: 'row',
    gap: 8,
  },
  freqPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  freqText: {
    fontSize: 12,
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
