import { createGame } from '../src/createGame';
import {
  fromRing,
  isPitSlot,
  isStoreSlot,
  oppositePit,
  oppositeSlot,
  ownsPit,
  ownsSlot,
  pitToSlot,
  slotToPit,
  storeSlot,
  toRing,
} from '../src/ring';

describe('ring mathematics', () => {
  it('maps pits to ring slots', () => {
    expect([0, 1, 2, 3, 4, 5].map(pitToSlot)).toEqual([0, 1, 2, 3, 4, 5]);
    expect([6, 7, 8, 9, 10, 11].map(pitToSlot)).toEqual([7, 8, 9, 10, 11, 12]);
  });

  it('maps ring slots back to pits', () => {
    expect([0, 1, 2, 3, 4, 5].map(slotToPit)).toEqual([0, 1, 2, 3, 4, 5]);
    expect([7, 8, 9, 10, 11, 12].map(slotToPit)).toEqual([6, 7, 8, 9, 10, 11]);
  });

  it('rejects invalid pits and store slots', () => {
    expect(() => pitToSlot(-1)).toThrow(RangeError);
    expect(() => pitToSlot(12)).toThrow(RangeError);
    expect(() => pitToSlot(1.5)).toThrow(RangeError);
    expect(() => slotToPit(-1)).toThrow(RangeError);
    expect(() => slotToPit(14)).toThrow(RangeError);
    expect(() => slotToPit(6)).toThrow(RangeError);
    expect(() => slotToPit(13)).toThrow(RangeError);
  });

  it('computes opposite slots and pits', () => {
    for (let slot = 0; slot <= 5; slot++) {
      expect(oppositeSlot(slot)).toBe(12 - slot);
    }
    for (let slot = 7; slot <= 12; slot++) {
      expect(oppositeSlot(slot)).toBe(12 - slot);
    }
    for (let pit = 0; pit <= 11; pit++) {
      expect(oppositePit(pit)).toBe(11 - pit);
    }
    expect(oppositeSlot(0)).toBe(12);
    expect(oppositeSlot(5)).toBe(7);
    expect(oppositeSlot(7)).toBe(5);
    expect(oppositeSlot(12)).toBe(0);
  });

  it('identifies stores and ownership', () => {
    expect(storeSlot(0)).toBe(6);
    expect(storeSlot(1)).toBe(13);

    for (let slot = 0; slot <= 5; slot++) {
      expect(ownsSlot(0, slot)).toBe(true);
      expect(ownsSlot(1, slot)).toBe(false);
    }
    for (let slot = 7; slot <= 12; slot++) {
      expect(ownsSlot(1, slot)).toBe(true);
      expect(ownsSlot(0, slot)).toBe(false);
    }
    expect(ownsSlot(0, 6)).toBe(false);
    expect(ownsSlot(1, 13)).toBe(false);

    for (let pit = 0; pit <= 5; pit++) {
      expect(ownsPit(0, pit)).toBe(true);
      expect(ownsPit(1, pit)).toBe(false);
    }
    for (let pit = 6; pit <= 11; pit++) {
      expect(ownsPit(1, pit)).toBe(true);
      expect(ownsPit(0, pit)).toBe(false);
    }
    expect(ownsPit(0, 12)).toBe(false);
  });

  it('classifies pit and store slots', () => {
    for (const slot of [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12]) {
      expect(isPitSlot(slot)).toBe(true);
      expect(isStoreSlot(slot)).toBe(false);
    }
    for (const slot of [6, 13]) {
      expect(isPitSlot(slot)).toBe(false);
      expect(isStoreSlot(slot)).toBe(true);
    }
    expect(isPitSlot(-1)).toBe(false);
    expect(isPitSlot(14)).toBe(false);
  });

  it('round-trips a game state through the ring', () => {
    const state = createGame();
    const ring = toRing(state);

    expect(ring).toEqual([4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]);
    expect(fromRing(ring, state.turn, state.over)).toEqual(state);
  });
});
