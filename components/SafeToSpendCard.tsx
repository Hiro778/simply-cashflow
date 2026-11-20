import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SurfaceCard } from './SurfaceCard';
import { useTheme } from '../hooks/useTheme';
import { SafeToSpendResult } from '../utils/calculations';
import { formatIDR } from '../utils/currency';
import { ShieldCheck, ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react-native';
import { BorderRadius, Spacing } from '../constants/theme';

interface SafeToSpendCardProps {
  safeToSpend: SafeToSpendResult;
  onEditReserve?: () => void;
}

export const SafeToSpendCard: React.FC<SafeToSpendCardProps> = ({
  safeToSpend,
  onEditReserve,
}) => {
  const { colors, isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = () => {
    switch (safeToSpend.status) {
      case 'cautious':
        return {
          label: 'Hati-hati',
          color: colors.warning,
          bg: colors.warningBackground,
        };
      case 'depleted':
        return {
          label: 'Mepet / Habis',
          color: colors.expense,
          bg: colors.expenseBackground,
        };
      case 'comfortable':
      default:
        return {
          label: 'Aman Dibelanjakan',
          color: colors.primary,
          bg: isDark ? 'rgba(57, 217, 138, 0.15)' : colors.primarySoft,
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <SurfaceCard style={styles.card} highlight={safeToSpend.status === 'comfortable'}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <ShieldCheck size={20} color={badge.color} strokeWidth={2.2} />
          <Text style={[styles.title, { color: colors.text }]}>Safe to Spend</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.color }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>

      <View style={styles.amountSection}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatIDR(safeToSpend.safeToSpend, true)}
        </Text>
        <Text style={[styles.dailyText, { color: colors.textSecondary }]}>
          Maksimal {formatIDR(safeToSpend.dailySafeToSpend, true)} / hari
        </Text>
      </View>

      <TouchableOpacity
        style={styles.expandToggle}
        activeOpacity={0.7}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={[styles.toggleText, { color: colors.primary }]}>
          {isExpanded ? 'Sembunyikan Rincian' : 'Lihat Rumus & Rincian'}
        </Text>
        {isExpanded ? (
          <ChevronUp size={16} color={colors.primary} />
        ) : (
          <ChevronDown size={16} color={colors.primary} />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={[styles.breakdown, { borderTopColor: colors.border }]}>
          <Text style={[styles.formulaNote, { color: colors.textMuted }]}>
            Rumus: Saldo Riil - Tagihan Mendatang - Dana Cadangan - Tabungan Terencana
          </Text>

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
              Saldo Kas Tersedia
            </Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>
              {formatIDR(safeToSpend.currentBalance)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
              Tagihan & Langganan Rutin
            </Text>
            <Text style={[styles.rowValue, { color: colors.expense }]}>
              -{formatIDR(safeToSpend.upcomingBillsTotal)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
              Dana Cadangan (Reserve)
            </Text>
            <Text style={[styles.rowValue, { color: colors.warning }]}>
              -{formatIDR(safeToSpend.reservedFunds)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
              Alokasi Tabungan Bulan Ini
            </Text>
            <Text style={[styles.rowValue, { color: colors.primary }]}>
              -{formatIDR(safeToSpend.plannedSavingsAllocations)}
            </Text>
          </View>

          {onEditReserve && (
            <TouchableOpacity
              style={[styles.editReserveButton, { borderColor: colors.border }]}
              onPress={onEditReserve}
            >
              <Text style={[styles.editReserveText, { color: colors.primary }]}>
                Atur Jumlah Dana Cadangan
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SurfaceCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  amountSection: {
    marginVertical: 4,
  },
  amount: {
    fontSize: 26,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  dailyText: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  breakdown: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  formulaNote: {
    fontSize: 10,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  rowLabel: {
    fontSize: 13,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  editReserveButton: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  editReserveText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
