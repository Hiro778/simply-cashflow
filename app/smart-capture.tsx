import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../hooks/useAppStore';
import { SurfaceCard } from '../components/SurfaceCard';
import { Button } from '../components/Button';
import { CaptureReviewCard } from '../components/CaptureReviewCard';
import { SmartCaptureBridgeService } from '../services/smartCapture/smartCaptureService';
import {
  getAllCaptured,
  getPendingReviewCaptured,
} from '../database/repositories/captureRepository';
import {
  getSetting,
  setSetting,
} from '../database/repositories/settingsRepository';
import { CapturedNotification } from '../database/schema';
import { formatIDR } from '../utils/currency';
import { formatReadableDate } from '../utils/dates';
import {
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Info,
} from 'lucide-react-native';
import { BorderRadius, Spacing } from '../constants/theme';

const TARGET_APPS = [
  { name: 'DANA', pkg: 'id.dana', type: 'E-Wallet' },
  { name: 'GoPay', pkg: 'com.gojek.app', type: 'E-Wallet' },
  { name: 'OVO', pkg: 'id.ovo', type: 'E-Wallet' },
  { name: 'ShopeePay', pkg: 'com.shopee.id', type: 'E-Wallet' },
  { name: 'BCA mobile', pkg: 'com.bca', type: 'Mobile Banking' },
  { name: 'BRImo', pkg: 'id.co.bri.brimo', type: 'Mobile Banking' },
  { name: 'Livin\' by Mandiri', pkg: 'id.bmri.livin', type: 'Mobile Banking' },
];

