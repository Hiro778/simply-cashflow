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
import { Colors, Spacing, BorderRadius } from '../constants/theme';
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
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Atur Batas Anggaran</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Scope Selector: Overall vs Category */}
          <Text style={styles.sectionLabel}>Cakupan Anggaran</Text>
          <View style={styles.scopeRow}>
            <TouchableOpacity
              onPress={() => setSelectedCategoryId(null)}
              style={[
                styles.scopeTab,
                selectedCategoryId === null && styles.scopeTabActive,
              ]}
            >
              <Text
                style={[
                  styles.scopeTabText,
                  selectedCategoryId === null && styles.scopeTabTextActive,
                ]}
              >
                Total Bulanan
              </Text>
            </TouchableOpacity>

            {expenseCategories.slice(0, 3).map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategoryId(cat.id)}
                style={[
                  styles.scopeTab,
                  selectedCategoryId === cat.id && styles.scopeTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.scopeTabText,
                    selectedCategoryId === cat.id && styles.scopeTabTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount Input */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Batas Maksimal Pengeluaran (IDR)</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencyPrefix}>Rp</Text>
              <TextInput
                style={styles.amountInput}
                value={amountRaw ? formatIDR(parseIDR(amountRaw), false) : ''}
                onChangeText={handleAmountChange}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                autoFocus
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              title="Simpan Anggaran"
              onPress={handleSubmit}
              loading={isSaving}
              icon={<Target size={18} color="#080D0B" />}
              style={styles.saveBtn}
            />
          </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  sectionLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  scopeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  scopeTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  scopeTabActive: {
    backgroundColor: 'rgba(53, 208, 127, 0.15)',
    borderColor: Colors.primary,
  },
  scopeTabText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  scopeTabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  amountContainer: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.xl,
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
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    marginBottom: Spacing.xl,
  },
  saveBtn: {
    width: '100%',
  },
});
