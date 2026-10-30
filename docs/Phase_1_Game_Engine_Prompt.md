# Phase 1: Game Engine — Master Implementation Specification & Execution Prompt

> **Document Type:** Implementation Specification & Autonomous Execution Prompt  
> **Target Package:** `@gebeta/engine` (`d:\Projects\Gebeta\engine`)  
> **Status:** Ready for Immediate Execution  
> **Prerequisites:** Phase 0 (Foundations and Decisions) — **Verified Complete**  
> **Delivery Milestone:** Milestone 1 (Offline Game) — Phase 1 of 11  

---

## 1. System Analysis & Phase 0 Verification

### 1.1 Phase 0 Completion Audit

Before beginning Phase 1, the repository was audited against the Phase 0 deliverables and exit criteria specified in `docs/Phase Plan to Delivery.md`:

| Requirement | Target Deliverable | Current Repository State | Status |
| :--- | :--- | :--- | :--- |
| **Monorepo Architecture** | 3 packages (`engine`, `app`, `server`) | `pnpm-workspace.yaml` links `engine`, `app`, and `server`. Root `tsconfig.base.json` configured. | **PASS** |
| **Tooling & Code Quality** | TypeScript strict, ESLint, Prettier, Husky | Configured with ES2022, strict mode, `noUncheckedIndexedAccess`, Prettier, Husky hooks. | **PASS** |
| **Continuous Integration** | `.github/workflows/ci.yml` | Green GitHub Actions workflow running format check, typecheck, and tests on push/PR. | **PASS** |
| **Rules Specification** | v1 Rules confirmed | Documented in `docs/Game Rules.md` (6x4 Kalah-style Gebeta with 48 seeds, extra turns on store, opposite pit capture, either side empty ends game with sweep). | **PASS** |
| **System & Tech Specs** | Architectural alignment | `docs/Technical_Guide.md`, `docs/Coding_Standard.md`, `docs/Screens.md`, `docs/Design System.md` complete and consistent. | **PASS** |
| **Smoke Tests** | Monorepo test suite green | `pnpm test` runs across all packages and passes smoke tests (`engine/tests/smoke.test.ts`, `server/tests/server.test.ts`). | **PASS** |
| **Typecheck** | Clean type safety | `pnpm typecheck` (`tsc --noEmit` on all packages) passes with zero errors. | **PASS** |

**Conclusion:** **Phase 0 is 100% complete.** The workspace is in a clean, stable state and ready for full implementation of Phase 1.

---

## 2. Phase 1 Objectives & Scope

### 2.1 The Goal
Deliver a **fully tested, deterministic, immutable, pure TypeScript Gebeta engine** in `@gebeta/engine` that runs identically on mobile devices (React Native/Expo) and on the authoritative Node server.

### 2.2 Core Responsibilities of `@gebeta/engine`
1. **Board Representation & Mathematics:** Circular 14-slot ring mapping for 12 pits and 2 stores, with bidirectional indexing and opposite-pit calculations.
2. **Pure State Transitions:** `applyMove` accepts a `GameState` and a pit index, returning a brand new `GameState` and an array of `SowStep` records to drive UI animation in Phase 2.
3. **Rule Enforcement:** Move legality, sow pathing (skipping opponent store), captures, chained extra turns, sweep mechanics, game-over detection, and winner determination.
4. **Configurable Variants:** Engine logic driven by a `Rules` configuration object so future regional variants (relay sowing, alternate seed counts) require zero core engine rewrites.
5. **Shared Protocol & Types:** Export all shared WebSocket event names, payload types, schemas, and domain error codes used by both `app` and `server`.
6. **Comprehensive Test Suite:** 100% rule coverage (R1 to R15), mathematical invariants (seed conservation, non-negativity), edge-case validation, and a 10,000-game soak/replay engine.
7. **Interactive Terminal CLI:** A standalone command-line game runner allowing developers and testers to play full games in the terminal to verify the tactile feel of the rules.

