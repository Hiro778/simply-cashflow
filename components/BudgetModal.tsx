import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Spacing, BorderRadius } from '../constants/theme';
import { Category } from '../database/schema';
import { Button } from './Button';
import { formatIDR, parseIDR } from '../utils/currency';
import { X, Target } from 'lucide-react-native';

interface BudgetModalProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  initialAmount?: number;
  initialCategoryId?: string | null;
  onSave: (categoryId: string | null, amount: number) => Promise<void>;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  visible,
  onClose,
  categories,
  initialAmount = 0,
  initialCategoryId = null,
  onSave,
}) => {
  const { colors, isDark } = useTheme();
  const [amountRaw, setAmountRaw] = useState(initialAmount > 0 ? initialAmount.toString() : '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAmountRaw(initialAmount > 0 ? initialAmount.toString() : '');
    setSelectedCategoryId(initialCategoryId);
  }, [initialAmount, initialCategoryId, visible]);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleAmountChange = (text: string) => {
    const num = parseIDR(text);
    setAmountRaw(num === 0 ? '' : num.toString());
  };

  const handleSubmit = async () => {
    const amount = parseIDR(amountRaw);
    if (amount <= 0) {
      Alert.alert('Perhatian', 'Masukkan batas anggaran yang valid');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(selectedCategoryId, amount);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan anggaran');
    } finally {
      setIsSaving(false);
    }
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
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View style={styles.handleContainer}>
            <View
              style={[
                styles.handle,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' },
              ]}
            />
          </View>

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Atur Batas Anggaran</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Scope Selector: Overall vs Category */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Cakupan Anggaran</Text>
          <View style={styles.scopeRow}>
            <TouchableOpacity
              onPress={() => setSelectedCategoryId(null)}
              style={[
                styles.scopeTab,
                {
                  backgroundColor: selectedCategoryId === null
                    ? isDark ? 'rgba(57, 217, 138, 0.18)' : colors.primarySoft
                    : isDark ? colors.surfaceElevated : '#F9FBF9',
                  borderColor: selectedCategoryId === null ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.scopeTabText,
                  { color: selectedCategoryId === null ? colors.primary : colors.textSecondary },
                  selectedCategoryId === null && { fontWeight: '700' },
                ]}
              >
                Total Bulanan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (expenseCategories.length > 0 && selectedCategoryId === null) {
                  setSelectedCategoryId(expenseCategories[0].id);
                }
              }}
              style={[
                styles.scopeTab,
                {
                  backgroundColor: selectedCategoryId !== null
                    ? isDark ? 'rgba(57, 217, 138, 0.18)' : colors.primarySoft
                    : isDark ? colors.surfaceElevated : '#F9FBF9',
                  borderColor: selectedCategoryId !== null ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.scopeTabText,
                  { color: selectedCategoryId !== null ? colors.primary : colors.textSecondary },
                  selectedCategoryId !== null && { fontWeight: '700' },
                ]}
              >
                Per Kategori
              </Text>
            </TouchableOpacity>
          </View>

          {/* Category Chips if Per Kategori selected */}
          {selectedCategoryId !== null && (
            <View style={styles.categoriesWrapper}>
              {expenseCategories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategoryId(cat.id)}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: isSelected
                          ? isDark ? 'rgba(57, 217, 138, 0.2)' : colors.primarySoft
                          : isDark ? colors.surfaceElevated : '#F9FBF9',
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        { color: isSelected ? colors.primary : colors.text },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Amount Input */}
          <View style={styles.amountContainer}>
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
              Batas Pengeluaran Maksimal (IDR)
            </Text>
            <View style={styles.amountInputRow}>
              <Text style={[styles.currencyPrefix, { color: colors.primary }]}>Rp</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text, borderBottomColor: colors.border }]}
                value={amountRaw ? formatIDR(parseIDR(amountRaw), false) : ''}
                onChangeText={handleAmountChange}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                autoFocus
              />
            </View>
          </View>

          <Button
            title="Simpan Batas Anggaran"
            onPress={handleSubmit}
            loading={isSaving}
            size="lg"
            style={styles.saveBtn}
          />
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
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingBottom: 28,
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  scopeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  scopeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  scopeTabText: {
    fontSize: 13,
  },
  categoriesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 12,
  },
  amountContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyPrefix: {
    fontSize: 22,
    fontWeight: '700',
    marginRight: 6,
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '800',
    minWidth: 180,
    textAlign: 'center',
    borderBottomWidth: 1.5,
    paddingVertical: 4,
    fontVariant: ['tabular-nums'],
  },
  saveBtn: {
    marginTop: 18,
  },
});
