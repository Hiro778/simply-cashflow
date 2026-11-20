import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SurfaceCard } from './SurfaceCard';
import { useTheme } from '../hooks/useTheme';
import { CapturedNotification } from '../database/schema';
import { formatIDR } from '../utils/currency';
import { formatReadableDate } from '../utils/dates';
import { Check, X, BellRing, Sparkles } from 'lucide-react-native';
import { BorderRadius, Spacing } from '../constants/theme';

interface CaptureReviewCardProps {
  capture: CapturedNotification;
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
}

export const CaptureReviewCard: React.FC<CaptureReviewCardProps> = ({
  capture,
  onApprove,
  onDismiss,
}) => {
  const { colors, isDark } = useTheme();
  const isIncome = capture.parsed_type === 'income';
  const amountColor = isIncome ? colors.income : colors.expense;
  const prefix = isIncome ? '+' : '-';

  return (
    <SurfaceCard
      style={[
        styles.card,
        {
          borderColor: isDark ? 'rgba(57, 217, 138, 0.3)' : 'rgba(22, 134, 83, 0.25)',
          backgroundColor: isDark ? '#14251D' : '#F0F9F4',
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Sparkles size={16} color={colors.primary} />
          <Text style={[styles.sourceBadge, { color: colors.primary }]}>
            {capture.app_name} • Smart Capture
          </Text>
        </View>
        <Text style={[styles.dateText, { color: colors.textMuted }]}>
          {formatReadableDate(
            new Date(capture.notification_timestamp).toISOString().split('T')[0]
          )}
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.infoCol}>
          <Text style={[styles.merchantText, { color: colors.text }]}>
            {capture.parsed_merchant || capture.title || 'Transaksi Baru'}
          </Text>
          <Text style={[styles.categorySuggest, { color: colors.textSecondary }]}>
            Kategori: {capture.parsed_category_name || 'Menunggu Verifikasi'}
          </Text>
          {capture.body ? (
            <Text
              style={[styles.rawNote, { color: colors.textMuted }]}
              numberOfLines={2}
            >
              "{capture.body}"
            </Text>
          ) : null}
        </View>

        <View style={styles.amountCol}>
          <Text style={[styles.amountText, { color: amountColor }]}>
            {prefix}
            {formatIDR(capture.parsed_amount || 0, true)}
          </Text>
        </View>
      </View>

      <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.dismissBtn, { borderColor: colors.border }]}
          onPress={() => onDismiss(capture.id)}
        >
          <X size={15} color={colors.textSecondary} />
          <Text style={[styles.dismissText, { color: colors.textSecondary }]}>
            Abaikan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.approveBtn, { backgroundColor: colors.primary }]}
          onPress={() => onApprove(capture.id)}
        >
          <Check size={15} color={isDark ? '#080F0C' : '#FFFFFF'} />
          <Text
            style={[
              styles.approveText,
              { color: isDark ? '#080F0C' : '#FFFFFF' },
            ]}
          >
            Simpan Transaksi
          </Text>
        </TouchableOpacity>
      </View>
    </SurfaceCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourceBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 11,
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  infoCol: {
    flex: 1,
    marginRight: 8,
  },
  merchantText: {
    fontSize: 15,
    fontWeight: '700',
  },
  categorySuggest: {
    fontSize: 12,
    marginTop: 2,
  },
  rawNote: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  dismissBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  dismissText: {
    fontSize: 12,
    fontWeight: '600',
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.sm,
  },
  approveText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
