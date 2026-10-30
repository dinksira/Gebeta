import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, typography } from '../../theme';
import { SeedCluster } from './SeedCluster';

interface StoreProps {
  count: number;
  width: number;
  height: number;
  label: string;
  isExtraTurn?: boolean;
}

export const Store: React.FC<StoreProps> = ({
  count,
  width,
  height,
  label,
  isExtraTurn = false,
}) => {
  return (
    <View
      style={[
        styles.store,
        {
          width,
          height,
          borderColor: isExtraTurn ? colors.saffron : colors.woodDark,
          borderWidth: isExtraTurn ? 3 : 2,
        },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.content}>
        <SeedCluster count={count} pitSize={width * 0.7} seedSize={10} />
      </View>
      <View style={styles.scoreBadge}>
        <Text style={styles.scoreText}>{count}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  store: {
    backgroundColor: colors.pitDeep,
    borderRadius: radius.radiusLg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 10,
    fontFamily: typography.fontFamily.primaryBold,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBadge: {
    backgroundColor: colors.woodMid,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.radiusFull,
    marginTop: 4,
  },
  scoreText: {
    color: colors.textOnWood,
    fontSize: typography.size.base,
    fontFamily: typography.fontFamily.primaryBold,
  },
});
