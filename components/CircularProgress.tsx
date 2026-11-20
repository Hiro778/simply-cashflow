import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0 to 100
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size,
  strokeWidth,
  progress,
  color,
  trackColor,
  label,
  sublabel,
}) => {
  const { colors, isDark } = useTheme();
  const activeColor = color || colors.primary;
  const activeTrackColor =
    trackColor || (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(23, 35, 29, 0.08)');

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background Track Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={activeTrackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          originX={size / 2}
          originY={size / 2}
          rotation="-90"
        />
      </Svg>
      {(label || sublabel) && (
        <View style={styles.centerTextContainer}>
          {label && (
            <Text style={[styles.labelText, { color: activeColor }]}>
              {label}
            </Text>
          )}
          {sublabel && (
            <Text style={[styles.sublabelText, { color: colors.textSecondary }]}>
              {sublabel}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sublabelText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
});
