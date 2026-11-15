import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '../database/schema';
import { CategoryIcon } from './CategoryIcon';
import { formatIDR } from '../utils/currency';
import { formatReadableDate } from '../utils/dates';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

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
  categoryColor = Colors.primary,
  onPress,
  onLongPress,
}) => {
  const isIncome = transaction.type === 'income';
  const amountPrefix = isIncome ? '+' : '-';
  const amountColor = isIncome ? Colors.income : Colors.expense;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.container}
    >
      <View style={styles.leftSection}>
        <CategoryIcon
          name={categoryIcon}
          color={categoryColor}
          size={20}
        />
        <View style={styles.info}>
          <Text style={styles.categoryTitle} numberOfLines={1}>
            {transaction.category_name}
          </Text>
          {transaction.description ? (
            <Text style={styles.description} numberOfLines={1}>
              {transaction.description}
            </Text>
          ) : null}
          <Text style={styles.date}>
            {formatReadableDate(transaction.date)}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={[styles.amount, { color: amountColor }]}>
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
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BorderRadius.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
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
  categoryTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  date: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
