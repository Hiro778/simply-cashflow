import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Briefcase,
  Laptop,
  Store,
  TrendingUp,
  PlusCircle,
  Utensils,
  Car,
  ShoppingBag,
  GraduationCap,
  Film,
  Receipt,
  HeartPulse,
  HelpCircle,
  Target,
  CircleDot,
  PieChart,
  Folder,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react-native';

const iconMap: Record<string, React.ComponentType<any>> = {
  Briefcase,
  Laptop,
  Store,
  TrendingUp,
  PlusCircle,
  Utensils,
  Car,
  ShoppingBag,
  GraduationCap,
  Film,
  Receipt,
  HeartPulse,
  HelpCircle,
  Target,
  PieChart,
  Folder,
  ArrowUpRight,
  ArrowDownLeft,
};

interface CategoryIconProps {
  name: string;
  color?: string;
  size?: number;
  backgroundColor?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  color = '#35D07F',
  size = 20,
  backgroundColor,
}) => {
  const IconComponent = iconMap[name] || CircleDot;
  const bg = backgroundColor || `${color}20`;

  return (
    <View
      style={[
        styles.container,
        {
          width: size * 1.8,
          height: size * 1.8,
          borderRadius: (size * 1.8) / 2,
          backgroundColor: bg,
        },
      ]}
    >
      <IconComponent size={size} color={color} strokeWidth={2.2} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
