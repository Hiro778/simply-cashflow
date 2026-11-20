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
import { Spacing, BorderRadius } from '../constants/theme';
import { SavingsGoal } from '../database/schema';
import { CategoryIcon } from './CategoryIcon';
import { Button } from './Button';
import { formatIDR, parseIDR } from '../utils/currency';
import { X, Trash2, Calendar } from 'lucide-react-native';

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
  '#39D98A',
  '#80E6AC',
  '#38BDF8',
  '#A78BFA',
  '#F4C76B',
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
  const { colors, isDark } = useTheme();

  const [name, setName] = useState('');
  const [targetAmountRaw, setTargetAmountRaw] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Target');
  const [selectedColor, setSelectedColor] = useState('#39D98A');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialGoal) {
      setName(initialGoal.name);
      setTargetAmountRaw(initialGoal.target_amount.toString());
      setTargetDate(initialGoal.target_date);
      setDescription(initialGoal.description || '');
      setSelectedIcon(initialGoal.icon || 'Target');
      setSelectedColor(initialGoal.color || '#39D98A');
    } else {
      setName('');
      setTargetAmountRaw('');
      const future = new Date();
      future.setMonth(future.getMonth() + 6);
      const y = future.getFullYear();
      const m = String(future.getMonth() + 1).padStart(2, '0');
      const d = String(future.getDate()).padStart(2, '0');
      setTargetDate(`${y}-${m}-${d}`);
      setDescription('');
      setSelectedIcon('Target');
      setSelectedColor('#39D98A');
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
      Alert.alert('Perhatian', 'Masukkan nominal target tabungan yang valid');
      return;
    }

    if (!targetDate) {
      Alert.alert('Perhatian', 'Tentukan tanggal target pencapaian tabungan');
      return;
    }

    setIsSaving(true);
    try {
      const id = initialGoal?.id || `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await onSave({
        id,
        name: name.trim(),
        target_amount: targetAmount,
        target_date: targetDate,
        description: description.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });

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
      'Apakah Anda yakin ingin menghapus target ini beserta riwayat setorannya?',
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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
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
            <Text style={[styles.title, { color: colors.text }]}>
              {initialGoal ? 'Ubah Target Tabungan' : 'Target Impian Baru'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Goal Name */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Nama Target / Impian</Text>
              <View style={[styles.inputWrap, { backgroundColor: isDark ? colors.surfaceElevated : '#F9FBF9', borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="cth. Liburan Jepang, MacBook Pro, Dana Darurat"
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Target Amount */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Nominal Target (IDR)</Text>
              <View style={[styles.inputWrap, { backgroundColor: isDark ? colors.surfaceElevated : '#F9FBF9', borderColor: colors.border }]}>
                <Text style={[styles.prefix, { color: colors.primary }]}>Rp</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={targetAmountRaw ? formatIDR(parseIDR(targetAmountRaw), false) : ''}
                  onChangeText={handleAmountChange}
                />
              </View>
            </View>

            {/* Target Date */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Target Tercapai (YYYY-MM-DD)</Text>
              <View style={[styles.inputWrap, { backgroundColor: isDark ? colors.surfaceElevated : '#F9FBF9', borderColor: colors.border }]}>
                <Calendar size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  value={targetDate}
                  onChangeText={setTargetDate}
                />
              </View>
            </View>

            {/* Icon Picker */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Pilih Ikon</Text>
              <View style={styles.iconsRow}>
                {AVAILABLE_ICONS.map((iconName) => {
                  const isSelected = selectedIcon === iconName;
                  return (
                    <TouchableOpacity
                      key={iconName}
                      onPress={() => setSelectedIcon(iconName)}
                      style={[
                        styles.iconBtn,
                        {
                          backgroundColor: isSelected
                            ? isDark ? 'rgba(57, 217, 138, 0.2)' : colors.primarySoft
                            : isDark ? colors.surfaceElevated : '#F9FBF9',
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <CategoryIcon
                        name={iconName}
                        color={isSelected ? colors.primary : colors.textSecondary}
                        size={20}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Note / Description */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Catatan Motivasi (Opsional)</Text>
              <View style={[styles.inputWrap, { backgroundColor: isDark ? colors.surfaceElevated : '#F9FBF9', borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="cth. Sisihkan tiap gajian minimal Rp 1 jt"
                  placeholderTextColor={colors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.actionRow}>
              <Button
                title={initialGoal ? 'Perbarui Target' : 'Buat Target Impian'}
                onPress={handleSubmit}
                loading={isSaving}
                size="lg"
                style={{ flex: 1 }}
              />

              {initialGoal && onDelete && (
                <TouchableOpacity
                  style={[styles.deleteBtn, { borderColor: colors.expense }]}
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
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    maxHeight: '90%',
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
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
  },
  prefix: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  iconsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  deleteBtn: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
