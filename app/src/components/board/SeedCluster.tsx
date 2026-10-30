import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SeedStone } from './SeedStone';
import { typography, colors } from '../../theme';

/**
 * Normalized (x, y) coordinates (-1.0 to 1.0) for up to 12 seeds in a pit.
 */
export const SEED_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25],  // Seeds 1-4
  [0.0, 0.0],     [-0.45, 0.0],  [0.45, 0.0],   [0.0, -0.45],  // Seeds 5-8
  [0.0, 0.45],    [-0.35, -0.35],[0.35, -0.35], [-0.35, 0.35], // Seeds 9-12
];

interface SeedClusterProps {
  count: number;
  pitSize: number;
  seedSize: number;
}

export const SeedCluster: React.FC<SeedClusterProps> = ({ count, pitSize, seedSize }) => {
  const displayCount = Math.min(count, 12);
  const radius = (pitSize - seedSize) / 2.5;

  return (
    <View style={[styles.container, { width: pitSize, height: pitSize }]}>
      {Array.from({ length: displayCount }).map((_, i) => {
        const [offsetX, offsetY] = SEED_OFFSETS[i] ?? [0, 0];
        return (
          <SeedStone
            key={i}
            index={i}
            size={seedSize}
            style={{
              transform: [
                { translateX: offsetX * radius },
                { translateY: offsetY * radius },
              ],
            }}
          />
        );
      })}
      
      {count > 12 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 10,
  },
  badgeText: {
    color: colors.textOnWood,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: typography.fontFamily.primary,
  },
});
