import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../hooks/useAppStore';
import { useTheme } from '../../hooks/useTheme';
import { SavingsGoal, SavingsContribution } from '../../database/schema';
import { SurfaceCard } from '../../components/SurfaceCard';
import { CircularProgress } from '../../components/CircularProgress';
import { SavingsGoalModal } from '../../components/SavingsGoalModal';
import { SavingsContributionModal } from '../../components/SavingsContributionModal';
import { CategoryIcon } from '../../components/CategoryIcon';
import { formatIDR } from '../../utils/currency';
import { formatReadableDate, getDaysRemaining } from '../../utils/dates';
import {
  Target,
  Plus,
  PlusCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Award,
  MoreVertical,
} from 'lucide-react-native';
import { BorderRadius, Spacing } from '../../constants/theme';
import { getContributionsForGoal } from '../../database/repositories/savingsRepository';

export default function GoalsScreen() {
  const { colors, isDark } = useTheme();
  const {
    savingsGoals,
    refresh,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addSavingsContribution,
  } = useAppStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [isContribModalVisible, setIsContribModalVisible] = useState(false);
  const [selectedGoalForContrib, setSelectedGoalForContrib] = useState<SavingsGoal | null>(null);

  // Contributions drawer / view state
  const [selectedGoalDetail, setSelectedGoalDetail] = useState<SavingsGoal | null>(null);
  const [goalContributions, setGoalContributions] = useState<SavingsContribution[]>([]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const filteredGoals = savingsGoals.filter(({ goal }) => {
    if (activeTab === 'completed') return goal.status === 'completed';
    return goal.status !== 'completed' && goal.status !== 'archived';
  });

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.goal.current_amount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.goal.target_amount, 0);
  const overallPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleOpenContrib = (goal: SavingsGoal) => {
    setSelectedGoalForContrib(goal);
    setIsContribModalVisible(true);
  };

  const handleViewDetails = async (goal: SavingsGoal) => {
    const list = await getContributionsForGoal(goal.id);
    setSelectedGoalDetail(goal);
    setGoalContributions(list);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Target Impian & Tabungan</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Savings Planner 2.0
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              setEditingGoal(null);
              setIsGoalModalVisible(true);
            }}
          >
            <Plus size={18} color={isDark ? '#080F0C' : '#FFFFFF'} strokeWidth={2.5} />
            <Text style={[styles.addBtnText, { color: isDark ? '#080F0C' : '#FFFFFF' }]}>
              Target Baru
            </Text>
          </TouchableOpacity>
        </View>

        {/* Aggregate Overview Card */}
        <SurfaceCard style={styles.summaryCard} highlight>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Total Dana Terkumpul
              </Text>
              <Text style={[styles.summaryAmount, { color: colors.text }]}>
                {formatIDR(totalSaved, true)}
              </Text>
              <Text style={[styles.summaryTarget, { color: colors.textMuted }]}>
                dari target total {formatIDR(totalTarget, true)}
              </Text>
            </View>

            <CircularProgress
              size={64}
              strokeWidth={6}
              progress={overallPercentage}
              label={`${overallPercentage}%`}
              color={colors.primary}
            />
          </View>
        </SurfaceCard>

        {/* Tab Switcher: Berjalan vs Selesai */}
        <View style={[styles.tabBar, { backgroundColor: isDark ? colors.surfaceElevated : colors.primarySoft }]}>
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'active' && [
                styles.tabItemActive,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ],
            ]}
            onPress={() => setActiveTab('active')}
          >
            <Text
              style={[
                styles.tabItemText,
                { color: activeTab === 'active' ? colors.primary : colors.textSecondary },
                activeTab === 'active' && { fontWeight: '700' },
              ]}
            >
              Aktif ({savingsGoals.filter((g) => g.goal.status !== 'completed').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'completed' && [
                styles.tabItemActive,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ],
            ]}
            onPress={() => setActiveTab('completed')}
          >
            <Text
              style={[
                styles.tabItemText,
                { color: activeTab === 'completed' ? colors.primary : colors.textSecondary },
                activeTab === 'completed' && { fontWeight: '700' },
              ]}
            >
              Tercapai ({savingsGoals.filter((g) => g.goal.status === 'completed').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Goals List */}
        {filteredGoals.length === 0 ? (
          <SurfaceCard style={styles.emptyCard}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {activeTab === 'active'
                ? 'Belum Ada Target Aktif'
                : 'Belum Ada Target yang Selesai'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Mulai buat target impian Anda untuk menghitung alokasi harian dan bulanan secara otomatis.
            </Text>
          </SurfaceCard>
        ) : (
          filteredGoals.map(({ goal, metrics, daysRemaining }) => {
            const isCompleted = goal.status === 'completed';
            const { milestones } = metrics;

            return (
              <SurfaceCard key={goal.id} style={styles.goalCard}>
                {/* Goal Top Header */}
                <View style={styles.goalHeader}>
                  <View style={styles.goalLeft}>
                    <CategoryIcon
                      name={goal.icon || 'Target'}
                      color={goal.color || colors.primary}
                      size={22}
                    />
                    <View style={styles.goalTitleWrap}>
                      <Text style={[styles.goalName, { color: colors.text }]}>
                        {goal.name}
                      </Text>
                      <Text style={[styles.goalTargetDate, { color: colors.textMuted }]}>
                        Target: {formatReadableDate(goal.target_date)} ({daysRemaining} hari lagi)
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setEditingGoal(goal);
                      setIsGoalModalVisible(true);
                    }}
                    style={styles.editBtn}
                  >
                    <MoreVertical size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Amount Progress */}
                <View style={styles.progressRow}>
                  <View style={styles.progressAmounts}>
                    <Text style={[styles.currentAmount, { color: colors.primary }]}>
                      {formatIDR(goal.current_amount)}
                    </Text>
                    <Text style={[styles.targetAmount, { color: colors.textSecondary }]}>
                      / {formatIDR(goal.target_amount)}
                    </Text>
                  </View>
                  <Text style={[styles.percentBadge, { color: colors.text }]}>
                    {metrics.percentage}%
                  </Text>
                </View>

                {/* Progress Bar with Milestone Markers */}
                <View style={[styles.trackWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
                  <View
                    style={[
                      styles.trackFill,
                      {
                        width: `${metrics.percentage}%`,
                        backgroundColor: goal.color || colors.primary,
                      },
                    ]}
                  />
                  {/* 25%, 50%, 75% markers */}
                  <View style={[styles.milestoneMarker, { left: '25%' }]} />
                  <View style={[styles.milestoneMarker, { left: '50%' }]} />
                  <View style={[styles.milestoneMarker, { left: '75%' }]} />
                </View>

                {/* Milestone Indicators */}
                <View style={styles.milestonesRow}>
                  <View style={styles.milestoneBadge}>
                    <Award size={12} color={milestones.milestone25 ? colors.primary : colors.textMuted} />
                    <Text style={[styles.milestoneText, { color: milestones.milestone25 ? colors.primary : colors.textMuted }]}>
                      25%
                    </Text>
                  </View>
                  <View style={styles.milestoneBadge}>
                    <Award size={12} color={milestones.milestone50 ? colors.primary : colors.textMuted} />
                    <Text style={[styles.milestoneText, { color: milestones.milestone50 ? colors.primary : colors.textMuted }]}>
                      50%
                    </Text>
                  </View>
                  <View style={styles.milestoneBadge}>
                    <Award size={12} color={milestones.milestone75 ? colors.primary : colors.textMuted} />
                    <Text style={[styles.milestoneText, { color: milestones.milestone75 ? colors.primary : colors.textMuted }]}>
                      75%
                    </Text>
                  </View>
                  <View style={styles.milestoneBadge}>
                    <Award size={12} color={milestones.milestone100 ? colors.primary : colors.textMuted} />
                    <Text style={[styles.milestoneText, { color: milestones.milestone100 ? colors.primary : colors.textMuted }]}>
                      100%
                    </Text>
                  </View>
                </View>

                {/* Savings Pace Estimates */}
                {!isCompleted && (
                  <View style={[styles.paceBox, { backgroundColor: isDark ? colors.surfaceElevated : '#F9FBF9', borderColor: colors.border }]}>
                    <View style={styles.paceCol}>
                      <Text style={[styles.paceLabel, { color: colors.textMuted }]}>Per Hari</Text>
                      <Text style={[styles.paceVal, { color: colors.text }]}>
                        {formatIDR(metrics.requiredDaily)}
                      </Text>
                    </View>
                    <View style={styles.paceCol}>
                      <Text style={[styles.paceLabel, { color: colors.textMuted }]}>Per Minggu</Text>
                      <Text style={[styles.paceVal, { color: colors.text }]}>
                        {formatIDR(metrics.requiredWeekly)}
                      </Text>
                    </View>
                    <View style={styles.paceCol}>
                      <Text style={[styles.paceLabel, { color: colors.textMuted }]}>Per Bulan</Text>
                      <Text style={[styles.paceVal, { color: colors.text }]}>
                        {formatIDR(metrics.requiredMonthly)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Bottom Actions */}
                <View style={[styles.cardBottomRow, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    style={styles.detailLink}
                    onPress={() => handleViewDetails(goal)}
                  >
                    <Text style={[styles.detailLinkText, { color: colors.textSecondary }]}>
                      Riwayat Setoran
                    </Text>
                    <ChevronRight size={14} color={colors.textSecondary} />
                  </TouchableOpacity>

                  {!isCompleted && (
                    <TouchableOpacity
                      style={[styles.depositBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleOpenContrib(goal)}
                    >
                      <PlusCircle size={15} color={isDark ? '#080F0C' : '#FFFFFF'} />
                      <Text style={[styles.depositBtnText, { color: isDark ? '#080F0C' : '#FFFFFF' }]}>
                        Setor Tabungan
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </SurfaceCard>
            );
          })
        )}

        {/* Contributions History Drawer / Modal view */}
        {selectedGoalDetail && (
          <SurfaceCard style={styles.historyDrawer}>
            <View style={styles.drawerHeader}>
              <View>
                <Text style={[styles.drawerTitle, { color: colors.text }]}>
                  Riwayat: {selectedGoalDetail.name}
                </Text>
                <Text style={[styles.drawerSubtitle, { color: colors.textSecondary }]}>
                  {goalContributions.length} kali setoran
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedGoalDetail(null)}>
                <Text style={[styles.closeDrawer, { color: colors.primary }]}>Tutup</Text>
              </TouchableOpacity>
            </View>

            {goalContributions.length === 0 ? (
              <Text style={[styles.emptyHistory, { color: colors.textMuted }]}>
                Belum ada catatan setoran tabungan untuk target ini.
              </Text>
            ) : (
              goalContributions.map((c) => (
                <View key={c.id} style={[styles.contribRow, { borderBottomColor: colors.border }]}>
                  <View>
                    <Text style={[styles.contribDate, { color: colors.text }]}>
                      {formatReadableDate(c.date)}
                    </Text>
                    {c.note ? (
                      <Text style={[styles.contribNote, { color: colors.textMuted }]}>
                        {c.note}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[styles.contribAmount, { color: colors.primary }]}>
                    +{formatIDR(c.amount)}
                  </Text>
                </View>
              ))
            )}
          </SurfaceCard>
        )}
      </ScrollView>

      {/* Goal Create/Edit Modal */}
      <SavingsGoalModal
        visible={isGoalModalVisible}
        onClose={() => setIsGoalModalVisible(false)}
        initialGoal={editingGoal}
        onSave={async (g) => {
          if (editingGoal) {
            await updateSavingsGoal({ ...g, id: editingGoal.id });
          } else {
            await addSavingsGoal(g);
          }
        }}
        onDelete={async (id) => {
          await deleteSavingsGoal(id);
        }}
      />

      {/* Contribution Modal */}
      <SavingsContributionModal
        visible={isContribModalVisible}
        onClose={() => setIsContribModalVisible(false)}
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
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: BorderRadius.md,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  summaryCard: {
    marginVertical: Spacing.sm,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  summaryTarget: {
    fontSize: 11,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 4,
    marginVertical: 10,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabItemActive: {},
  tabItemText: {
    fontSize: 13,
  },
  goalCard: {
    marginVertical: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalTitleWrap: {
    marginLeft: 10,
    flex: 1,
  },
  goalName: {
    fontSize: 15,
    fontWeight: '700',
  },
  goalTargetDate: {
    fontSize: 11,
    marginTop: 2,
  },
  editBtn: {
    padding: 4,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  progressAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currentAmount: {
    fontSize: 17,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  targetAmount: {
    fontSize: 13,
    marginLeft: 4,
  },
  percentBadge: {
    fontSize: 14,
    fontWeight: '700',
  },
  trackWrap: {
    height: 8,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 4,
  },
  milestoneMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  milestonesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  milestoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  milestoneText: {
    fontSize: 11,
    fontWeight: '600',
  },
  paceBox: {
    flexDirection: 'row',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 12,
  },
  paceCol: {
    flex: 1,
    alignItems: 'center',
  },
  paceLabel: {
    fontSize: 10,
  },
  paceVal: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLinkText: {
    fontSize: 12,
    fontWeight: '600',
  },
  depositBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
  },
  depositBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  historyDrawer: {
    marginTop: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  drawerSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  closeDrawer: {
    fontSize: 12,
    fontWeight: '700',
  },
  contribRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  contribDate: {
    fontSize: 13,
    fontWeight: '600',
  },
  contribNote: {
    fontSize: 11,
    marginTop: 2,
  },
  contribAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  emptyHistory: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 12,
  },
  emptyCard: {
    paddingVertical: 32,
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
