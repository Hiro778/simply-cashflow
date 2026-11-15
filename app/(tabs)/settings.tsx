import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../hooks/useAppStore';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import {
  exportCSVReport,
  exportJSONBackup,
  restoreFromJSON,
  restoreFromCSV,
} from '../../services/backupService';
import { clearAllData } from '../../database/repositories/settingsRepository';
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileJson,
  Trash2,
  ShieldCheck,
  Info,
  DollarSign,
  CheckCircle,
  X,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { refresh } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [importType, setImportType] = useState<'json' | 'csv'>('json');
  const [importRawText, setImportRawText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await exportCSVReport();
      Alert.alert('Sukses', 'Laporan transaksi CSV berhasil diexport.');
    } catch (err: any) {
      Alert.alert('Gagal Export CSV', err?.message || 'Terjadi kesalahan.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      await exportJSONBackup();
      Alert.alert('Sukses', 'File cadangan JSON berhasil diexport.');
    } catch (err: any) {
      Alert.alert('Gagal Export JSON', err?.message || 'Terjadi kesalahan.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenImport = (type: 'json' | 'csv') => {
    setImportType(type);
    setImportRawText('');
    setIsImportModalVisible(true);
  };

  const handleConfirmImport = async () => {
    if (!importRawText.trim()) {
      Alert.alert('Perhatian', 'Tempelkan (paste) teks data cadangan terlebih dahulu');
      return;
    }

    setIsImporting(true);
    try {
      let count = 0;
      if (importType === 'json') {
        count = await restoreFromJSON(importRawText);
      } else {
        count = await restoreFromCSV(importRawText);
      }
      await refresh();
      setIsImportModalVisible(false);
      Alert.alert('Berhasil Dipulihkan', `Berhasil memulihkan ${count} data transaksi.`);
    } catch (err: any) {
      Alert.alert('Gagal Pulihkan', err?.message || 'Format data cadangan tidak sesuai.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Hapus Seluruh Data?',
      'Tindakan ini akan menghapus seluruh data transaksi, anggaran, dan tabungan Anda secara permanen. Pastikan Anda sudah membuat cadangan terlebih dahulu.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Konfirmasi Terakhir',
              'Apakah Anda benar-benar yakin ingin mengosongkan seluruh database?',
              [
                { text: 'Batal', style: 'cancel' },
                {
                  text: 'Ya, Hapus Data',
                  style: 'destructive',
                  onPress: async () => {
                    await clearAllData();
                    await refresh();
                    Alert.alert('Berhasil', 'Seluruh data telah dihapus.');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Pengaturan</Text>
          <Text style={styles.subtitle}>Sistem & Privasi</Text>
        </View>

        {/* Currency Card */}
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <DollarSign size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Mata Uang & Format</Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Mata Uang Default</Text>
            <View style={styles.badgeActive}>
              <Text style={styles.badgeText}>IDR (Rp - Rupiah)</Text>
            </View>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Presisi Finansial</Text>
            <Text style={styles.settingValue}>Bilangan Bulat (Bebas Floating Point)</Text>
          </View>
        </GlassCard>

        {/* Data & Backup Management */}
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <Download size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Cadangan & Laporan</Text>
          </View>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleExportCSV}
            disabled={isExporting}
          >
            <View style={styles.actionLeft}>
              <View style={styles.actionIconBg}>
                <FileSpreadsheet size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.actionTitle}>Export Laporan CSV</Text>
                <Text style={styles.actionDesc}>Laporan transaksi untuk spreadsheet</Text>
              </View>
            </View>
            <Download size={16} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleExportJSON}
            disabled={isExporting}
          >
            <View style={styles.actionLeft}>
              <View style={styles.actionIconBg}>
                <FileJson size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.actionTitle}>Export Cadangan JSON</Text>
                <Text style={styles.actionDesc}>Cadangan lengkap seluruh data aplikasi</Text>
              </View>
            </View>
            <Download size={16} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => handleOpenImport('json')}
          >
            <View style={styles.actionLeft}>
              <View style={styles.actionIconBg}>
                <Upload size={18} color={Colors.secondaryGreen} />
              </View>
              <View>
                <Text style={styles.actionTitle}>Pulihkan Cadangan JSON</Text>
                <Text style={styles.actionDesc}>Kembalikan data dari file cadangan</Text>
              </View>
            </View>
            <Upload size={16} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => handleOpenImport('csv')}
          >
            <View style={styles.actionLeft}>
              <View style={styles.actionIconBg}>
                <FileSpreadsheet size={18} color={Colors.secondaryGreen} />
              </View>
              <View>
                <Text style={styles.actionTitle}>Impor Transaksi CSV</Text>
                <Text style={styles.actionDesc}>Impor riwayat transaksi dari file CSV</Text>
              </View>
            </View>
            <Upload size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </GlassCard>

        {/* Privacy & Architecture */}
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <ShieldCheck size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Privasi & Keamanan</Text>
          </View>
          <View style={styles.privacyItem}>
            <CheckCircle size={16} color={Colors.primary} />
            <Text style={styles.privacyText}>
              100% Offline-First. Seluruh data keuangan Anda tersimpan lokal di SQLite HP Anda.
            </Text>
          </View>
          <View style={styles.privacyItem}>
            <CheckCircle size={16} color={Colors.primary} />
            <Text style={styles.privacyText}>
              Bebas Registrasi Akun. Tanpa perlu email atau password.
            </Text>
          </View>
          <View style={styles.privacyItem}>
            <CheckCircle size={16} color={Colors.primary} />
            <Text style={styles.privacyText}>
              Nol Telemetri & Nol Pelacak. Tidak ada pengiriman data ke server luar mana pun.
            </Text>
          </View>
        </GlassCard>

        {/* Danger Zone */}
        <GlassCard style={styles.dangerCard}>
          <View style={styles.cardHeader}>
            <Trash2 size={18} color={Colors.expense} />
            <Text style={[styles.cardTitle, { color: Colors.expense }]}>Zona Bahaya</Text>
          </View>
          <Text style={styles.dangerDesc}>
            Menghapus seluruh catatan keuangan, kategori kustom, target impian, dan anggaran.
          </Text>
          <Button
            title="Kosongkan Semua Data"
            variant="danger"
            onPress={handleClearAllData}
            style={styles.clearBtn}
          />
        </GlassCard>

        {/* About App */}
        <View style={styles.aboutContainer}>
          <Info size={16} color={Colors.textSecondary} />
          <Text style={styles.aboutTitle}>SIMPLY CASHFLOW v1.0.0</Text>
          <Text style={styles.aboutSubtitle}>
            Financial Operating System by Hiro778 (Hazze'On)
          </Text>
        </View>
      </ScrollView>

      {/* Import Modal */}
      <Modal
        visible={isImportModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsImportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {importType === 'json' ? 'Pulihkan Cadangan JSON' : 'Impor Transaksi CSV'}
              </Text>
              <TouchableOpacity onPress={() => setIsImportModalVisible(false)}>
                <X size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              {importType === 'json'
                ? 'Tempelkan (paste) seluruh teks isi file JSON cadangan Anda di bawah ini:'
                : 'Tempelkan teks data CSV transaksi Anda di bawah ini:'}
            </Text>

            <TextInput
              style={styles.importInput}
              multiline
              numberOfLines={8}
              value={importRawText}
              onChangeText={setImportRawText}
              placeholder={
                importType === 'json'
                  ? '{\n  "version": "1.0.0",\n  "data": { ... }\n}'
                  : 'ID,Date,Type,Category,Amount,Description\n...'
              }
              placeholderTextColor={Colors.textMuted}
            />

            <View style={styles.modalFooter}>
              <Button
                title={isImporting ? 'Memproses...' : 'Validasi & Pulihkan Data'}
                onPress={handleConfirmImport}
                loading={isImporting}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  settingLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  settingValue: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
  },
  badgeActive: {
    backgroundColor: 'rgba(53, 208, 127, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 8,
    borderRadius: BorderRadius.md,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  actionDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  dangerCard: {
    marginBottom: Spacing.lg,
    borderColor: 'rgba(255, 114, 114, 0.25)',
    backgroundColor: 'rgba(255, 114, 114, 0.04)',
  },
  dangerDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: Spacing.md,
  },
  clearBtn: {
    width: '100%',
  },
  aboutContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: 4,
  },
  aboutTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 1,
  },
  aboutSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#101915',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  modalDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 16,
  },
  importInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    height: 180,
    textAlignVertical: 'top',
    marginBottom: Spacing.lg,
  },
  modalFooter: {
    marginBottom: Spacing.xl,
  },
});
