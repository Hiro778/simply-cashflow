import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { SurfaceCard } from '../components/SurfaceCard';
import { Button } from '../components/Button';
import { useAppStore } from '../hooks/useAppStore';
import { formatIDR, parseIDR } from '../utils/currency';
import {
  exportJSONBackup,
  exportCSVReport,
  restoreFromJSON,
  restoreFromCSV,
} from '../services/backupService';
import {
  getSetting,
  setSetting,
  clearAllData,
} from '../database/repositories/settingsRepository';
import { SmartCaptureBridgeService } from '../services/smartCapture/smartCaptureService';
import {
  Moon,
  Sun,
  Smartphone,
  Shield,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  ChevronRight,
  Sparkles,
  Repeat,
  DollarSign,
  Info,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BorderRadius, Spacing } from '../constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const { refresh, safeToSpend } = useAppStore();

  const [reserveRaw, setReserveRaw] = useState(
    safeToSpend.reservedFunds > 0 ? safeToSpend.reservedFunds.toString() : ''
  );
  const [isSmartCaptureActive, setIsSmartCaptureActive] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    SmartCaptureBridgeService.checkPermission().then((res) => {
      setIsSmartCaptureActive(res);
    });
    getSetting('safe_to_spend_reserve').then((val) => {
      if (val) setReserveRaw(val);
    });
  }, []);

  const handleSaveReserve = async () => {
    const amount = parseIDR(reserveRaw);
    await setSetting('safe_to_spend_reserve', amount.toString());
    await refresh();
    Alert.alert('Berhasil', 'Besaran dana cadangan Safe to Spend berhasil disimpan.');
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      await exportJSONBackup();
    } catch (e) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengekspor backup JSON.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await exportCSVReport();
    } catch (e) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengekspor laporan CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Hapus Semua Data',
      'Tindakan ini akan menghapus seluruh catatan transaksi, target tabungan, dan anggaran dari perangkat ini secara permanen.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            await refresh();
            Alert.alert('Selesai', 'Seluruh data lokal telah dibersihkan.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Theme Appearance Mode */}
      <SurfaceCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tampilan & Tema</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Sesuaikan tema visual Simply Cashflow dengan preferensi Anda.
        </Text>

        <View style={styles.themeRow}>
          <TouchableOpacity
            style={[
              styles.themeOption,
              {
                backgroundColor: themeMode === 'system'
                  ? isDark ? 'rgba(57, 217, 138, 0.15)' : colors.primarySoft
                  : colors.surface,
                borderColor: themeMode === 'system' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setThemeMode('system')}
          >
            <Smartphone size={18} color={themeMode === 'system' ? colors.primary : colors.textSecondary} />
            <Text
              style={[
                styles.themeOptionText,
                { color: themeMode === 'system' ? colors.primary : colors.text },
                themeMode === 'system' && { fontWeight: '700' },
              ]}
            >
              Sistem
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              {
                backgroundColor: themeMode === 'light'
                  ? colors.primarySoft
                  : colors.surface,
                borderColor: themeMode === 'light' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setThemeMode('light')}
          >
            <Sun size={18} color={themeMode === 'light' ? colors.primary : colors.textSecondary} />
            <Text
              style={[
                styles.themeOptionText,
                { color: themeMode === 'light' ? colors.primary : colors.text },
                themeMode === 'light' && { fontWeight: '700' },
              ]}
            >
              Terang
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              {
                backgroundColor: themeMode === 'dark'
                  ? 'rgba(57, 217, 138, 0.15)'
                  : colors.surface,
                borderColor: themeMode === 'dark' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setThemeMode('dark')}
          >
            <Moon size={18} color={themeMode === 'dark' ? colors.primary : colors.textSecondary} />
            <Text
              style={[
                styles.themeOptionText,
                { color: themeMode === 'dark' ? colors.primary : colors.text },
                themeMode === 'dark' && { fontWeight: '700' },
              ]}
            >
              Gelap
            </Text>
          </TouchableOpacity>
        </View>
      </SurfaceCard>

      {/* Financial Intelligence: Safe to Spend Reserve */}
      <SurfaceCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Safe to Spend — Dana Cadangan</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Nominal minimum yang selalu dijaga dan tidak boleh dibelanjakan pada formula Safe to Spend.
        </Text>

        <View style={styles.reserveInputRow}>
          <View style={[styles.reserveInputWrap, { backgroundColor: isDark ? colors.surfaceElevated : '#F9FBF9', borderColor: colors.border }]}>
            <Text style={[styles.currencyPrefix, { color: colors.primary }]}>Rp</Text>
            <TextInput
              style={[styles.reserveInput, { color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={reserveRaw ? formatIDR(parseIDR(reserveRaw), false) : ''}
              onChangeText={(t) => setReserveRaw(parseIDR(t).toString())}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveReserveBtn, { backgroundColor: colors.primary }]}
            onPress={handleSaveReserve}
          >
            <Text style={[styles.saveReserveText, { color: isDark ? '#080F0C' : '#FFFFFF' }]}>
              Simpan
            </Text>
          </TouchableOpacity>
        </View>
      </SurfaceCard>

      {/* Smart Automation Entries */}
      <SurfaceCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>
          Automasi & Jadwal
        </Text>

        <TouchableOpacity
          style={[styles.navItem, { borderBottomColor: colors.border }]}
          onPress={() => router.push('/smart-capture')}
        >
          <View style={styles.navItemLeft}>
            <View style={[styles.navIconCircle, { backgroundColor: isDark ? 'rgba(57, 217, 138, 0.15)' : colors.primarySoft }]}>
              <Sparkles size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.navTitle, { color: colors.text }]}>Smart Capture</Text>
              <Text style={[styles.navSubtitle, { color: colors.textMuted }]}>
                {isSmartCaptureActive ? 'Aktif (Mendeteksi Notifikasi)' : 'Belum Aktif (Butuh Izin)'}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/recurring')}
        >
          <View style={styles.navItemLeft}>
            <View style={[styles.navIconCircle, { backgroundColor: isDark ? 'rgba(57, 217, 138, 0.15)' : colors.primarySoft }]}>
              <Repeat size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.navTitle, { color: colors.text }]}>Transaksi Rutin</Text>
              <Text style={[styles.navSubtitle, { color: colors.textMuted }]}>
                Jadwal tagihan & pemasukan berulang
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </SurfaceCard>

      {/* Data Management & Backup */}
      <SurfaceCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>
          Manajemen Data Lokal
        </Text>

        <TouchableOpacity
          style={[styles.actionRow, { borderBottomColor: colors.border }]}
          onPress={handleExportJSON}
          disabled={isExporting}
        >
          <View style={styles.navItemLeft}>
            <Download size={18} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              Export Backup Lengkap (JSON)
            </Text>
          </View>
          <ChevronRight size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionRow, { borderBottomColor: colors.border }]}
          onPress={handleExportCSV}
          disabled={isExporting}
        >
          <View style={styles.navItemLeft}>
            <FileSpreadsheet size={18} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              Export Laporan Transaksi (CSV)
            </Text>
          </View>
          <ChevronRight size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => router.push('/privacy')}
        >
          <View style={styles.navItemLeft}>
            <Shield size={18} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              Audit Privasi & Arsitektur Keamanan
            </Text>
          </View>
          <ChevronRight size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </SurfaceCard>

      {/* Danger Zone */}
      <SurfaceCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.expense, marginBottom: 10 }]}>
          Zona Bahaya
        </Text>

        <TouchableOpacity
          style={[styles.dangerBtn, { borderColor: colors.expense }]}
          onPress={handleResetData}
        >
          <Trash2 size={16} color={colors.expense} />
          <Text style={[styles.dangerBtnText, { color: colors.expense }]}>
            Hapus Seluruh Data Transaksi
          </Text>
        </TouchableOpacity>
      </SurfaceCard>

      {/* About Footer */}
      <View style={styles.aboutFooter}>
        <Text style={[styles.appName, { color: colors.text }]}>Simply Cashflow 2.0.0</Text>
        <Text style={[styles.appVision, { color: colors.textMuted }]}>
          Your Money. Clearly. • 100% Local-First & Private
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginVertical: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 16,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  themeOptionText: {
    fontSize: 13,
  },
  reserveInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  reserveInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  currencyPrefix: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 6,
  },
  reserveInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  saveReserveBtn: {
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveReserveText: {
    fontSize: 13,
    fontWeight: '700',
  },
  navItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  navSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  dangerBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  aboutFooter: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
  },
  appVision: {
    fontSize: 12,
    marginTop: 4,
  },
});
