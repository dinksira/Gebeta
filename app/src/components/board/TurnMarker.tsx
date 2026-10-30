import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { ArrowRight } from 'lucide-react-native';

interface TurnMarkerProps {
  currentTurn: number;
  player0Name: string;
  player1Name: string;
}

export const TurnMarker: React.FC<TurnMarkerProps> = ({
  currentTurn,
  player0Name,
  player1Name,
}) => {
  const name = currentTurn === 0 ? player0Name : player1Name;
  const color = currentTurn === 0 ? colors.forest : colors.terracotta;

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.text}>{name}'s Turn</Text>
      <ArrowRight size={16} color={color} style={styles.icon} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.space2,
    paddingHorizontal: spacing.space4,
    borderRadius: radius.radiusFull,
    borderWidth: 2,
    marginVertical: spacing.space2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.space2,
  },
  text: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.primaryBold,
    color: colors.textPrimary,
  },
  icon: {
    marginLeft: spacing.space2,
  },
});
