import type { GameState, Player, Rules, WinnerResult } from './types';
import { DEFAULT_RULES } from './rules';

const PITS_PER_SIDE = 6;
const STORE_0 = 6;
const STORE_1 = 13;

/**
 * Returns true when every pit on a player's side is empty.
 */
export function isSideEmpty(
  state: GameState,
  player: Player,
  rules: Rules = DEFAULT_RULES,
): boolean {
  const start = player === 0 ? 0 : rules.pitsPerSide;
  const end = start + rules.pitsPerSide;

  for (let pit = start; pit < end; pit++) {
    if ((state.pits[pit] ?? 0) > 0) return false;
  }
  return true;
}

/**
 * Returns true when either side has run out of seeds.
 */
export function checkGameOver(state: GameState, rules: Rules = DEFAULT_RULES): boolean {
  if (state.over) return true;
  return isSideEmpty(state, 0, rules) || isSideEmpty(state, 1, rules);
}

/**
 * Returns the winner once the game is over, or null while it is still running.
 */
export function getWinner(state: GameState): WinnerResult {
  if (!state.over) return null;
  const [store0, store1] = state.stores;
  if (store0 > store1) return 0;
  if (store1 > store0) return 1;
  return 'draw';
}

/**
 * Moves all remaining seeds into their owners' stores.
 * Mutates the working ring only; callers own that array.
 */
export function sweepRing(ring: number[]): { p0Swept: number; p1Swept: number } {
  let p0Swept = 0;
  let p1Swept = 0;

  for (let slot = 0; slot < PITS_PER_SIDE; slot++) {
    p0Swept += ring[slot] ?? 0;
    ring[slot] = 0;
  }
  ring[STORE_0] = (ring[STORE_0] ?? 0) + p0Swept;

  for (let slot = 7; slot <= 12; slot++) {
    p1Swept += ring[slot] ?? 0;
    ring[slot] = 0;
  }
  ring[STORE_1] = (ring[STORE_1] ?? 0) + p1Swept;

  return { p0Swept, p1Swept };
}