### 2.3 Strict Constraints
* **Zero Runtime Dependencies:** Pure TypeScript only. No external math, lodash, or utility libraries.
* **Zero Side Effects & Zero Mutation:** No `Math.random()`, no `Date.now()`, no I/O, no network calls inside the core engine. Input `GameState` must remain immutable (enforced by `Object.freeze` in test suites).
* **`noUncheckedIndexedAccess` Compliance:** Array lookups in TypeScript strict mode can return `undefined`. All array indexing must be strictly guarded or typed without unsafe casting.
* **Separation of Concerns:** Phase 1 includes the core rules engine, tests, protocol definitions, and CLI runner. The minimax AI (`src/ai/`) belongs to Phase 3.

---

## 3. Engine Architecture & File Structure

The `@gebeta/engine` package shall have the following file layout upon completion:

```
engine/
├── package.json               # Package config, build scripts, tsup, cli binary entry
├── tsconfig.json              # Extends ../tsconfig.base.json
├── jest.config.js             # Jest configuration for ts-jest
├── src/
│   ├── types.ts               # Core domain types: Player, GameState, Rules, MoveResult, SowStep
│   ├── errors.ts              # Domain errors: IllegalMoveError, GameOverError
│   ├── ring.ts                # Circular 14-slot ring mathematics & conversion helpers
│   ├── rules.ts               # DEFAULT_RULES and named variant presets (KALAH_6X4)
│   ├── createGame.ts          # Pure initial state factory
│   ├── legalMoves.ts          # Move legality checks: legalMoves() and isLegal()
│   ├── status.ts              # Game over detection, sweep, winner resolution, and score tallying
│   ├── applyMove.ts           # Pure state transition function with step tracing
│   ├── protocol.ts            # Shared WebSocket event names, payload interfaces, error codes
│   ├── cli.ts                 # Interactive ASCII terminal game runner
│   └── index.ts               # Curated public barrel exports
└── tests/
    ├── ring.test.ts           # Ring slot mapping and opposite slot mathematics
    ├── rules.test.ts          # Rules R1 through R15 mapped explicitly to Game Rules spec
    ├── applyMove.test.ts      # State transitions, sowing laps, captures, and extra turns
    ├── legalMoves.test.ts     # Boundary checks, empty pits, opponent pits, game over
    ├── status.test.ts         # Game over checks, sweep allocation, winner and draw logic
    ├── invariants.test.ts     # Seed conservation (sum=48), non-negativity, immutability
    ├── edgeCases.test.ts      # Multi-lap (13+ seeds), chained extra turns, emptying side mid-turn
    └── replay.test.ts         # 10,000-game soak and deterministic replay verification
```

---

## 4. Detailed Technical Specifications

### 4.1 Data Types (`src/types.ts`)

```ts
/**
 * Player identifier: 0 (bottom player / host), 1 (top player / guest).
 */
export type Player = 0 | 1;

/**
 * Immutable snapshot of the game board and turn.
 */
export interface GameState {
  /**
   * Pits 0..5 belong to Player 0.
   * Pits 6..11 belong to Player 1.
   * Total length is always 12.
   */
  readonly pits: readonly number[];

  /**
   * Stores [Player 0 score, Player 1 score].
   */
  readonly stores: readonly [number, number];

  /**
   * Current player whose turn it is to move.
   */
  readonly turn: Player;

  /**
   * True if the game has ended.
   */
  readonly over: boolean;
}

/**
 * Rule configuration object for regional variants.
 */
export interface Rules {
  readonly pitsPerSide: number;       // Default: 6
  readonly seedsPerPit: number;       // Default: 4
  readonly extraTurnOnStore: boolean; // Default: true
  readonly capture: boolean;          // Default: true
  readonly relaySowing: boolean;      // Default: false (reserved for Phase 11)
}

/**
 * Granular sowing step for driving UI animation in Phase 2.
 */
export interface SowStep {
  /**
   * Ring slot (0..13) that received a seed.
   */
  readonly slot: number;

  /**
   * Type of slot receiving the seed: normal pit drop or store drop.
   */
  readonly kind: 'drop' | 'store';
}

/**
 * Result returned by applying a move.
 */
export interface MoveResult {
  /**
   * New immutable game state.
   */
  readonly state: GameState;

  /**
   * Sequential sowing steps for client-side animation.
   */
  readonly steps: readonly SowStep[];

  /**
   * Total seeds captured in this move (0 if no capture occurred).
   */
  readonly captured: number;

  /**
   * True if the mover earned an extra turn.
   */
  readonly extraTurn: boolean;
}

/**
 * Result of winner evaluation.
 */
export type WinnerResult = Player | 'draw' | null;
```

