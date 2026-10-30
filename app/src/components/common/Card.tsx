import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, elevations, radius, spacing } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'surface' | 'wood' | 'alt';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'surface',
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'wood':
        return colors.woodMid;
      case 'alt':
        return colors.surfaceAlt;
      case 'surface':
      default:
        return colors.surface;
    }
  };

  return (
    <View
      style={[
        styles.card,
        elevations.card,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: variant === 'wood' ? colors.woodDark : colors.border,
          borderWidth: variant === 'wood' ? 2 : 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.radiusLg,
    padding: spacing.space4,
  },
});
