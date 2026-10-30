import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface ScoreBoardProps {
  player0Name: string;
  player1Name: string;
  score0: number;
  score1: number;
  currentTurn: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  player0Name,
  player1Name,
  score0,
  score1,
  currentTurn,
}) => {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.playerCard,
          currentTurn === 0 && styles.activePlayerCard,
          { borderColor: colors.forest },
        ]}
      >
        <View style={[styles.indicator, { backgroundColor: colors.forest }]} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{player0Name}</Text>
          <Text style={styles.score}>{score0}</Text>
        </View>
      </View>

      <View style={styles.vsContainer}>
        <Text style={styles.vsText}>VS</Text>
      </View>

      <View
        style={[
          styles.playerCard,
          currentTurn === 1 && styles.activePlayerCard,
          { borderColor: colors.terracotta },
        ]}
      >
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{player1Name}</Text>
          <Text style={styles.score}>{score1}</Text>
        </View>
        <View style={[styles.indicator, { backgroundColor: colors.terracotta }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.space4,
    marginBottom: spacing.space3,
  },
  playerCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.radiusMd,
    padding: spacing.space2,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  activePlayerCard: {
    borderWidth: 2.5,
    backgroundColor: colors.surfaceAlt,
  },
  indicator: {
    width: 12,
    height: 36,
    borderRadius: radius.radiusSm,
  },
  info: {
    flex: 1,
    marginLeft: spacing.space2,
  },
  name: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.primaryBold,
    color: colors.textPrimary,
  },
  score: {
    fontSize: typography.size.lg,
    fontFamily: typography.fontFamily.primaryBold,
    color: colors.textPrimary,
  },
  vsContainer: {
    paddingHorizontal: spacing.space3,
  },
  vsText: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.primaryBold,
    color: colors.textSecondary,
  },
});