---

### 4.2 Domain Errors (`src/errors.ts`)

```ts
import type { Player } from './types';

export type IllegalMoveReason =
  | 'GAME_OVER'
  | 'OUT_OF_BOUNDS'
  | 'NOT_OWN_PIT'
  | 'PIT_EMPTY';

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
```

---

### 4.3 Ring Mathematics & Board Representation (`src/ring.ts`)

The Gebeta board is represented internally as a continuous circular ring of 14 slots (0 through 13). This enables simple modulo counterclockwise traversal while guaranteeing seed pathing correctness.

#### Slot Mapping:
```
              Player 1 side (Pits 11 down to 6)
      [S1: Slot 13]  [Pit 11: Slot 12] [Pit 10: Slot 11] [Pit 9: Slot 10] [Pit 8: Slot 9] [Pit 7: Slot 8] [Pit 6: Slot 7]
                     [Pit 0:  Slot 0 ] [Pit 1:  Slot 1 ] [Pit 2: Slot 2 ] [Pit 3: Slot 3] [Pit 4: Slot 4] [Pit 5: Slot 5]  [S0: Slot 6]
              Player 0 side (Pits 0 up to 5)
```

| Slot Range | Entity | Owner |
| :--- | :--- | :--- |
| `0 .. 5` | Pits 0 to 5 | Player 0 |
| `6` | Store 0 | Player 0 |
| `7 .. 12` | Pits 6 to 11 | Player 1 |
| `13` | Store 1 | Player 1 |

#### Required Helper Functions:
1. `pitToSlot(pit: number): number`
   * Pit 0..5 -> Slot 0..5
   * Pit 6..11 -> Slot 7..12 (`pit + 1`)
   * Throws `RangeError` if `pit < 0 || pit > 11`.
2. `slotToPit(slot: number): number`
   * Slot 0..5 -> Pit 0..5
   * Slot 7..12 -> Pit 6..11 (`slot - 1`)
   * Throws `RangeError` if slot is 6 or 13 (store slots are not pits).
3. `oppositeSlot(slot: number): number`
   * Mathematical formula: `12 - slot`.
   * For Slot 0 (Pit 0) -> Slot 12 (Pit 11).
   * For Slot 5 (Pit 5) -> Slot 7 (Pit 6).
   * Symmetric and verified for all pit slots 0..5 and 7..12.
4. `oppositePit(pit: number): number`
   * Mathematical formula: `11 - pit`.
   * Directly maps pit indices across the board.
5. `storeSlot(player: Player): number`
   * Player 0 -> 6; Player 1 -> 13.
6. `ownsSlot(player: Player, slot: number): boolean`
   * Player 0 owns pit slots `0..5`.
   * Player 1 owns pit slots `7..12`.
   * Returns `false` for store slots.
7. `ownsPit(player: Player, pit: number): boolean`
   * Player 0 owns pits `0..5`.
   * Player 1 owns pits `6..11`.
8. `isPitSlot(slot: number): boolean`
   * True if slot is in `0..5` or `7..12`.
9. `isStoreSlot(slot: number): boolean`
   * True if slot is `6` or `13`.
10. `toRing(state: GameState): number[]`
    * Creates a 14-element number array: `[...state.pits.slice(0, 6), state.stores[0], ...state.pits.slice(6, 12), state.stores[1]]`.
11. `fromRing(ring: readonly number[], turn: Player, over: boolean): GameState`
    * Reconstructs `GameState` with `pits: [...ring.slice(0, 6), ...ring.slice(7, 13)]` and `stores: [ring[6]!, ring[13]!]`.

---

### 4.4 Rules Configuration (`src/rules.ts`)

```ts
import type { Rules } from './types';

export const DEFAULT_RULES: Rules = Object.freeze({
  pitsPerSide: 6,
  seedsPerPit: 4,
  extraTurnOnStore: true,
  capture: true,
  relaySowing: false,
});

export const RULES_PRESETS: Record<string, Rules> = Object.freeze({
  kalah6x4: DEFAULT_RULES,
});
```

