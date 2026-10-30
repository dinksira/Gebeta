import type { Player } from './types';

export type IllegalMoveReason =
  'GAME_OVER' | 'OUT_OF_BOUNDS' | 'NOT_OWN_PIT' | 'PIT_EMPTY';

/**
 * Thrown when a move cannot be applied to the current state.
 */
export class IllegalMoveError extends Error {
  readonly pit: number;
  readonly player: Player;
  readonly reason: IllegalMoveReason;

  constructor(pit: number, player: Player, reason: IllegalMoveReason) {
    super(`Illegal move by Player ${player} at pit ${pit}: ${reason}`);
    this.name = 'IllegalMoveError';
    this.pit = pit;
    this.player = player;
    this.reason = reason;
    Object.setPrototypeOf(this, IllegalMoveError.prototype);
  }
}

/**
 * Thrown when a move is attempted after the game has ended.
 */
export class GameOverError extends Error {
  constructor() {
    super('The game is already over');
    this.name = 'GameOverError';
    Object.setPrototypeOf(this, GameOverError.prototype);
  }
}
