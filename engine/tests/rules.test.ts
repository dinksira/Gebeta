import { applyMove } from '../src/applyMove';
import { createGame } from '../src/createGame';
import { getWinner } from '../src/status';
import { legalMoves } from '../src/legalMoves';
import { oppositePit, oppositeSlot } from '../src/ring';
import { expectIllegalMove, makeState, totalSeeds } from './testUtils';

describe('Game Rules R1-R15', () => {
  it('R1: starts with 48 seeds, 4 per pit, empty stores, Player 0 to move', () => {
    const state = createGame();

    expect(state.pits).toEqual([4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
    expect(state.stores).toEqual([0, 0]);
    expect(state.turn).toBe(0);
    expect(state.over).toBe(false);
    expect(totalSeeds(state)).toBe(48);
  });

  it('R2: opposite pit is 11 minus pit and opposite slot is 12 minus slot', () => {
    for (let pit = 0; pit <= 11; pit++) {
      expect(oppositePit(pit)).toBe(11 - pit);
    }
    for (let slot = 0; slot <= 5; slot++) {
      expect(oppositeSlot(slot)).toBe(12 - slot);
    }
    for (let slot = 7; slot <= 12; slot++) {
      expect(oppositeSlot(slot)).toBe(12 - slot);
    }
  });

  it('R3: sows counterclockwise starting with the next slot', () => {
    const result = applyMove(createGame(), 0);

    expect(result.state.pits).toEqual([0, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4]);
    expect(result.state.stores).toEqual([0, 0]);
    expect(result.state.turn).toBe(1);
    expect(result.steps.map((step) => step.slot)).toEqual([1, 2, 3, 4]);
  });

  it('R4: never feeds the opponent store', () => {
    const tenSeeds = applyMove(makeState([10, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]), 0);
    expect(tenSeeds.state.stores[1]).toBe(0);

    const lap = applyMove(makeState([14, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]), 0);
    expect(lap.state.stores[1]).toBe(0);
    expect(lap.steps.some((step) => step.slot === 13)).toBe(false);
  });

  it('R5: laps skip the opponent store on every pass', () => {
    const state = makeState([15, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
    const result = applyMove(state, 0);
    const slots = result.steps.map((step) => step.slot);

    expect(result.steps).toHaveLength(15);
    expect(slots.filter((slot) => slot === 0)).toHaveLength(1);
    expect(slots.some((slot) => slot === 13)).toBe(false);
    expect(result.state.stores[1]).toBe(0);
  });

  it('R6: a 13-seed move lands back in the starting pit and can capture', () => {
    const state = makeState([0, 0, 0, 13, 0, 0, 0, 0, 2, 0, 0, 0]);
    const result = applyMove(state, 3);

    expect(result.steps[result.steps.length - 1]?.slot).toBe(3);
    expect(result.captured).toBe(4);
    expect(result.state.pits[3]).toBe(0);
    expect(result.state.pits[8]).toBe(0);
    expect(result.state.stores[0]).toBe(5);
  });

  it('R7: last seed in the store grants an extra turn', () => {
    const result = applyMove(createGame(), 2);

    expect(result.extraTurn).toBe(true);
    expect(result.state.turn).toBe(0);
    expect(result.state.pits).toEqual([4, 4, 0, 5, 5, 5, 4, 4, 4, 4, 4, 4]);
    expect(result.state.stores).toEqual([1, 0]);
  });

  it('R8: captures an empty own pit with a loaded opposite pit', () => {
    const state = makeState([1, 0, 4, 4, 4, 4, 4, 4, 4, 4, 5, 4]);
    const result = applyMove(state, 0);

    expect(result.captured).toBe(6);
    expect(result.state.pits[0]).toBe(0);
    expect(result.state.pits[1]).toBe(0);
    expect(result.state.pits[10]).toBe(0);
    expect(result.state.stores[0]).toBe(6);
    expect(result.state.turn).toBe(1);
  });

  it('R9: does not capture when the opposite pit is empty', () => {
    const state = makeState([1, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 4]);
    const result = applyMove(state, 0);

    expect(result.captured).toBe(0);
    expect(result.state.pits[1]).toBe(1);
    expect(result.state.stores[0]).toBe(0);
    expect(result.state.turn).toBe(1);
  });

  it('R10: does not capture on the opponent side', () => {
    const state = makeState([4, 4, 4, 4, 5, 4, 4, 4, 0, 4, 4, 4]);
    const result = applyMove(state, 4);

    expect(result.steps[result.steps.length - 1]?.slot).toBe(9);
    expect(result.captured).toBe(0);
    expect(result.state.pits[8]).toBe(1);
    expect(result.state.stores[0]).toBe(1);
    expect(result.state.turn).toBe(1);
  });

  it('R11: ends the game when either side is empty', () => {
    const state = makeState([4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0], [0, 24]);
    const result = applyMove(state, 0);

    expect(result.state.over).toBe(true);
    expect(getWinner(result.state)).toBe('draw');
  });

  it('R12: sweeps leftovers into the correct owner stores', () => {
    const state = makeState([4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0], [0, 24]);
    const result = applyMove(state, 0);

    expect(result.state.pits).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(result.state.stores).toEqual([24, 24]);
  });

  it('R13: equal stores give a draw', () => {
    expect(getWinner(makeState(Array(12).fill(0), [24, 24], 0, true))).toBe('draw');
    expect(getWinner(makeState(Array(12).fill(0), [25, 23], 0, true))).toBe(0);
    expect(getWinner(makeState(Array(12).fill(0), [23, 25], 0, true))).toBe(1);
    expect(getWinner(createGame())).toBeNull();
  });

  it('R14: illegal moves throw and change nothing', () => {
    const emptyPit = makeState([0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
    expectIllegalMove(() => applyMove(emptyPit, 0), 'PIT_EMPTY');
    expectIllegalMove(() => applyMove(createGame(), 6), 'NOT_OWN_PIT');
    expectIllegalMove(() => applyMove(createGame(), -1), 'OUT_OF_BOUNDS');
    expectIllegalMove(() => applyMove(createGame(), 12), 'OUT_OF_BOUNDS');
    expectIllegalMove(() => applyMove(createGame(), 1.5), 'OUT_OF_BOUNDS');
    expectIllegalMove(
      () => applyMove(makeState(Array(12).fill(4), [0, 0], 0, true), 0),
      'GAME_OVER',
    );

    const frozen = makeState([0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
    const snapshot = JSON.stringify(frozen);
    expectIllegalMove(() => applyMove(frozen, 0), 'PIT_EMPTY');
    expect(JSON.stringify(frozen)).toBe(snapshot);
  });

  it('R15: total seeds always equals 48', () => {
    let state = createGame();

    while (!state.over) {
      expect(totalSeeds(state)).toBe(48);
      const pit = legalMoves(state)[0] ?? 0;
      state = applyMove(state, pit).state;
    }

    expect(totalSeeds(state)).toBe(48);
  });
});
