import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../hooks/useAppStore';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { GlassCard } from '../../components/GlassCard';
import { CircularProgress } from '../../components/CircularProgress';
import { CategoryIcon } from '../../components/CategoryIcon';
import { SavingsGoalModal } from '../../components/SavingsGoalModal';
import { SavingsContributionModal } from '../../components/SavingsContributionModal';
import { SavingsGoal } from '../../database/schema';
import { formatIDR, parseIDR } from '../../utils/currency';
import { formatReadableDate } from '../../utils/dates';
import { calculateSavingsMetrics } from '../../utils/calculations';
import {
  Plus,
  Calculator,
  PlusCircle,
  Clock,
  Sparkles,
} from 'lucide-react-native';

export default function SavingsScreen() {
  const {
    savingsGoals,
    refresh,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addSavingsContribution,
  } = useAppStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [selectedGoalForContrib, setSelectedGoalForContrib] = useState<SavingsGoal | null>(null);

  // Standalone Calculator state
  const [calcTargetRaw, setCalcTargetRaw] = useState('10000000');
  const [calcMonthsRaw, setCalcMonthsRaw] = useState('6');

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const handleOpenAddGoal = () => {
    setEditingGoal(null);
    setIsGoalModalVisible(true);
  };

  const handleOpenEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsGoalModalVisible(true);
  };

  const totalTargetAll = savingsGoals.reduce((sum, g) => sum + g.goal.target_amount, 0);
  const totalSavedAll = savingsGoals.reduce((sum, g) => sum + g.goal.current_amount, 0);
  const totalPercentage = totalTargetAll > 0 ? Math.min(100, Math.round((totalSavedAll / totalTargetAll) * 100)) : 0;

  // Calculator computations
  const targetNum = parseIDR(calcTargetRaw);
  const monthsNum = Math.max(1, parseInt(calcMonthsRaw, 10) || 1);
  const calcMetrics = calculateSavingsMetrics(targetNum, 0, monthsNum * 30);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Rencana Tabungan</Text>
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAddGoal}>
            <Plus size={18} color="#080D0B" strokeWidth={2.5} />
            <Text style={styles.addBtnText}>Target Baru</Text>
          </TouchableOpacity>
        </View>

        {/* Global Progress Card */}
        <GlassCard style={styles.heroCard} highlight>
          <View style={styles.heroRow}>
            <View style={styles.heroTextCol}>
              <Text style={styles.heroLabel}>Total Akumulasi Tabungan</Text>
              <Text style={styles.heroAmount}>{formatIDR(totalSavedAll)}</Text>
              <Text style={styles.heroTarget}>
                dari target total {formatIDR(totalTargetAll)}
              </Text>
            </View>

            <CircularProgress
              size={80}
              strokeWidth={9}
              progress={totalPercentage}
              color={Colors.primary}
              label={`${totalPercentage}%`}
            />
          </View>
        </GlassCard>

        {/* Savings Goals List */}
        <Text style={styles.sectionHeader}>Daftar Target Impian</Text>

        {savingsGoals.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Belum Ada Target Impian</Text>
            <Text style={styles.emptyDesc}>
              Wujudkan tujuan finansial Anda: beli gadget, dana darurat, atau liburan.
              Tekan "Target Baru" untuk memulai.
            </Text>
          </GlassCard>
        ) : (
          savingsGoals.map(({ goal, metrics, daysRemaining }) => (
            <GlassCard key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={styles.goalTitleRow}>
                  <CategoryIcon
                    name={goal.icon || 'Target'}
                    color={goal.color || Colors.primary}
                    size={22}
                  />
                  <View style={styles.goalTitleInfo}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalTargetDate}>
                      Target: {formatReadableDate(goal.target_date)} ({daysRemaining} hari lagi)
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleOpenEditGoal(goal)}
                  style={styles.editBtn}
                >
                  <Text style={styles.editBtnText}>Ubah</Text>
                </TouchableOpacity>
              </View>

              {/* Progress & Amounts */}
              <View style={styles.goalProgressSection}>
                <View style={styles.progressAmountsRow}>
                  <Text style={styles.currentAmountText}>
                    {formatIDR(goal.current_amount)}
                  </Text>
                  <Text style={styles.targetAmountText}>
                    {formatIDR(goal.target_amount)}
                  </Text>
                </View>

                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${metrics.percentage}%`,
                        backgroundColor: goal.color || Colors.primary,
                      },
                    ]}
                  />
                </View>

                <View style={styles.progressFooterRow}>
                  <Text style={styles.progressPercentText}>
                    {metrics.percentage}% Tercapai
                  </Text>
                  <Text style={styles.remainingAmountText}>
                    Sisa: {formatIDR(metrics.remainingAmount)}
                  </Text>
                </View>
              </View>

              {/* Savings Estimations */}
              {metrics.remainingAmount > 0 && (
                <View style={styles.estimationBox}>
                  <View style={styles.estItem}>
                    <Text style={styles.estLabel}>Harian</Text>
                    <Text style={styles.estValue}>
                      {formatIDR(metrics.requiredDaily)}
                    </Text>
                  </View>
                  <View style={styles.estDivider} />
                  <View style={styles.estItem}>
                    <Text style={styles.estLabel}>Mingguan</Text>
                    <Text style={styles.estValue}>
                      {formatIDR(metrics.requiredWeekly)}
                    </Text>
                  </View>
                  <View style={styles.estDivider} />
                  <View style={styles.estItem}>
                    <Text style={styles.estLabel}>Bulanan</Text>
                    <Text style={styles.estValue}>
                      {formatIDR(metrics.requiredMonthly)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Deposit Button */}
              <TouchableOpacity
                style={[
                  styles.depositBtn,
                  { backgroundColor: `${goal.color || Colors.primary}20` },
                ]}
                onPress={() => setSelectedGoalForContrib(goal)}
              >
                <PlusCircle
                  size={16}
                  color={goal.color || Colors.primary}
                />
                <Text
                  style={[
                    styles.depositBtnText,
                    { color: goal.color || Colors.primary },
                  ]}
                >
                  Setor Tabungan
                </Text>
              </TouchableOpacity>
            </GlassCard>
          ))
        )}

        {/* Standalone Savings Calculator */}
        <GlassCard style={styles.calcCard}>
          <View style={styles.calcHeader}>
            <Calculator size={18} color={Colors.primary} />
            <Text style={styles.calcTitle}>Kalkulator Estimasi Tabungan</Text>
          </View>
          <Text style={styles.calcDesc}>
            Hitung alokasi tabungan harian, mingguan, dan bulanan untuk nominal impian Anda.
          </Text>

          <View style={styles.calcInputsRow}>
            <View style={styles.calcInputCol}>
              <Text style={styles.calcInputLabel}>Target (Rp)</Text>
              <TextInput
                style={styles.calcInput}
                value={formatIDR(parseIDR(calcTargetRaw), false)}
                onChangeText={(t) => setCalcTargetRaw(parseIDR(t).toString())}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.calcInputColSmall}>
              <Text style={styles.calcInputLabel}>Durasi (Bulan)</Text>
              <TextInput
                style={styles.calcInput}
                value={calcMonthsRaw}
                onChangeText={setCalcMonthsRaw}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.calcResults}>
            <View style={styles.calcResultItem}>
              <Text style={styles.calcResLabel}>Nabung Tiap Hari</Text>
              <Text style={styles.calcResValue}>{formatIDR(calcMetrics.requiredDaily)}</Text>
            </View>
            <View style={styles.calcResultItem}>
              <Text style={styles.calcResLabel}>Nabung Tiap Minggu</Text>
              <Text style={styles.calcResValue}>{formatIDR(calcMetrics.requiredWeekly)}</Text>
            </View>
            <View style={styles.calcResultItem}>
              <Text style={styles.calcResLabel}>Nabung Tiap Bulan</Text>
              <Text style={styles.calcResValueHighlight}>
                {formatIDR(calcMetrics.requiredMonthly)}
              </Text>
            </View>
          </View>
        </GlassCard>
      </ScrollView>

      {/* Goal Modal */}
      <SavingsGoalModal
        visible={isGoalModalVisible}
        onClose={() => setIsGoalModalVisible(false)}
        initialGoal={editingGoal}
        onSave={async (goal) => {
          if (editingGoal) {
            await updateSavingsGoal(goal);
          } else {
            await addSavingsGoal(goal);
          }
        }}
        onDelete={async (id) => {
          await deleteSavingsGoal(id);
        }}
      />

      {/* Contribution Modal */}
      <SavingsContributionModal
        visible={!!selectedGoalForContrib}
        onClose={() => setSelectedGoalForContrib(null)}
        goal={selectedGoalForContrib}
        onAddContribution={async (goalId, amount, date, note) => {
          await addSavingsContribution(goalId, amount, date, note);
        }}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  addBtnText: {
    color: '#080D0B',
    fontWeight: '700',
    fontSize: 13,
  },
  heroCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextCol: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  heroTarget: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  goalCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  goalTitleInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  goalTargetDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editBtnText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  goalProgressSection: {
    marginBottom: Spacing.md,
  },
  progressAmountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  currentAmountText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  targetAmountText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  track: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressPercentText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  remainingAmountText: {
    fontSize: 11,
    color: Colors.warning,
    fontWeight: '600',
  },
  estimationBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  estItem: {
    alignItems: 'center',
  },
  estDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  estLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  estValue: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  depositBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  depositBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  calcCard: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    padding: Spacing.md,
  },
  calcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  calcTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  calcDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: Spacing.md,
  },
  calcInputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.md,
  },
  calcInputCol: {
    flex: 2,
  },
  calcInputColSmall: {
    flex: 1,
  },
  calcInputLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  calcInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  calcResults: {
    backgroundColor: 'rgba(53, 208, 127, 0.08)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(53, 208, 127, 0.2)',
  },
  calcResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calcResLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  calcResValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  calcResValueHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
});
