import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { colors, elevations, radius, spacing } from '../../theme';
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
  const boardWidth = Math.min(screenWidth - (spacing.space4 * 2), 480);
  const storeWidth = Math.floor(boardWidth * 0.14);
  const boardPadding = spacing.space3;
  const pitRowWidth = boardWidth - (storeWidth * 2) - (boardPadding * 2);
  const pitSize = Math.floor(pitRowWidth / 6);
  const seedSize = Math.max(Math.floor(pitSize * 0.22), 10);
  const storeHeight = pitSize * 2 + spacing.space2;

  // Top row (Player 1): pits 11 down to 6 (left to right: 11, 10, 9, 8, 7, 6)
  const topPits = [11, 10, 9, 8, 7, 6];
  // Bottom row (Player 0): pits 0 up to 5 (left to right: 0, 1, 2, 3, 4, 5)
  const bottomPits = [0, 1, 2, 3, 4, 5];

  return (
    <View style={[styles.boardContainer, elevations.board]}>
      {/* Outer wooden frame */}
      <View style={styles.boardInner}>
        {/* Store 1 (Player 1 Store - left side in standard view) */}
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

        {/* Store 0 (Player 0 Store - right side in standard view) */}
        <Store
          count={state.stores[0]}
          width={storeWidth}
          height={storeHeight}
          label={player0Name}
          isExtraTurn={state.turn === 0 && state.over === false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    backgroundColor: colors.woodDark,
    borderRadius: radius.radiusLg,
    padding: spacing.space3,
    alignSelf: 'center',
    marginVertical: spacing.space3,
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
    marginHorizontal: spacing.space2,
    justifyContent: 'space-between',
  },
  pitRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: spacing.space1,
  },
});