---

### 4.5 Initial Game Factory (`src/createGame.ts`)

```ts
import type { GameState, Player, Rules } from './types';
import { DEFAULT_RULES } from './rules';

/**
 * Creates a fresh, immutable starting game state.
 * Default: 6 pits per side, 4 seeds per pit (48 seeds total), stores at 0, Player 0 starts.
 */
export function createGame(
  rules: Rules = DEFAULT_RULES,
  firstPlayer: Player = 0,
): GameState {
  const totalPits = rules.pitsPerSide * 2;
  const pits = Object.freeze(new Array(totalPits).fill(rules.seedsPerPit));
  const stores = Object.freeze([0, 0] as [number, number]);

  return Object.freeze({
    pits,
    stores,
    turn: firstPlayer,
    over: false,
  });
}
```

---

### 4.6 Move Legality Checking (`src/legalMoves.ts`)

```ts
import type { GameState, Rules } from './types';
import { DEFAULT_RULES } from './rules';
import { ownsPit } from './ring';

/**
 * Returns true if the specified pit is a valid move for the current player.
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
 * Returns an array of pit indices that the current player can legally choose.
 */
export function legalMoves(
  state: GameState,
  rules: Rules = DEFAULT_RULES,
): number[] {
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
```

---

### 4.7 Game Status, Sweep & Scoring (`src/status.ts`)

```ts
import type { GameState, Player, Rules, WinnerResult } from './types';
import { DEFAULT_RULES } from './rules';

/**
 * Checks if a specific player has zero seeds in all of their pits.
 */
export function isSideEmpty(
  state: GameState,
  player: Player,
  rules: Rules = DEFAULT_RULES,
): boolean {
  const start = player === 0 ? 0 : rules.pitsPerSide;
  const end = start + rules.pitsPerSide;

  for (let i = start; i < end; i++) {
    if ((state.pits[i] ?? 0) > 0) return false;
  }
  return true;
}

/**
 * Evaluates whether the game is over.
 * Gebeta rule: if either side has no seeds remaining, the game ends immediately.
 */
export function checkGameOver(
  state: GameState,
  rules: Rules = DEFAULT_RULES,
): boolean {
  if (state.over) return true;
  return isSideEmpty(state, 0, rules) || isSideEmpty(state, 1, rules);
}

/**
 * Determines the winner based on store counts.
 * Returns Player 0, Player 1, 'draw', or null if the game is still active.
 */
export function getWinner(state: GameState): WinnerResult {
  if (!state.over) return null;
  const [s0, s1] = state.stores;
  if (s0 > s1) return 0;
  if (s1 > s0) return 1;
  return 'draw';
}

/**
 * Sweeps all remaining seeds on the board into their respective owners' stores.
 * Mutates the working ring array in place during move finalization.
 */
export function sweepRing(ring: number[]): { p0Swept: number; p1Swept: number } {
  let p0Swept = 0;
  let p1Swept = 0;

  // Sweep Player 0 pits (slots 0..5) to Store 0 (slot 6)
  for (let slot = 0; slot <= 5; slot++) {
    p0Swept += ring[slot]!;
    ring[slot] = 0;
  }
  ring[6] = ring[6]! + p0Swept;

  // Sweep Player 1 pits (slots 7..12) to Store 1 (slot 13)
  for (let slot = 7; slot <= 12; slot++) {
    p1Swept += ring[slot]!;
    ring[slot] = 0;
  }
  ring[13] = ring[13]! + p1Swept;

  return { p0Swept, p1Swept };
}
```

---

### 4.8 State Transition Function (`src/applyMove.ts`)

The core engine state transition function. **Pure, deterministic, and immutable.**

