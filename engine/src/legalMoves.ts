import type { GameState, Rules } from './types';
import { DEFAULT_RULES } from './rules';
import { ownsPit } from './ring';

/**
 * Returns true when the current player may legally choose the given pit.
 */
export function isLegal(
  state: GameState,
  pit: number,
  rules: Rules = DEFAULT_RULES,
): boolean {
  if (state.over) return false;
  if (!Number.isInteger(pit) || pit < 0 || pit >= rules.pitsPerSide * 2) return false;
  if (!ownsPit(state.turn, pit)) return false;

  const count = state.pits[pit];
  return count !== undefined && count > 0;
}

/**
 * Returns every pit index the current player may legally choose.
 */
export function legalMoves(state: GameState, rules: Rules = DEFAULT_RULES): number[] {
  if (state.over) return [];

  const moves: number[] = [];
  const start = state.turn === 0 ? 0 : rules.pitsPerSide;
  const end = start + rules.pitsPerSide;

  for (let pit = start; pit < end; pit++) {
    if (isLegal(state, pit, rules)) {
      moves.push(pit);
    }
  }

  return moves;
}
