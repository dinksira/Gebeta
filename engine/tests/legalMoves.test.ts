import { createGame } from '../src/createGame';
import { isLegal, legalMoves } from '../src/legalMoves';
import { makeState } from './testUtils';

describe('legal move checks', () => {
  it('returns every non-empty pit on the current player side', () => {
    expect(legalMoves(createGame())).toEqual([0, 1, 2, 3, 4, 5]);
    expect(legalMoves(createGame(undefined, 1))).toEqual([6, 7, 8, 9, 10, 11]);
  });

  it('skips empty pits', () => {
    const state = makeState([0, 1, 0, 2, 0, 3, 4, 4, 4, 4, 4, 4]);
    expect(legalMoves(state)).toEqual([1, 3, 5]);
  });

  it('rejects opponent pits and out-of-bounds pits', () => {
    const state = createGame();

    expect(isLegal(state, 6)).toBe(false);
    expect(isLegal(state, -1)).toBe(false);
    expect(isLegal(state, 12)).toBe(false);
    expect(isLegal(state, 1.5)).toBe(false);
    expect(isLegal(state, 0)).toBe(true);
  });

  it('returns no moves after the game is over', () => {
    const state = makeState(Array(12).fill(4), [0, 0], 0, true);

    expect(legalMoves(state)).toEqual([]);
    expect(isLegal(state, 0)).toBe(false);
  });
});
