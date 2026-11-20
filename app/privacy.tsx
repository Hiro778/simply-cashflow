import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { SurfaceCard } from '../components/SurfaceCard';
import {
  ShieldCheck,
  Lock,
  Database,
  Radio,
  WifiOff,
  UserCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react-native';
import { BorderRadius, Spacing } from '../constants/theme';

export default function PrivacyScreen() {
  const { colors, isDark } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Badge */}
      <SurfaceCard style={styles.heroCard} highlight>
        <View style={styles.heroHeader}>
          <ShieldCheck size={26} color={colors.primary} />
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            100% Offline-First Privacy Architecture
          </Text>
        </View>
        <Text style={[styles.heroBody, { color: colors.textSecondary }]}>
          Simply Cashflow dirancang dengan prinsip bahwa data finansial pribadi Anda sepenuhnya adalah milik Anda. Tidak ada data yang pernah dikirim keluar dari perangkat Anda.
        </Text>
      </SurfaceCard>

      {/* Core Privacy Principles */}
      <SurfaceCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 14 }]}>
          Prinsip Privasi Mutlak
        </Text>

        <View style={styles.principleItem}>
          <CheckCircle2 size={18} color={colors.primary} style={styles.checkIcon} />
          <View style={styles.principleContent}>
            <Text style={[styles.principleTitle, { color: colors.text }]}>
              100% Pemrosesan Finansial Lokal
            </Text>
            <Text style={[styles.principleDesc, { color: colors.textSecondary }]}>
              Seluruh transaksi, perhitungan Safe to Spend, anggaran, dan target tersimpan di SQLite lokal perangkat.
            </Text>
          </View>
        </View>

        <View style={styles.principleItem}>
          <CheckCircle2 size={18} color={colors.primary} style={styles.checkIcon} />
          <View style={styles.principleContent}>
            <Text style={[styles.principleTitle, { color: colors.text }]}>
              Tanpa Akun & Tanpa Backend
            </Text>
            <Text style={[styles.principleDesc, { color: colors.textSecondary }]}>
              Tidak ada registrasi, login, atau server cloud database yang menyimpan data Anda.
            </Text>
          </View>
        </View>

        <View style={styles.principleItem}>
          <CheckCircle2 size={18} color={colors.primary} style={styles.checkIcon} />
          <View style={styles.principleContent}>
            <Text style={[styles.principleTitle, { color: colors.text }]}>
              Tanpa AI Eksternal atau API Pihak Ketiga
            </Text>
            <Text style={[styles.principleDesc, { color: colors.textSecondary }]}>
              Parser Smart Capture dan inferensi kategori bekerja 100% lokal berbasis aturan deterministik.
            </Text>
          </View>
        </View>

        <View style={styles.principleItem}>
          <CheckCircle2 size={18} color={colors.primary} style={styles.checkIcon} />
          <View style={styles.principleContent}>
            <Text style={[styles.principleTitle, { color: colors.text }]}>
              Nol Telemetri & Nol Pelacak
            </Text>
            <Text style={[styles.principleDesc, { color: colors.textSecondary }]}>
              Bebas dari Google Analytics, Facebook SDK, crash reporter eksternal, atau iklan.
            </Text>
          </View>
        </View>
      </SurfaceCard>

      {/* Permissions Transparency */}
      <SurfaceCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>
          Transparansi Izin Android
        </Text>

        <View style={styles.permRow}>
          <Text style={[styles.permName, { color: colors.text }]}>
            NotificationListenerService
          </Text>
          <Text style={[styles.permDesc, { color: colors.textSecondary }]}>
            Hanya digunakan untuk membaca notifikasi transaksi dari aplikasi pembayaran yang didukung (DANA, GoPay, OVO, ShopeePay, BCA, BRI, Mandiri). Pesan OTP, kode rahasia, dan teks promo otomatis diabaikan.
          </Text>
        </View>
      </SurfaceCard>

      {/* Data Storage & Encryption */}
      <SurfaceCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 8 }]}>
          Penyimpanan & Keamanan Data
        </Text>
        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          Database: <Text style={{ color: colors.text, fontWeight: '700' }}>SQLite (simply_cashflow.db)</Text> di direktori internal aplikasi yang terisolasi dari aplikasi lain oleh sandbox sistem operasi Android.
        </Text>
        <Text style={[styles.bodyText, { color: colors.textSecondary, marginTop: 6 }]}>
          File backup JSON dan CSV hanya diekspor ke penyimpanan dokumen sesuai tindakan manual yang Anda setujui melalui pemilih dokumen sistem Android.
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
  heroCard: {
    marginVertical: 6,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  heroBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    marginVertical: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  principleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  checkIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  principleContent: {
    flex: 1,
  },
  principleTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  principleDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  permRow: {
    paddingVertical: 6,
  },
  permName: {
    fontSize: 13,
    fontWeight: '700',
  },
  permDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
