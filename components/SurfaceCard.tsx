import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { BorderRadius, Spacing } from '../constants/theme';

interface SurfaceCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  highlight?: boolean;
  elevated?: boolean;
  glass?: boolean;
}

export const SurfaceCard: React.FC<SurfaceCardProps> = ({
  children,
  style,
  highlight,
  elevated,
  glass,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: glass
            ? colors.glassSurface
            : elevated
            ? colors.surfaceElevated
            : colors.surface,
          borderColor: highlight
            ? colors.primary
            : glass
            ? colors.glassBorder
            : colors.cardBorder,
        },
        highlight && {
          backgroundColor: isDark ? 'rgba(57, 217, 138, 0.08)' : 'rgba(22, 134, 83, 0.06)',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// Backwards-compatible alias for existing code
export const GlassCard = SurfaceCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
});
