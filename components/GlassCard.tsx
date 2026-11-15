import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  highlight?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, highlight }) => {
  return (
    <View
      style={[
        styles.card,
        highlight && styles.cardHighlight,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    padding: Spacing.md,
    // Subtle Android elevation & shadow
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  cardHighlight: {
    borderColor: 'rgba(53, 208, 127, 0.35)',
    backgroundColor: '#12221A',
  },
});
