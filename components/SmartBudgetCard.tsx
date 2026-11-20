import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SurfaceCard } from './SurfaceCard';
import { useTheme } from '../hooks/useTheme';
import { SmartBudgetPace } from '../utils/calculations';
import { formatIDR } from '../utils/currency';
import { Gauge, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react-native';
import { Spacing, BorderRadius } from '../constants/theme';

interface SmartBudgetCardProps {
  pace: SmartBudgetPace | null;
  onPressBudget?: () => void;
}

export const SmartBudgetCard: React.FC<SmartBudgetCardProps> = ({ pace }) => {
  const { colors, isDark } = useTheme();

  if (!pace) return null;

  const getPaceStatus = () => {
    switch (pace.status) {
      case 'overspent':
        return {
          title: 'Melebihi Anggaran',
          color: colors.expense,
          desc: `Pengeluaran telah melewati batas anggaran bulanan sebesar ${formatIDR(pace.spent - pace.limit)}.`,
          icon: <AlertTriangle size={18} color={colors.expense} />,
        };
      case 'fast_pace':
        return {
          title: 'Laju Cepat (Waspada)',
          color: colors.warning,
          desc: `Pace belanja (${pace.paceRatio}x) lebih cepat dari kalender. Jaga agar tidak overbudget.`,
          icon: <TrendingUp size={18} color={colors.warning} />,
        };
      case 'under_pace':
        return {
          title: 'Sangat Hemat',
          color: colors.primary,
          desc: `Pengeluaran Anda jauh di bawah target laju harian. Arus kas sangat aman!`,
          icon: <CheckCircle2 size={18} color={colors.primary} />,
        };
      case 'on_track':
      default:
        return {
          title: 'Sesuai Rencana',
          color: colors.primary,
          desc: `Laju pengeluaran stabil dan terkendali menuju akhir bulan.`,
          icon: <CheckCircle2 size={18} color={colors.primary} />,
        };
    }
  };

  const status = getPaceStatus();
  const progressRatio = Math.min(1, pace.spent / Math.max(1, pace.limit));

  return (
    <SurfaceCard style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Gauge size={20} color={status.color} strokeWidth={2.2} />
          <Text style={[styles.title, { color: colors.text }]}>Smart Budget & Pace</Text>
        </View>
        <View style={[styles.badge, { borderColor: status.color }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>{status.title}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.track, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: status.color,
              width: `${Math.round(progressRatio * 100)}%`,
            },
          ]}
        />
      </View>

      <View style={styles.statsRow}>
        <View>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Terpakai</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatIDR(pace.spent)} ({pace.percentage}%)
          </Text>
        </View>

        <View style={styles.alignRight}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Sisa Anggaran</Text>
          <Text style={[styles.statValue, { color: status.color }]}>
            {formatIDR(pace.remaining)}
          </Text>
        </View>
      </View>

      <View style={[styles.paceFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.paceDesc, { color: colors.textSecondary }]}>
          {status.desc}
        </Text>
        <Text style={[styles.allowanceText, { color: colors.textMuted }]}>
          Saran maksimal: <Text style={{ color: colors.text, fontWeight: '700' }}>{formatIDR(pace.recommendedDailyAllowance)}/hari</Text> untuk {pace.daysRemaining} hari ke depan.
        </Text>
      </View>
    </SurfaceCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
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
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  paceFooter: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  paceDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  allowanceText: {
    fontSize: 11,
    marginTop: 4,
  },
});
