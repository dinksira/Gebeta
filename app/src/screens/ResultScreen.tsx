import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CulturalBand } from '../components/common/CulturalBand';
import { useGameStore } from '../store/gameStore';
import { getWinner } from '@gebeta/engine';
import { useTranslation } from '../i18n';

interface ResultScreenProps {
  onRematch: () => void;
  onHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  onRematch,
  onHome,
}) => {
  const { t } = useTranslation();
  const { state, rematch } = useGameStore();

  const winner = getWinner(state);
  const player1Name = t('game.player1');
  const player2Name = t('game.player2');

  const getWinnerText = () => {
    if (winner === 'draw') return t('result.draw');
    const winnerName = winner === 0 ? player1Name : player2Name;
    return t('result.win', { name: winnerName });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{getWinnerText()}</Text>

        <Card variant="wood" style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>
            {player1Name}: {state.stores[0]}
          </Text>
          <Text style={styles.scoreTitle}>
            {player2Name}: {state.stores[1]}
          </Text>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title={t('result.rematch')}
            onPress={() => {
              rematch();
              onRematch();
            }}
            variant="primary"
            style={styles.button}
          />
          <Button
            title={t('result.home')}
            onPress={onHome}
            variant="outline"
            style={styles.button}
          />
        </View>
      </View>

      <CulturalBand />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.space5,
  },
  title: {
    fontSize: 32,
    fontFamily: typography.fontFamily.primaryBold,
    color: colors.woodDark,
    marginBottom: spacing.space5,
    textAlign: 'center',
  },
  scoreCard: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.space6,
    padding: spacing.space5,
  },
  scoreTitle: {
    fontSize: typography.size.xl,
    fontFamily: typography.fontFamily.primaryBold,
    color: colors.textOnWood,
    marginVertical: spacing.space2,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.space3,
  },
  button: {
    width: '100%',
  },
});
