import React, { useEffect, useState } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { spacing } from '../theme';
import { Board } from '../components/board/Board';
import { ScoreBoard } from '../components/board/ScoreBoard';
import { TurnMarker } from '../components/board/TurnMarker';
import { StatusBanner } from '../components/common/StatusBanner';
import { Button } from '../components/common/Button';
import { Dialog } from '../components/common/Dialog';
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
    // Lock to landscape on mount
    async function lockOrientation() {
      try {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
      } catch (e) {
        console.warn('Orientation lock failed:', e);
      }
    }
    lockOrientation();

    initLocalGame();

    return () => {
      // Unlock orientation on unmount
      ScreenOrientation.unlockAsync().catch(() => {});
    };
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
      <View style={styles.overlayHeader}>
        <Button
          title={t('common.leave')}
          onPress={() => setLeaveDialogVisible(true)}
          variant="outline"
          style={styles.leaveButton}
        />
        <ScoreBoard
          player0Name={t('game.player1')}
          player1Name={t('game.player2')}
          score0={state.stores[0]}
          score1={state.stores[1]}
          currentTurn={state.turn}
        />
      </View>

      <View style={styles.boardContainer}>
        <Board
          state={state}
          legalPits={currentLegalPits}
          onPitPress={handlePitPress}
          player0Name={t('game.player1')}
          player1Name={t('game.player2')}
        />
      </View>

      <View style={styles.overlayFooter}>
        <TurnMarker
          currentTurn={state.turn}
          player0Name={t('game.player1')}
          player1Name={t('game.player2')}
        />
        <StatusBanner message={getStatusText()} />
      </View>

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
    backgroundColor: '#1a0f08',
  },
  overlayHeader: {
    position: 'absolute',
    top: spacing.space2,
    left: spacing.space4,
    right: spacing.space4,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaveButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  boardContainer: {
    flex: 1,
  },
  overlayFooter: {
    position: 'absolute',
    bottom: spacing.space2,
    left: spacing.space4,
    right: spacing.space4,
    zIndex: 10,
    alignItems: 'center',
  },
});