```ts
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

/**
 * Applies a move to the game state and returns the resulting state and animation trace.
 * Throws IllegalMoveError if the move is invalid or the game is already over.
 * Guarantees zero mutation of the input GameState.
 */
export function applyMove(
  state: GameState,
  pit: number,
  rules: Rules = DEFAULT_RULES,
): MoveResult {
  // 1. Validation
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

  // 2. Clone state into mutable ring array
  const ring = toRing(state);
  const me = state.turn;
  const opp: Player = me === 0 ? 1 : 0;
  const myStore = storeSlot(me);
  const oppStore = storeSlot(opp);

  const startSlot = pitToSlot(pit);
  let hand = ring[startSlot]!;
  ring[startSlot] = 0;

  const steps: SowStep[] = [];
  let pos = startSlot;

  // 3. Counterclockwise sowing
  while (hand > 0) {
    pos = (pos + 1) % 14;

    // Opponent store is ALWAYS skipped
    if (pos === oppStore) {
      continue;
    }

    ring[pos] = ring[pos]! + 1;
    hand -= 1;
    steps.push({
      slot: pos,
      kind: pos === myStore ? 'store' : 'drop',
    });
  }

  // 4. Capture evaluation
  let captured = 0;
  const landedInOwnSide = rules.capture && ownsSlot(me, pos) && isPitSlot(pos);
  const wasEmptyBeforeLanding = ring[pos] === 1; // Since 1 seed was placed into it
  const oppSlot = oppositeSlot(pos);
  const oppSeedCount = ring[oppSlot] ?? 0;

  if (landedInOwnSide && wasEmptyBeforeLanding && oppSeedCount > 0) {
    captured = oppSeedCount + 1; // Opposite seeds plus the landing seed
    ring[myStore] = ring[myStore]! + captured;
    ring[pos] = 0;
    ring[oppSlot] = 0;
  }

  // 5. Extra turn evaluation
  const earnedExtraTurn = rules.extraTurnOnStore && pos === myStore;

  // 6. Check game over and sweep
  // Reconstruct intermediate state to check if either side is empty
  const intermediateState = fromRing(ring, me, false);
  const gameOver = checkGameOver(intermediateState, rules);

  let nextTurn: Player;
  if (gameOver) {
    sweepRing(ring);
    nextTurn = me; // Turn frozen upon game over
  } else {
    nextTurn = earnedExtraTurn ? me : opp;
  }

  const finalState = Object.freeze(fromRing(ring, nextTurn, gameOver));

  return {
    state: finalState,
    steps: Object.freeze(steps),
    captured,
    extraTurn: earnedExtraTurn,
  };
}
```

---

### 4.9 Shared WebSocket Protocol Contracts (`src/protocol.ts`)

This module exports standard event names, error codes, and strict payload interfaces shared by `@gebeta/server` and `@gebeta/app`.

```ts
import type { GameState, Player } from './types';

export const EVENTS = {
  // Client to Server
  CREATE_ROOM: 'create_room',
  JOIN_ROOM: 'join_room',
  MAKE_MOVE: 'make_move',
  RESIGN: 'resign',
  RESUME_ROOM: 'resume_room',

  // Server to Client
  ROOM_CREATED: 'room_created',
  ROOM_JOINED: 'room_joined',
  STATE_UPDATE: 'state_update',
  OPPONENT_STATUS: 'opponent_status',
  GAME_OVER: 'game_over',
  ERROR: 'error',
} as const;

export const ERROR_CODES = {
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  ROOM_FULL: 'ROOM_FULL',
  NOT_YOUR_TURN: 'NOT_YOUR_TURN',
  ILLEGAL_MOVE: 'ILLEGAL_MOVE',
  STALE_SEQ: 'STALE_SEQ',
  INVALID_PAYLOAD: 'INVALID_PAYLOAD',
  RATE_LIMITED: 'RATE_LIMITED',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface PublicProfile {
  readonly id: string;
  readonly username: string;
  readonly rating: number;
}

// Client to Server Payloads
export interface CreateRoomPayload {
  readonly rulesId?: string;
}

export interface JoinRoomPayload {
  readonly code: string;
}

export interface MakeMovePayload {
  readonly code: string;
  readonly pit: number;
  readonly seq: number;
}

export interface ResignPayload {
  readonly code: string;
}

export interface ResumeRoomPayload {
  readonly code: string;
}

// Server to Client Payloads
export interface RoomCreatedPayload {
  readonly code: string;
}

export interface RoomJoinedPayload {
  readonly code: string;
  readonly you: Player;
  readonly opponent: PublicProfile;
  readonly state: GameState;
  readonly seq: number;
  readonly deadlineAt: number;
}

export interface StateUpdatePayload {
  readonly seq: number;
  readonly move: {
    readonly by: Player;
    readonly pit: number;
  };
  readonly state: GameState;
  readonly deadlineAt: number;
}

export interface OpponentStatusPayload {
  readonly connected: boolean;
}

export interface GameOverPayload {
  readonly winner: Player | 'draw';
  readonly state: GameState;
  readonly reason: 'finished' | 'resign' | 'timeout' | 'abandoned';
  readonly ratingDelta?: number;
}

export interface ProtocolErrorPayload {
  readonly code: ErrorCode;
  readonly message: string;
}
```

