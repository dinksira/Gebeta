import type { GameState, Player } from '../src/types';
import type { IllegalMoveReason } from '../src/errors';
import { IllegalMoveError } from '../src/errors';
import { applyMove } from '../src/applyMove';
import { createGame } from '../src/createGame';
import { legalMoves } from '../src/legalMoves';

export function makeState(
  pits: number[],
  stores: [number, number] = [0, 0],
  turn: Player = 0,
  over = false,
): GameState {
  return {
    pits: [...pits],
    stores: [stores[0], stores[1]],
    turn,
    over,
  };
}

export function freezeState(state: GameState): GameState {
  Object.freeze(state.pits);
  Object.freeze(state.stores);
  return Object.freeze(state);
}

export function totalSeeds(state: GameState): number {
  const pitTotal = state.pits.reduce((sum, count) => sum + count, 0);
  return pitTotal + state.stores[0] + state.stores[1];
}

export function expectIllegalMove(
  action: () => unknown,
  reason: IllegalMoveReason,
): void {
  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(IllegalMoveError);
    expect((error as IllegalMoveError).reason).toBe(reason);
    return;
  }

  throw new Error(`Expected IllegalMoveError with reason ${reason}`);
}

export function createRng(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export interface PlayedGame {
  readonly firstPlayer: Player;
  readonly moveLog: readonly number[];
  readonly finalState: GameState;
}

export function playRandomGame(rng: () => number): PlayedGame {
  const firstPlayer: Player = rng() < 0.5 ? 0 : 1;
  let state = createGame(undefined, firstPlayer);
  const moveLog: number[] = [];

  while (!state.over) {
    const moves = legalMoves(state);
    if (moves.length === 0) break;

    const index = Math.floor(rng() * moves.length);
    const pit = moves[index] ?? moves[0] ?? 0;

    moveLog.push(pit);
    state = applyMove(state, pit).state;
  }

  return {
    firstPlayer,
    moveLog,
    finalState: state,
  };
}
