import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface StatusBannerProps {
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'danger';
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  message,
  variant = 'info',
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'danger':
        return colors.danger;
      case 'info':
      default:
        return colors.woodMid;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.space2,
    paddingHorizontal: spacing.space4,
    borderRadius: radius.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.space2,
  },
  text: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.primaryBold,
    color: colors.textOnWood,
    textAlign: 'center',
  },
});
