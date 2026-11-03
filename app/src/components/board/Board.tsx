import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import { Pit } from './Pit';
import { Store } from './Store';
import type { GameState } from '@gebeta/engine';

interface BoardProps {
  state: GameState;
  legalPits: number[];
  onPitPress: (pit: number) => void;
  player0Name?: string;
  player1Name?: string;
}

export const Board: React.FC<BoardProps> = ({
  state,
  legalPits,
  onPitPress,
  player0Name = 'Player 1',
  player1Name = 'Player 2',
}) => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  // In landscape, width is the larger dimension
  const boardWidth = Math.min(Math.max(screenWidth, screenHeight) * 0.85, 800);
  const storeWidth = Math.floor(boardWidth * 0.12);
  const boardPadding = spacing.space4;
  const pitRowWidth = boardWidth - (storeWidth * 2) - (boardPadding * 2);
  const pitSize = Math.floor(pitRowWidth / 6) - 8;
  const seedSize = Math.max(Math.floor(pitSize * 0.22), 10);
  const storeHeight = pitSize * 2 + spacing.space3;

  // Top row (Player 1): pits 11 down to 6 (left to right: 11, 10, 9, 8, 7, 6)
  const topPits = [11, 10, 9, 8, 7, 6];
  // Bottom row (Player 0): pits 0 up to 5 (left to right: 0, 1, 2, 3, 4, 5)
  const bottomPits = [0, 1, 2, 3, 4, 5];

  return (
    <View style={styles.sceneContainer}>
      <View style={[styles.boardContainer, { width: boardWidth }]}>
        {/* Outer 3D Wooden frame with depth effect */}
        <View style={styles.boardRim}>
          <View style={styles.boardInner}>
            {/* Store 1 (Player 1 Store - left side) */}
            <Store
              count={state.stores[1]}
              width={storeWidth}
              height={storeHeight}
              label={player1Name}
              isExtraTurn={state.turn === 1 && state.over === false}
            />

            {/* Center pit columns */}
            <View style={styles.pitColumns}>
              {/* Top Row (Player 1) */}
              <View style={styles.pitRow}>
                {topPits.map((pitIndex) => (
                  <Pit
                    key={pitIndex}
                    pitIndex={pitIndex}
                    count={state.pits[pitIndex] ?? 0}
                    isLegal={legalPits.includes(pitIndex)}
                    onPress={() => onPitPress(pitIndex)}
                    pitSize={pitSize}
                    seedSize={seedSize}
                  />
                ))}
              </View>

              {/* Bottom Row (Player 0) */}
              <View style={styles.pitRow}>
                {bottomPits.map((pitIndex) => (
                  <Pit
                    key={pitIndex}
                    pitIndex={pitIndex}
                    count={state.pits[pitIndex] ?? 0}
                    isLegal={legalPits.includes(pitIndex)}
                    onPress={() => onPitPress(pitIndex)}
                    pitSize={pitSize}
                    seedSize={seedSize}
                  />
                ))}
              </View>
            </View>

            {/* Store 0 (Player 0 Store - right side) */}
            <Store
              count={state.stores[0]}
              width={storeWidth}
              height={storeHeight}
              label={player0Name}
              isExtraTurn={state.turn === 0 && state.over === false}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sceneContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a0f08',
  },
  boardContainer: {
    transform: [
      { perspective: 1200 },
      { rotateX: '28deg' },
      { rotateZ: '0deg' },
    ],
    backgroundColor: '#3d2314',
    borderRadius: radius.radiusLg,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.75,
    shadowRadius: 20,
    elevation: 25,
    borderBottomWidth: 12,
    borderBottomColor: '#23130a',
    borderTopWidth: 2,
    borderTopColor: '#704224',
  },
  boardRim: {
    backgroundColor: colors.woodDark,
    borderRadius: radius.radiusLg,
    padding: spacing.space3,
    borderWidth: 2,
    borderColor: '#704224',
  },
  boardInner: {
    backgroundColor: colors.woodMid,
    borderRadius: radius.radiusMd,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.space3,
    borderWidth: 2,
    borderColor: colors.woodLight,
  },
  pitColumns: {
    flex: 1,
    marginHorizontal: spacing.space3,
    justifyContent: 'space-between',
  },
  pitRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: spacing.space1,
  },
});
