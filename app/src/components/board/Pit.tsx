import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, radius, typography } from '../../theme';
import { SeedCluster } from './SeedCluster';

interface PitProps {
  pitIndex: number;
  count: number;
  isLegal: boolean;
  onPress: () => void;
  pitSize: number;
  seedSize: number;
}

export const Pit: React.FC<PitProps> = ({
  count,
  isLegal,
  onPress,
  pitSize,
  seedSize,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={!isLegal}
      onPress={onPress}
      style={[
        styles.pit,
        {
          width: pitSize,
          height: pitSize,
          borderRadius: pitSize / 2,
          borderColor: isLegal ? colors.woodGlow : colors.woodDark,
          borderWidth: isLegal ? 3 : 2,
        },
      ]}
    >
      <View style={styles.innerHollow}>
        <SeedCluster count={count} pitSize={pitSize * 0.8} seedSize={seedSize} />
      </View>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pit: {
    backgroundColor: colors.pitDeep,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    position: 'relative',
  },
  innerHollow: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadge: {
    position: 'absolute',
    bottom: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 5,
    borderRadius: radius.radiusFull,
  },
  countText: {
    color: colors.textOnWood,
    fontSize: 10,
    fontFamily: typography.fontFamily.primaryBold,
  },
});
