import type { GameState, Player, Rules } from './types';
import { DEFAULT_RULES } from './rules';

/**
 * Creates a fresh immutable starting state.
 * Defaults to 6 pits per side, 4 seeds per pit, empty stores, Player 0 to move.
 */
export function createGame(
  rules: Rules = DEFAULT_RULES,
  firstPlayer: Player = 0,
): GameState {
  const totalPits = rules.pitsPerSide * 2;
  const pits = Object.freeze(new Array<number>(totalPits).fill(rules.seedsPerPit));
  const stores = Object.freeze([0, 0] as [number, number]);

  return Object.freeze({
    pits,
    stores,
    turn: firstPlayer,
    over: false,
  });
}
