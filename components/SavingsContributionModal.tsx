import React, { useState } from 'react';
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
import { SavingsGoal } from '../database/schema';
import { Button } from './Button';
import { formatIDR, parseIDR } from '../utils/currency';
import { getTodayString } from '../utils/dates';
import { X, PlusCircle } from 'lucide-react-native';

interface SavingsContributionModalProps {
  visible: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  onAddContribution: (goalId: string, amount: number, date: string, note?: string) => Promise<void>;
}

export const SavingsContributionModal: React.FC<SavingsContributionModalProps> = ({
  visible,
  onClose,
  goal,
  onAddContribution,
}) => {
  const [amountRaw, setAmountRaw] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAmountChange = (text: string) => {
    const num = parseIDR(text);
    setAmountRaw(num === 0 ? '' : num.toString());
  };

  const handleSubmit = async () => {
    if (!goal) return;

    const amount = parseIDR(amountRaw);
    if (amount <= 0) {
      Alert.alert('Perhatian', 'Masukkan jumlah setoran tabungan yang valid');
      return;
    }

    setIsSaving(true);
    try {
      await onAddContribution(goal.id, amount, date || getTodayString(), note.trim());
      setAmountRaw('');
      setNote('');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Gagal menambahkan setoran tabungan');
    } finally {
      setIsSaving(false);
    }
  };

  if (!goal) return null;

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
            <View>
              <Text style={styles.title}>Setor Tabungan</Text>
              <Text style={styles.subtitle}>{goal.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Jumlah Setoran (IDR)</Text>
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

          {/* Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tanggal Setor</Text>
            <TextInput
              style={styles.textInput}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Note */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Catatan (Opsional)</Text>
            <TextInput
              style={styles.textInput}
              value={note}
              onChangeText={setNote}
              placeholder="Contoh: Sisihan bonus projek"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Submit Button */}
          <View style={styles.footer}>
            <Button
              title="Konfirmasi Setoran"
              onPress={handleSubmit}
              loading={isSaving}
              icon={<PlusCircle size={18} color="#080D0B" />}
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
  subtitle: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  amountContainer: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.md,
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
  },
  saveBtn: {
    width: '100%',
  },
});
