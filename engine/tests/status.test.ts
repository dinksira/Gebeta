import { checkGameOver, getWinner, isSideEmpty, sweepRing } from '../src/status';
import { makeState } from './testUtils';

describe('game status', () => {
  it('detects an empty side', () => {
    const state = makeState([4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0]);

    expect(isSideEmpty(state, 0)).toBe(false);
    expect(isSideEmpty(state, 1)).toBe(true);
  });

  it('ends when either side is empty', () => {
    expect(checkGameOver(makeState([0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4]))).toBe(true);
    expect(checkGameOver(makeState([4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0]))).toBe(true);
    expect(checkGameOver(makeState(Array(12).fill(4)))).toBe(false);
  });

  it('returns the winner only once the game is over', () => {
    expect(getWinner(makeState(Array(12).fill(4), [10, 5]))).toBeNull();
    expect(getWinner(makeState(Array(12).fill(0), [10, 5], 0, true))).toBe(0);
    expect(getWinner(makeState(Array(12).fill(0), [5, 10], 0, true))).toBe(1);
    expect(getWinner(makeState(Array(12).fill(0), [7, 7], 0, true))).toBe('draw');
  });

  it('sweeps each side into its own store', () => {
    const ring = [1, 2, 3, 0, 0, 0, 4, 5, 6, 0, 0, 0, 0, 7];
    const swept = sweepRing(ring);

    expect(swept).toEqual({ p0Swept: 6, p1Swept: 11 });
    expect(ring[6]).toBe(10);
    expect(ring[13]).toBe(18);
    expect(ring.slice(0, 6)).toEqual([0, 0, 0, 0, 0, 0]);
    expect(ring.slice(7, 13)).toEqual([0, 0, 0, 0, 0, 0]);
  });
});
