import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme';

interface CulturalBandProps {
  style?: ViewStyle;
}

export const CulturalBand: React.FC<CulturalBandProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.stripePrimary} />
      <View style={styles.stripeAccent} />
      <View style={styles.stripeSecondary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 6,
    width: '100%',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  stripePrimary: {
    flex: 1,
    backgroundColor: colors.forest,
  },
  stripeAccent: {
    flex: 1,
    backgroundColor: colors.saffron,
  },
  stripeSecondary: {
    flex: 1,
    backgroundColor: colors.terracotta,
  },
});