---

### 4.10 Public API Barrel (`src/index.ts`)

```ts
export const ENGINE_VERSION = '0.1.0';

// Core types
export * from './types';
export * from './errors';
export * from './rules';
export * from './ring';
export * from './createGame';
export * from './legalMoves';
export * from './status';
export * from './applyMove';
export * from './protocol';
```

---

### 4.11 Terminal CLI Runner (`src/cli.ts`)

A standalone CLI script allowing human-vs-human or human-vs-bot play directly in the terminal.

#### Key Features:
1. **ASCII Board Display:** Formats the 12 pits and 2 stores cleanly with Amharic-inspired accents, matching the pit layout from `Game Rules.md`.
2. **Move Input & Validation:** Prompts the active player to enter a pit index (0-5 or 6-11), validating legality and displaying error messages cleanly.
3. **Step Animation Output:** Displays an immediate summary of the sowing path, captures, and extra turn status.
4. **Game Over Summary:** Declares the winner, store tallies, and seed conservation verification.
5. **CLI Command:** Executable via `pnpm play` or `npx tsx src/cli.ts`.

---

## 5. Test Suite Specifications

All tests must be placed in `engine/tests/` and pass with 100% success rate under `pnpm test`.

### 5.1 Rules Test Matrix (`tests/rules.test.ts`)
Explicitly tests every rule ID defined in `docs/Game Rules.md` section 14:

| Test ID | Rule Tested | Verification Assertions |
| :--- | :--- | :--- |
| **R1** | Starting position | Pits 0..11 each hold 4 seeds; both stores hold 0; total seeds = 48; turn = 0. |
| **R2** | Opposite pit formula | `oppositePit(i) === 11 - i` for all `i` in `0..11`; `oppositeSlot(s) === 12 - s`. |
| **R3** | Sowing direction | Sowing from Pit 0 with 4 seeds increments Slots 1, 2, 3, 4 by 1; Pit 0 becomes 0. |
| **R4** | Opponent store isolation | When Player 0 sows 10 seeds, Slot 13 (Store 1) is never touched; seeds pass directly from Slot 12 to Slot 0. |
| **R5** | Laps and store skipping | Sowing 15 seeds wraps around the board and skips the opponent's store on every pass. |
| **R6** | 13-seed move | Sowing 13 seeds from Pit 3 lands back in Pit 3; captures if opposite pit has seeds. |
| **R7** | Extra turn on store | Sowing from Pit 2 (4 seeds) lands in Store 0; `extraTurn === true`; next state has `turn === 0`. |
| **R8** | Capture in empty own pit | Landing last seed in empty Pit 1 when Pit 10 has 5 seeds transfers 6 seeds to Store 0; Pits 1 and 10 become 0. |
| **R9** | No capture if opposite empty | Landing in empty Pit 1 when Pit 10 has 0 seeds results in 0 capture; seed stays in Pit 1. |
| **R10** | No capture on opponent side | Landing in empty Pit 8 (Player 1 side) during Player 0 move does not capture. |
| **R11** | Game over on empty side | Sowing that empties the mover's or opponent's side immediately triggers `state.over === true`. |
| **R12** | Sweep allocation | When side becomes empty, all leftover seeds sweep into their owner's store. |
| **R13** | Draw detection | When both stores finish at 24 seeds each, `getWinner(state) === 'draw'`. |
| **R14** | Illegal move handling | Picking an empty pit or opponent pit throws `IllegalMoveError`; input state remains unchanged. |
| **R15** | Seed conservation | Across all moves, `sum(pits) + sum(stores) === 48` at all times. |

