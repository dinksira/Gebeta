/**
 * Player identifier: 0 is the bottom player, 1 is the top player.
 */
export type Player = 0 | 1;

/**
 * Immutable snapshot of the board and whose turn it is.
 */
export interface GameState {
  /** Pits 0..5 belong to Player 0, pits 6..11 belong to Player 1. Length is 12. */
  readonly pits: readonly number[];
  /** Stores [Player 0 score, Player 1 score]. */
  readonly stores: readonly [number, number];
  /** Player whose turn it is to move. */
  readonly turn: Player;
  /** True once the game has ended. */
  readonly over: boolean;
}

/**
 * Rule configuration for Gebeta variants.
 */
export interface Rules {
  /** Number of pits on each player's side. Default: 6. */
  readonly pitsPerSide: number;
  /** Starting seeds in every pit. Default: 4. */
  readonly seedsPerPit: number;
  /** Award an extra turn when the last seed lands in the mover's store. */
  readonly extraTurnOnStore: boolean;
  /** Enable opposite-pit capture. */
  readonly capture: boolean;
  /** Reserved for relay-sowing variants. */
  readonly relaySowing: boolean;
}

/**
 * One seed placement in a move, used to drive UI animation.
 */
export interface SowStep {
  /** Ring slot that received the seed, 0..13. */
  readonly slot: number;
  /** Whether the seed landed in a pit or a store. */
  readonly kind: 'drop' | 'store';
}

/**
 * Result of applying a single move.
 */
export interface MoveResult {
  /** New immutable state. */
  readonly state: GameState;
  /** Sequential seed placements for animation. */
  readonly steps: readonly SowStep[];
  /** Number of seeds captured by this move, 0 if none. */
  readonly captured: number;
  /** True when the mover earned an extra turn. */
  readonly extraTurn: boolean;
}

/**
 * Winner evaluation result. Null means the game is still in progress.
 */
export type WinnerResult = Player | 'draw' | null;
