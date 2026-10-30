import { applyMove } from '../src/applyMove';
import { createGame } from '../src/createGame';
import { DEFAULT_RULES } from '../src/rules';
import { makeState } from './testUtils';

describe('applyMove', () => {
  it('returns a step trace that distinguishes pits and stores', () => {
    const result = applyMove(createGame(), 2);

    expect(result.steps.map((step) => step.slot)).toEqual([3, 4, 5, 6]);
    expect(result.steps.map((step) => step.kind)).toEqual([
      'drop',
      'drop',
      'drop',
      'store',
    ]);
  });

  it('keeps the same turn after an extra turn', () => {
    const result = applyMove(createGame(), 2);

    expect(result.extraTurn).toBe(true);
    expect(result.state.turn).toBe(0);
  });

  it('passes the turn when the last seed is not in the store', () => {
    const result = applyMove(createGame(), 0);

    expect(result.extraTurn).toBe(false);
    expect(result.state.turn).toBe(1);
  });

  it('allows a second move after an extra turn', () => {
    const first = applyMove(createGame(), 2);
    const second = applyMove(first.state, 4);

    expect(second.state.turn).toBe(1);
    expect(second.state.stores[0]).toBe(2);
  });

  it('captures the landing seed and the opposite pit', () => {
    const state = makeState([1, 0, 4, 4, 4, 4, 4, 4, 4, 4, 5, 4]);
    const result = applyMove(state, 0);

    expect(result.captured).toBe(6);
    expect(result.state.stores[0]).toBe(6);
  });

  it('sows around the board without touching the opponent store', () => {
    const state = makeState([14, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
    const result = applyMove(state, 0);

    expect(result.steps).toHaveLength(14);
    expect(result.steps.some((step) => step.slot === 13)).toBe(false);
    expect(result.state.pits[0]).toBe(1);
    expect(result.state.stores[0]).toBe(1);
  });

  it('honors the capture rule toggle', () => {
    const state = makeState([1, 0, 4, 4, 4, 4, 4, 4, 4, 4, 5, 4]);
    const result = applyMove(state, 0, { ...DEFAULT_RULES, capture: false });

    expect(result.captured).toBe(0);
    expect(result.state.pits[1]).toBe(1);
    expect(result.state.pits[10]).toBe(5);
  });

  it('honors the extra turn rule toggle', () => {
    const result = applyMove(createGame(), 2, {
      ...DEFAULT_RULES,
      extraTurnOnStore: false,
    });

    expect(result.extraTurn).toBe(false);
    expect(result.state.turn).toBe(1);
    expect(result.state.stores[0]).toBe(1);
  });
});
