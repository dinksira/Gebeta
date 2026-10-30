import React, { useEffect, useState } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { colors, spacing } from '../theme';
import { Board } from '../components/board/Board';
import { ScoreBoard } from '../components/board/ScoreBoard';
import { TurnMarker } from '../components/board/TurnMarker';
import { StatusBanner } from '../components/common/StatusBanner';
import { Button } from '../components/common/Button';
import { Dialog } from '../components/common/Dialog';
import { CulturalBand } from '../components/common/CulturalBand';
import { useGameStore } from '../store/gameStore';
import { legalMoves } from '@gebeta/engine';
import { useTranslation } from '../i18n';

interface GameScreenProps {
  onGameOver: () => void;
  onLeaveGame: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  onGameOver,
  onLeaveGame,
}) => {
  const { t } = useTranslation();
  const { state, initLocalGame, handlePitPress, statusMessageKey, statusParams } = useGameStore();
  const [leaveDialogVisible, setLeaveDialogVisible] = useState(false);

  useEffect(() => {
    initLocalGame();
  }, [initLocalGame]);

  useEffect(() => {
    if (state.over) {
      const timer = setTimeout(() => {
        onGameOver();
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state.over, onGameOver]);

  // Handle Android hardware back button
  useEffect(() => {
    const backAction = () => {
      setLeaveDialogVisible(true);
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const currentLegalPits = legalMoves(state);

  const getStatusText = () => {
    if (statusMessageKey) {
      return t(statusMessageKey, statusParams);
    }
    return t('game.yourTurn', { name: state.turn === 0 ? 'Player 1' : 'Player 2' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title={t('common.leave')}
          onPress={() => setLeaveDialogVisible(true)}
          variant="outline"
          style={styles.leaveButton}
        />
      </View>

      <View style={styles.content}>
        <ScoreBoard
          player0Name={t('game.player1')}
          player1Name={t('game.player2')}
          score0={state.stores[0]}
          score1={state.stores[1]}
          currentTurn={state.turn}
        />

        <TurnMarker
          currentTurn={state.turn}
          player0Name={t('game.player1')}
          player1Name={t('game.player2')}
        />

        <Board
          state={state}
          legalPits={currentLegalPits}
          onPitPress={handlePitPress}
          player0Name={t('game.player1')}
          player1Name={t('game.player2')}
        />

        <StatusBanner message={getStatusText()} />
      </View>

      <CulturalBand />

      <Dialog
        visible={leaveDialogVisible}
        title={t('dialog.leaveTitle')}
        body={t('dialog.leaveBodyLocal')}
        confirmText={t('common.leave')}
        cancelText={t('dialog.stay')}
        onConfirm={() => {
          setLeaveDialogVisible(false);
          onLeaveGame();
        }}
        onCancel={() => setLeaveDialogVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: spacing.space4,
    paddingTop: spacing.space6,
    alignItems: 'flex-start',
  },
  leaveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.space4,
  },
});
