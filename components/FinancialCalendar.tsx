import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Transaction } from '../database/schema';
import { formatIDR } from '../utils/currency';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react-native';
import { BorderRadius, Spacing } from '../constants/theme';

interface FinancialCalendarProps {
  transactions: Transaction[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const FinancialCalendar: React.FC<FinancialCalendarProps> = ({
  transactions,
  selectedDate,
  onSelectDate,
}) => {
  const { colors, isDark } = useTheme();

  // Active month in calendar
  const [currentDate, setCurrentDate] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Daily map of cashflow
  const dailyCashflow = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    for (const t of transactions) {
      if (!map[t.date]) {
        map[t.date] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        map[t.date].income += t.amount;
      } else {
        map[t.date].expense += t.amount;
      }
    }
    return map;
  }, [transactions]);

  // Calendar grid calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: ({ day: number; dateStr: string; isCurrentMonth: boolean } | null)[] = [];

    // Leading blanks
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    for (let d = 1; d <= totalDays; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      days.push({
        day: d,
        dateStr: `${year}-${mStr}-${dStr}`,
        isCurrentMonth: true,
      });
    }

    return days;
  }, [year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const weekLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Month Navigator Header */}
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <CalendarIcon size={18} color={colors.primary} />
          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {monthNames[month]} {year}
          </Text>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, { borderColor: colors.border }]}
            onPress={handlePrevMonth}
          >
            <ChevronLeft size={16} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtn, { borderColor: colors.border }]}
            onPress={handleNextMonth}
          >
            <ChevronRight size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekday Row */}
      <View style={styles.weekRow}>
        {weekLabels.map((lbl, idx) => (
          <Text
            key={lbl}
            style={[
              styles.weekLabel,
              { color: idx === 0 ? colors.expense : colors.textMuted },
            ]}
          >
            {lbl}
          </Text>
        ))}
      </View>

      {/* Day Cells Grid */}
      <View style={styles.grid}>
        {calendarDays.map((item, idx) => {
          if (!item) {
            return <View key={`blank-${idx}`} style={styles.cell} />;
          }

          const isSelected = item.dateStr === selectedDate;
          const flow = dailyCashflow[item.dateStr];
          const hasIncome = flow && flow.income > 0;
          const hasExpense = flow && flow.expense > 0;

          return (
            <TouchableOpacity
              key={item.dateStr}
              style={[
                styles.cell,
                isSelected && [
                  styles.selectedCell,
                  { backgroundColor: isDark ? 'rgba(57, 217, 138, 0.2)' : colors.primarySoft, borderColor: colors.primary },
                ],
              ]}
              onPress={() => onSelectDate(item.dateStr)}
            >
              <Text
                style={[
                  styles.dayNum,
                  { color: isSelected ? colors.primary : colors.text },
                  isSelected && { fontWeight: '700' },
                ]}
              >
                {item.day}
              </Text>

              {/* Indicator dots */}
              <View style={styles.dotsRow}>
                {hasIncome && (
                  <View style={[styles.dot, { backgroundColor: colors.income }]} />
                )}
                {hasExpense && (
                  <View style={[styles.dot, { backgroundColor: colors.expense }]} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    gap: 6,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
  },
  weekLabel: {
    width: 38,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
    marginVertical: 1,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCell: {},
  dayNum: {
    fontSize: 13,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
    height: 5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