export default function SmartCaptureScreen() {
  const { colors, isDark } = useTheme();
  const { pendingCaptures, refresh, approveCapture, dismissCapture, syncCaptures } = useAppStore();

  const [hasPermission, setHasPermission] = useState(false);
  const [isSmartCaptureEnabled, setIsSmartCaptureEnabled] = useState(true);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);
  const [allCapturedHistory, setAllCapturedHistory] = useState<CapturedNotification[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const checkStatus = async () => {
    const perm = await SmartCaptureBridgeService.checkPermission();
    setHasPermission(perm);

    const scPref = await getSetting('smart_capture_enabled');
    setIsSmartCaptureEnabled(scPref !== '0');

    const autoSavePref = await getSetting('smart_capture_auto_save');
    setIsAutoSaveEnabled(autoSavePref !== '0');

    const history = await getAllCaptured();
    setAllCapturedHistory(history);
  };

  useEffect(() => {
    checkStatus();
  }, [pendingCaptures]);

  const handleToggleSmartCapture = async (value: boolean) => {
    setIsSmartCaptureEnabled(value);
    await setSetting('smart_capture_enabled', value ? '1' : '0');
  };

  const handleToggleAutoSave = async (value: boolean) => {
    setIsAutoSaveEnabled(value);
    await setSetting('smart_capture_auto_save', value ? '1' : '0');
  };

  const handleOpenPermissionSettings = async () => {
    await SmartCaptureBridgeService.openSettings();
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncCaptures();
    await checkStatus();
    setIsSyncing(false);
  };

  // Stats today
  const todayStr = new Date().toISOString().split('T')[0];
  const capturedTodayCount = allCapturedHistory.filter(
    (c) => new Date(c.notification_timestamp).toISOString().split('T')[0] === todayStr
  ).length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Status Hero Card */}
      <SurfaceCard
        style={styles.card}
        highlight={hasPermission && isSmartCaptureEnabled}
      >
        <View style={styles.statusHeader}>
          <View style={styles.statusLeft}>
            {hasPermission && isSmartCaptureEnabled ? (
              <ShieldCheck size={24} color={colors.primary} />
            ) : (
              <AlertCircle size={24} color={colors.warning} />
            )}
            <View>
              <Text style={[styles.statusTitle, { color: colors.text }]}>
                {hasPermission && isSmartCaptureEnabled
                  ? 'Smart Capture Aktif'
                  : 'Izin Akses Diperlukan'}
              </Text>
              <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
                {hasPermission
                  ? 'Mendeteksi notifikasi pembayaran lokal otomatis'
                  : 'Aktifkan Akses Notifikasi di Pengaturan Android'}
              </Text>
            </View>
          </View>
        </View>

        {!hasPermission && (
          <TouchableOpacity
            style={[styles.grantBtn, { backgroundColor: colors.primary }]}
            onPress={handleOpenPermissionSettings}
          >
            <ExternalLink size={16} color={isDark ? '#080F0C' : '#FFFFFF'} />
            <Text
              style={[
                styles.grantBtnText,
                { color: isDark ? '#080F0C' : '#FFFFFF' },
              ]}
            >
              Buka Pengaturan Izin Android
            </Text>
          </TouchableOpacity>
        )}

        <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: colors.text }]}>
              {capturedTodayCount}
            </Text>
            <Text style={[styles.statLbl, { color: colors.textMuted }]}>
              Terdeteksi Hari Ini
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: colors.primary }]}>
              {pendingCaptures.length}
            </Text>
            <Text style={[styles.statLbl, { color: colors.textMuted }]}>
              Menunggu Review
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.syncBtn, { borderColor: colors.border }]}
            onPress={handleManualSync}
            disabled={isSyncing}
          >
            <RefreshCw size={16} color={colors.primary} />
            <Text style={[styles.syncBtnText, { color: colors.primary }]}>
              {isSyncing ? 'Sinkron...' : 'Sinkron'}
            </Text>
          </TouchableOpacity>
        </View>
      </SurfaceCard>

      {/* Preferences Toggles */}
      <SurfaceCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>
          Preferensi Smart Capture
        </Text>

        <View style={[styles.prefRow, { borderBottomColor: colors.border }]}>
          <View style={styles.prefLeft}>
            <Text style={[styles.prefTitle, { color: colors.text }]}>
              Aktifkan Deteksi Notifikasi
            </Text>
            <Text style={[styles.prefDesc, { color: colors.textMuted }]}>
              Membaca notifikasi dari aplikasi e-wallet & perbankan terpilih
            </Text>
          </View>
          <Switch
            value={isSmartCaptureEnabled}
            onValueChange={handleToggleSmartCapture}
            thumbColor={isSmartCaptureEnabled ? colors.primary : colors.textMuted}
            trackColor={{ false: colors.border, true: colors.primarySoft }}
          />
        </View>

        <View style={styles.prefRow}>
          <View style={styles.prefLeft}>
            <Text style={[styles.prefTitle, { color: colors.text }]}>
              Simpan Otomatis (Akurasi Tinggi)
            </Text>
            <Text style={[styles.prefDesc, { color: colors.textMuted }]}>
              Langsung mencatat transaksi yang teridentifikasi dengan jelas tanpa antrean
            </Text>
          </View>
          <Switch
            value={isAutoSaveEnabled}
            onValueChange={handleToggleAutoSave}
            thumbColor={isAutoSaveEnabled ? colors.primary : colors.textMuted}
            trackColor={{ false: colors.border, true: colors.primarySoft }}
          />
        </View>
      </SurfaceCard>

      {/* Pending Review Queue */}
      {pendingCaptures.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 8 }]}>
            Menunggu Verifikasi Anda ({pendingCaptures.length})
          </Text>
          {pendingCaptures.map((item) => (
            <CaptureReviewCard
              key={item.id}
              capture={item}
              onApprove={approveCapture}
              onDismiss={dismissCapture}
            />
          ))}
        </View>
      )}

      {/* Supported Applications */}
      <SurfaceCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 8 }]}>
          Aplikasi yang Didukung ({TARGET_APPS.length})
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Parser deterministik lokal siap mengenali notifikasi pembayaran dari:
        </Text>

        {TARGET_APPS.map((app, idx) => (
          <View
            key={app.pkg}
            style={[
              styles.appRow,
              idx < TARGET_APPS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 0.5 },
            ]}
          >
            <View style={styles.appRowLeft}>
              <CheckCircle2 size={16} color={colors.primary} />
              <View>
                <Text style={[styles.appName, { color: colors.text }]}>{app.name}</Text>
                <Text style={[styles.appPkg, { color: colors.textMuted }]}>{app.pkg}</Text>
              </View>
            </View>
            <Text style={[styles.appTypeBadge, { color: colors.primary }]}>{app.type}</Text>
          </View>
        ))}
      </SurfaceCard>

      {/* Privacy Notice Card */}
      <SurfaceCard style={styles.card}>
        <View style={styles.privacyHeader}>
          <Info size={18} color={colors.primary} />
          <Text style={[styles.privacyTitle, { color: colors.text }]}>
            Jaminan Privasi 100% Lokal
          </Text>
        </View>
        <Text style={[styles.privacyBody, { color: colors.textSecondary }]}>
          Notifikasi Anda diproses secara offline di dalam perangkat Anda. Teks OTP, kode rahasia, promo, dan pesan pribadi difilter dan tidak pernah disimpan atau dikirim ke internet.
        </Text>
      </SurfaceCard>
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
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  grantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    marginTop: 6,
    marginBottom: 12,
  },
  grantBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  statLbl: {
    fontSize: 11,
    marginTop: 2,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  prefLeft: {
    flex: 1,
    marginRight: 12,
  },
  prefTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  prefDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  appRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  appRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
  },
  appPkg: {
    fontSize: 11,
  },
  appTypeBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  privacyBody: {
    fontSize: 12,
    lineHeight: 18,
  },
});
