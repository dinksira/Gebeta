import type { GameState, MoveResult, Player, Rules, SowStep } from './types';
import { DEFAULT_RULES } from './rules';
import { IllegalMoveError } from './errors';
import { isLegal } from './legalMoves';
import { checkGameOver, sweepRing } from './status';
import {
  fromRing,
  isPitSlot,
  oppositeSlot,
  ownsPit,
  ownsSlot,
  pitToSlot,
  storeSlot,
  toRing,
} from './ring';

const RING_SIZE = 14;

/**
 * Applies one move and returns the resulting state plus an animation trace.
 * Throws IllegalMoveError for invalid moves. Never mutates the input state.
 */
export function applyMove(
  state: GameState,
  pit: number,
  rules: Rules = DEFAULT_RULES,
): MoveResult {
  if (state.over) {
    throw new IllegalMoveError(pit, state.turn, 'GAME_OVER');
  }
  if (!Number.isInteger(pit) || pit < 0 || pit >= rules.pitsPerSide * 2) {
    throw new IllegalMoveError(pit, state.turn, 'OUT_OF_BOUNDS');
  }
  if (!ownsPit(state.turn, pit)) {
    throw new IllegalMoveError(pit, state.turn, 'NOT_OWN_PIT');
  }
  if (!isLegal(state, pit, rules)) {
    throw new IllegalMoveError(pit, state.turn, 'PIT_EMPTY');
  }

  const ring = toRing(state);
  const me = state.turn;
  const opponent: Player = me === 0 ? 1 : 0;
  const myStore = storeSlot(me);
  const opponentStore = storeSlot(opponent);

  const startSlot = pitToSlot(pit);
  let hand = ring[startSlot] ?? 0;
  ring[startSlot] = 0;

  const steps: SowStep[] = [];
  let position = startSlot;

  while (hand > 0) {
    position = (position + 1) % RING_SIZE;

    if (position === opponentStore) {
      continue;
    }

    ring[position] = (ring[position] ?? 0) + 1;
    hand -= 1;
    steps.push({
      slot: position,
      kind: position === myStore ? 'store' : 'drop',
    });
  }

  let captured = 0;
  const landedOnOwnSide = rules.capture && ownsSlot(me, position) && isPitSlot(position);
  const wasEmptyBeforeLanding = ring[position] === 1;

  if (landedOnOwnSide && wasEmptyBeforeLanding) {
    const opposite = oppositeSlot(position);
    const oppositeSeeds = ring[opposite] ?? 0;

    if (oppositeSeeds > 0) {
      captured = oppositeSeeds + 1;
      ring[myStore] = (ring[myStore] ?? 0) + captured;
      ring[position] = 0;
      ring[opposite] = 0;
    }
  }

  const extraTurn = rules.extraTurnOnStore && position === myStore;

  const intermediateState = fromRing(ring, me, false);
  const gameOver = checkGameOver(intermediateState, rules);

  let nextTurn: Player;
  if (gameOver) {
    sweepRing(ring);
    nextTurn = me;
  } else {
    nextTurn = extraTurn ? me : opponent;
  }

  const finalState = Object.freeze(fromRing(ring, nextTurn, gameOver));

  return {
    state: finalState,
    steps: Object.freeze(steps),
    captured,
    extraTurn,
  };
}
