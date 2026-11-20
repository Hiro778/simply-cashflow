import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '../database/schema';
import { CategoryIcon } from './CategoryIcon';
import { formatIDR } from '../utils/currency';
import { formatReadableDate } from '../utils/dates';
import { useTheme } from '../hooks/useTheme';
import { BorderRadius, Spacing } from '../constants/theme';

interface TransactionItemProps {
  transaction: Transaction;
  categoryIcon?: string;
  categoryColor?: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  categoryIcon = 'Folder',
  categoryColor,
  onPress,
  onLongPress,
}) => {
  const { colors, isDark } = useTheme();
  const isIncome = transaction.type === 'income';
  const amountPrefix = isIncome ? '+' : '-';
  const amountColor = isIncome ? colors.income : colors.expense;
  const iconColor = categoryColor || (isIncome ? colors.income : colors.primary);

  const displayTitle = transaction.merchant || transaction.category_name;
  const displaySubtitle = transaction.merchant
    ? `${transaction.category_name}${transaction.description ? ` • ${transaction.description}` : ''}`
    : transaction.description || '';

  const hasSourceBadge = transaction.source && transaction.source !== 'manual';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#FFFFFF',
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.leftSection}>
        <CategoryIcon
          name={categoryIcon}
          color={iconColor}
          size={20}
        />
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.categoryTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {displayTitle}
            </Text>
            {hasSourceBadge && (
              <View
                style={[
                  styles.sourceBadge,
                  {
                    backgroundColor: isDark
                      ? 'rgba(57, 217, 138, 0.12)'
                      : colors.primarySoft,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.sourceBadgeText, { color: colors.primary }]}>
                  {transaction.source}
                </Text>
              </View>
            )}
          </View>

          {displaySubtitle ? (
            <Text
              style={[styles.description, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {displaySubtitle}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {formatReadableDate(transaction.date)}
            </Text>
            {transaction.time ? (
              <Text style={[styles.date, { color: colors.textMuted }]}>
                {' '}• {transaction.time}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text
          style={[
            styles.amount,
            { color: amountColor },
          ]}
        >
          {amountPrefix}{formatIDR(transaction.amount, true)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    marginBottom: 8,
    borderWidth: 1,
    minHeight: 64,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  sourceBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  sourceBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  date: {
    fontSize: 11,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