### 5.2 Mathematical Invariants (`tests/invariants.test.ts`)
* **Conservation of Seeds:** Sum of pits and stores equals exactly 48 before and after every move.
* **Non-Negativity:** No pit or store index ever drops below 0.
* **Input Immutability:** Input `GameState` passed into `applyMove` is wrapped with `Object.freeze()`. The test asserts no mutation occurs and the original object is identical before and after.
* **Determinism:** `applyMove(state, pit)` called twice on the identical state returns deep-equal `MoveResult` outputs.

### 5.3 Edge Cases (`tests/edgeCases.test.ts`)
* Consecutive extra turns (e.g. 3 extra turns in a row by the same player).
* Extra turn that empties the current player's side: game ends immediately; opponent sweeps remaining seeds; correct winner.
* Extra turn that empties the opponent's side: game ends immediately; mover sweeps remaining seeds.
* Double lap (27+ seeds).
* Moving after game over throws `IllegalMoveError` with reason `'GAME_OVER'`.

### 5.4 Soak & Deterministic Replay Engine (`tests/replay.test.ts`)
* Simulates **10,000 random games** between random-move agents.
* For each game, records `moveLog: number[]`.
* Replays each game from the initial state by sequentially executing `applyMove` with the recorded `moveLog`.
* Asserts that every replayed game reaches the identical final state, store totals, winner, and move count as the original game.
* Asserts 0 crashes, 0 unhandled exceptions, and 0 invariant violations across all 10,000 games.

---

## 6. Execution Directives & Step-by-Step Task Plan

Follow this sequential checklist to implement Phase 1 cleanly:

### Step 1: Package Configuration & Scripts
Update `engine/package.json` to configure scripts and entrypoints:
```json
{
  "name": "@gebeta/engine",
  "version": "0.1.0",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "bin": {
    "gebeta": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsup src/index.ts src/cli.ts --format cjs,esm --dts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "typecheck": "tsc --noEmit",
    "play": "tsx src/cli.ts"
  }
}
```
Add `"play": "pnpm --filter @gebeta/engine play"` to root `package.json`.

### Step 2: Core Domain Types & Errors
1. Create `engine/src/types.ts`.
2. Create `engine/src/errors.ts`.

### Step 3: Ring Mathematics & Rules
1. Create `engine/src/ring.ts`.
2. Create `engine/src/rules.ts`.
3. Create `engine/tests/ring.test.ts` to verify slot conversions, `oppositeSlot`, and `oppositePit`.

### Step 4: Game State Factory & Legality Checking
1. Create `engine/src/createGame.ts`.
2. Create `engine/src/legalMoves.ts`.
3. Create `engine/tests/legalMoves.test.ts`.

### Step 5: Status, Sweep & Scoring
1. Create `engine/src/status.ts`.
2. Create `engine/tests/status.test.ts`.

### Step 6: State Transition Function (`applyMove`)
1. Create `engine/src/applyMove.ts`.
2. Create `engine/tests/applyMove.test.ts`.
3. Create `engine/tests/rules.test.ts` (R1 to R15).

### Step 7: Shared Protocol Contracts
1. Create `engine/src/protocol.ts`.

### Step 8: Invariants, Edge Cases & Soak Replay
1. Create `engine/tests/invariants.test.ts`.
2. Create `engine/tests/edgeCases.test.ts`.
3. Create `engine/tests/replay.test.ts`.

### Step 9: Public API Barrel & Build
1. Update `engine/src/index.ts` with all exports.
2. Run `pnpm --filter @gebeta/engine build`.
3. Verify that `dist/index.js`, `dist/index.mjs`, `dist/index.d.ts` are generated without errors.

### Step 10: Interactive Terminal CLI
1. Create `engine/src/cli.ts`.
2. Test CLI execution manually via `pnpm play`.

### Step 11: Monorepo Verification & Formatting
1. Run `pnpm typecheck` across all workspace projects.
2. Run `pnpm test` across all workspace projects.
3. Run `pnpm format` and `pnpm format:check`.
4. Run `git status` to verify clean state.

---

