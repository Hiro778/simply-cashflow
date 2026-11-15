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
import { SavingsGoal } from '../database/schema';
import { CategoryIcon } from './CategoryIcon';
import { Button } from './Button';
import { formatIDR, parseIDR } from '../utils/currency';
import { X, Trash2 } from 'lucide-react-native';

interface SavingsGoalModalProps {
  visible: boolean;
  onClose: () => void;
  initialGoal?: SavingsGoal | null;
  onSave: (
    goal: Omit<SavingsGoal, 'current_amount' | 'status' | 'created_at' | 'updated_at'>
  ) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const AVAILABLE_ICONS = [
  'Target',
  'Laptop',
  'Car',
  'Briefcase',
  'Store',
  'ShoppingBag',
  'GraduationCap',
  'HeartPulse',
];

const AVAILABLE_COLORS = [
  '#35D07F',
  '#80E6AC',
  '#38BDF8',
  '#A78BFA',
  '#FBBF24',
  '#F472B6',
  '#FB923C',
];

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  visible,
  onClose,
  initialGoal,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [targetAmountRaw, setTargetAmountRaw] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Target');
  const [selectedColor, setSelectedColor] = useState('#35D07F');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialGoal) {
      setName(initialGoal.name);
      setTargetAmountRaw(initialGoal.target_amount.toString());
      setTargetDate(initialGoal.target_date);
      setDescription(initialGoal.description || '');
      setSelectedIcon(initialGoal.icon || 'Target');
      setSelectedColor(initialGoal.color || '#35D07F');
    } else {
      setName('');
      setTargetAmountRaw('');
      // Default target date: 6 months from now
      const future = new Date();
      future.setMonth(future.getMonth() + 6);
      const y = future.getFullYear();
      const m = String(future.getMonth() + 1).padStart(2, '0');
      const d = String(future.getDate()).padStart(2, '0');
      setTargetDate(`${y}-${m}-${d}`);
      setDescription('');
      setSelectedIcon('Target');
      setSelectedColor('#35D07F');
    }
  }, [initialGoal, visible]);

  const handleAmountChange = (text: string) => {
    const num = parseIDR(text);
    setTargetAmountRaw(num === 0 ? '' : num.toString());
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Perhatian', 'Masukkan nama impian atau target tabungan Anda');
      return;
    }

    const targetAmount = parseIDR(targetAmountRaw);
    if (targetAmount <= 0) {
      Alert.alert('Perhatian', 'Masukkan jumlah target tabungan yang valid');
      return;
    }

    if (!targetDate) {
      Alert.alert('Perhatian', 'Tentukan tanggal target pencapaian');
      return;
    }

    setIsSaving(true);
    try {
      const goalData: Omit<SavingsGoal, 'current_amount' | 'status' | 'created_at' | 'updated_at'> = {
        id: initialGoal?.id || `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: name.trim(),
        target_amount: targetAmount,
        target_date: targetDate,
        description: description.trim(),
        icon: selectedIcon,
        color: selectedColor,
      };

      await onSave(goalData);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan target tabungan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!initialGoal || !onDelete) return;

    Alert.alert(
      'Hapus Target Tabungan',
      'Apakah Anda yakin ingin menghapus target tabungan ini beserta riwayat kontribusinya?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete(initialGoal.id);
              onClose();
            } catch (err) {
              Alert.alert('Error', 'Gagal menghapus target');
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
          <View style={styles.header}>
            <Text style={styles.title}>
              {initialGoal ? 'Ubah Target Tabungan' : 'Target Tabungan Baru'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Goal Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Target Tabungan</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Contoh: Beli Laptop Baru, Liburan, Dana Darurat"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            {/* Target Amount */}
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Target Nominal (IDR)</Text>
              <View style={styles.amountInputRow}>
                <Text style={styles.currencyPrefix}>Rp</Text>
                <TextInput
                  style={styles.amountInput}
                  value={targetAmountRaw ? formatIDR(parseIDR(targetAmountRaw), false) : ''}
                  onChangeText={handleAmountChange}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Target Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Tanggal Selesai (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={targetDate}
                onChangeText={setTargetDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            {/* Icon Selector */}
            <Text style={styles.inputLabel}>Pilih Ikon</Text>
            <View style={styles.iconRow}>
              {AVAILABLE_ICONS.map((iconName) => {
                const isSelected = selectedIcon === iconName;
                return (
                  <TouchableOpacity
                    key={iconName}
                    onPress={() => setSelectedIcon(iconName)}
                    style={[
                      styles.iconButton,
                      isSelected && {
                        borderColor: selectedColor,
                        backgroundColor: `${selectedColor}30`,
                      },
                    ]}
                  >
                    <CategoryIcon
                      name={iconName}
                      color={isSelected ? selectedColor : Colors.textSecondary}
                      size={20}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Color Selector */}
            <Text style={styles.inputLabel}>Pilih Warna</Text>
            <View style={styles.colorRow}>
              {AVAILABLE_COLORS.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorDot,
                      { backgroundColor: color },
                      isSelected && styles.colorDotSelected,
                    ]}
                  />
                );
              })}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Catatan / Motivasi (Opsional)</Text>
              <TextInput
                style={styles.textInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Target realistis per bulan..."
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <Button
                title={initialGoal ? 'Perbarui Target' : 'Buat Target Tabungan'}
                onPress={handleSubmit}
                loading={isSaving}
                style={styles.saveBtn}
              />

              {initialGoal && onDelete && (
                <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                  <Trash2 size={18} color={Colors.expense} />
                  <Text style={styles.deleteText}>Hapus Target</Text>
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
    maxHeight: '88%',
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
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  iconButton: {
    padding: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
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
