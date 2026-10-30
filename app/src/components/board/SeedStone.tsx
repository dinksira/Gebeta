import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SEED_COLORS } from '../../theme';

interface SeedStoneProps {
  index: number;
  size: number;
  style?: ViewStyle;
}

export const SeedStone: React.FC<SeedStoneProps> = ({ index, size, style }) => {
  const color = SEED_COLORS[index % SEED_COLORS.length];

  return (
    <View
      style={[
        styles.stone,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    >
      <View style={[styles.highlight, { width: size * 0.4, height: size * 0.4 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  stone: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  highlight: {
    position: 'absolute',
    top: '15%',
    left: '15%',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 999,
  },
});
