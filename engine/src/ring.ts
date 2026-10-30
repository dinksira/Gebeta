import type { GameState, Player } from './types';

const RING_SIZE = 14;
const PITS_PER_SIDE = 6;
const STORE_0 = 6;
const STORE_1 = 13;

/**
 * Converts a pit index (0..11) to its ring slot.
 */
export function pitToSlot(pit: number): number {
  if (!Number.isInteger(pit) || pit < 0 || pit > 11) {
    throw new RangeError(`Pit must be an integer from 0 to 11, received ${pit}`);
  }
  return pit < PITS_PER_SIDE ? pit : pit + 1;
}

/**
 * Converts a ring slot (0..13) to its pit index. Store slots are not pits.
 */
export function slotToPit(slot: number): number {
  if (!Number.isInteger(slot) || slot < 0 || slot >= RING_SIZE) {
    throw new RangeError(`Slot must be an integer from 0 to 13, received ${slot}`);
  }
  if (isStoreSlot(slot)) {
    throw new RangeError(`Slot ${slot} is a store, not a pit`);
  }
  return slot < STORE_0 ? slot : slot - 1;
}

/**
 * Returns the opposite ring slot. Only meaningful for pit slots.
 */
export function oppositeSlot(slot: number): number {
  if (!Number.isInteger(slot) || slot < 0 || slot >= RING_SIZE) {
    throw new RangeError(`Slot must be an integer from 0 to 13, received ${slot}`);
  }
  return 12 - slot;
}

/**
 * Returns the opposite pit index (11 minus pit).
 */
export function oppositePit(pit: number): number {
  if (!Number.isInteger(pit) || pit < 0 || pit > 11) {
    throw new RangeError(`Pit must be an integer from 0 to 11, received ${pit}`);
  }
  return 11 - pit;
}

/**
 * Returns the store slot owned by a player.
 */
export function storeSlot(player: Player): number {
  return player === 0 ? STORE_0 : STORE_1;
}

/**
 * Returns true when a pit slot belongs to the given player.
 */
export function ownsSlot(player: Player, slot: number): boolean {
  if (!isPitSlot(slot)) return false;
  return player === 0 ? slot < STORE_0 : slot > STORE_0;
}

/**
 * Returns true when a pit index belongs to the given player.
 */
export function ownsPit(player: Player, pit: number): boolean {
  if (!Number.isInteger(pit) || pit < 0 || pit > 11) return false;
  return player === 0 ? pit < PITS_PER_SIDE : pit >= PITS_PER_SIDE;
}

/**
 * Returns true for slots 0..5 and 7..12.
 */
export function isPitSlot(slot: number): boolean {
  return Number.isInteger(slot) && slot >= 0 && slot < RING_SIZE && !isStoreSlot(slot);
}

/**
 * Returns true for the two store slots, 6 and 13.
 */
export function isStoreSlot(slot: number): boolean {
  return slot === STORE_0 || slot === STORE_1;
}

/**
 * Expands a game state into a 14-slot working ring.
 */
export function toRing(state: GameState): number[] {
  return [
    ...state.pits.slice(0, PITS_PER_SIDE),
    state.stores[0],
    ...state.pits.slice(PITS_PER_SIDE, PITS_PER_SIDE * 2),
    state.stores[1],
  ];
}

/**
 * Rebuilds an immutable game state from a 14-slot ring.
 */
export function fromRing(
  ring: readonly number[],
  turn: Player,
  over: boolean,
): GameState {
  return {
    pits: [...ring.slice(0, PITS_PER_SIDE), ...ring.slice(7, 13)],
    stores: [ring[STORE_0] ?? 0, ring[STORE_1] ?? 0],
    turn,
    over,
  };
}