## 7. Master Autonomous Execution Prompt

*(The following prompt can be passed directly to an autonomous AI agent to execute Phase 1 from start to finish.)*

```markdown
You are an expert TypeScript engineer tasked with completing Phase 1 (Game Engine) of the Gebeta project.

Workspace Root: `d:\Projects\Gebeta`
Target Package: `@gebeta/engine` (`d:\Projects\Gebeta\engine`)
Reference Docs:
- `docs/Phase_1_Game_Engine_Prompt.md`
- `docs/Game Rules.md`
- `docs/Technical_Guide.md`
- `docs/Coding_Standard.md`

### MISSION:
Implement, test, build, and verify the pure TypeScript Gebeta game engine in `@gebeta/engine` according to the exact specifications in `docs/Phase_1_Game_Engine_Prompt.md`.

### MANDATORY REQUIREMENTS:
1. Zero external runtime dependencies.
2. Pure functions only: no mutation of inputs, zero `Math.random` or `Date.now` in core engine.
3. Comply with TypeScript strict mode and `noUncheckedIndexedAccess: true`.
4. Implement all modules:
   - `src/types.ts`: GameState, Player, Rules, SowStep, MoveResult, WinnerResult
   - `src/errors.ts`: IllegalMoveError, GameOverError
   - `src/ring.ts`: 14-slot circular ring math (`pitToSlot`, `slotToPit`, `oppositeSlot`, `oppositePit`, `storeSlot`, `ownsSlot`, `ownsPit`, `toRing`, `fromRing`)
   - `src/rules.ts`: DEFAULT_RULES, RULES_PRESETS
   - `src/createGame.ts`: createGame() initial factory
   - `src/legalMoves.ts`: legalMoves(), isLegal()
   - `src/status.ts`: checkGameOver(), isSideEmpty(), getWinner(), sweepRing()
   - `src/applyMove.ts`: applyMove() with step tracing, multi-lap handling, captures, extra turns, sweep, and game-over detection
   - `src/protocol.ts`: Shared WebSocket event names, payload interfaces, error codes
   - `src/cli.ts`: Playable ASCII terminal CLI game runner
   - `src/index.ts`: Public API exports
5. Implement complete test suite in `tests/`:
   - `ring.test.ts`
   - `rules.test.ts` (Rules R1 to R15 explicitly mapped)
   - `applyMove.test.ts`
   - `legalMoves.test.ts`
   - `status.test.ts`
   - `invariants.test.ts` (Conservation of seeds = 48, non-negativity, pure immutability)
   - `edgeCases.test.ts` (Laps, chained extra turns, sweep edge cases)
   - `replay.test.ts` (10,000 random game simulations with moveLog deterministic replay)
6. Ensure `engine/package.json` contains:
   - `"build": "tsup src/index.ts src/cli.ts --format cjs,esm --dts"`
   - `"play": "tsx src/cli.ts"`
   Add `"play": "pnpm --filter @gebeta/engine play"` to root `package.json`.
7. Verify all verification commands pass:
   - `pnpm --filter @gebeta/engine build`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm format:check`
```

---

## 8. Definition of Done (DoD) for Phase 1

Phase 1 is officially complete when:
1. [ ] All core files in `@gebeta/engine/src` exist and compile under `tsc --noEmit` with zero errors.
2. [ ] All test files in `@gebeta/engine/tests` run and pass with 100% success rate under `pnpm test`.
3. [ ] All 15 rules from `Game Rules.md` (R1 through R15) have dedicated, passing unit tests.
4. [ ] Invariant tests verify seed conservation (`sum === 48`) and state immutability across all moves.
5. [ ] The 10,000-game soak and replay test passes with zero crashes or desyncs.
6. [ ] `tsup` builds both CommonJS, ESM, and `.d.ts` declaration bundles into `dist/`.
7. [ ] Both `@gebeta/app` and `@gebeta/server` successfully resolve exports from `@gebeta/engine`.
8. [ ] The terminal CLI runner (`pnpm play`) launches and allows two players (or bot) to play a complete game of Gebeta from start to finish.
9. [ ] `pnpm typecheck`, `pnpm test`, and `pnpm format:check` pass cleanly across the entire monorepo.

