import { applyMove } from '../src/applyMove';
import { getWinner } from '../src/status';
import { expectIllegalMove, makeState } from './testUtils';

describe('engine edge cases', () => {
  it('allows several extra turns in a row', () => {
    const state = makeState([0, 0, 0, 3, 2, 1, 4, 4, 4, 4, 4, 4]);

    const first = applyMove(state, 5);
    const second = applyMove(first.state, 4);
    const third = applyMove(second.state, 3);

    expect(first.extraTurn).toBe(true);
    expect(second.extraTurn).toBe(true);
    expect(third.extraTurn).toBe(true);
    expect(third.state.turn).toBe(0);
    expect(third.state.stores[0]).toBe(3);
  });

  it('ends immediately when an extra turn empties the mover side', () => {
    const state = makeState([0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4]);
    const result = applyMove(state, 5);

    expect(result.extraTurn).toBe(true);
    expect(result.state.over).toBe(true);
    expect(result.state.pits).toEqual(Array(12).fill(0));
    expect(result.state.stores).toEqual([1, 24]);
    expect(getWinner(result.state)).toBe(1);
  });

  it('ends immediately when an extra turn leaves the opponent side empty', () => {
    const state = makeState([0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]);
    const result = applyMove(state, 5);

    expect(result.extraTurn).toBe(true);
    expect(result.state.over).toBe(true);
    expect(result.state.stores).toEqual([1, 0]);
    expect(getWinner(result.state)).toBe(0);
  });

  it('handles a double lap with 27 seeds', () => {
    const state = makeState([27, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const result = applyMove(state, 0);

    expect(result.steps).toHaveLength(27);
    expect(result.steps.some((step) => step.slot === 13)).toBe(false);
    expect(result.state.pits[0]).toBe(2);
    expect(result.state.pits[1]).toBe(3);
    expect(result.state.stores).toEqual([2, 0]);
    expect(result.captured).toBe(0);
  });

  it('rejects moves after the game is over', () => {
    const state = makeState(Array(12).fill(0), [24, 24], 0, true);

    expectIllegalMove(() => applyMove(state, 0), 'GAME_OVER');
  });
});
