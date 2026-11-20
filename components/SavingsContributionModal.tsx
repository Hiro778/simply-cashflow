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
import { useTheme } from '../hooks/useTheme';
import { Spacing, BorderRadius } from '../constants/theme';
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
  const { colors, isDark } = useTheme();

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
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Setor Tabungan</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{goal.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.amountContainer}>
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
              Jumlah Setoran (IDR)
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

          {/* Note Input */}
          <View style={styles.noteContainer}>
            <Text style={[styles.noteLabel, { color: colors.textMuted }]}>
              Catatan Setoran (Opsional)
            </Text>
            <View style={[styles.noteInputWrap, { backgroundColor: isDark ? colors.surfaceElevated : '#F9FBF9', borderColor: colors.border }]}>
              <TextInput
                style={[styles.noteInput, { color: colors.text }]}
                placeholder="cth. Bonus proyek, sisa jajan mingguan"
                placeholderTextColor={colors.textMuted}
                value={note}
                onChangeText={setNote}
              />
            </View>
          </View>

          <Button
            title="Konfirmasi Setoran Tabungan"
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
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  amountContainer: {
    marginVertical: 14,
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
    fontSize: 30,
    fontWeight: '800',
    minWidth: 180,
    textAlign: 'center',
    borderBottomWidth: 1.5,
    paddingVertical: 4,
    fontVariant: ['tabular-nums'],
  },
  noteContainer: {
    marginVertical: 12,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  noteInputWrap: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
    justifyContent: 'center',
  },
  noteInput: {
    fontSize: 14,
  },
  saveBtn: {
    marginTop: 18,
  },
});
