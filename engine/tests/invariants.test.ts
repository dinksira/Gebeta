import { applyMove } from '../src/applyMove';
import { createGame } from '../src/createGame';
import {
  createRng,
  freezeState,
  makeState,
  playRandomGame,
  totalSeeds,
} from './testUtils';

describe('engine invariants', () => {
  it('conserves seeds across random games', () => {
    const rng = createRng(12345);

    for (let game = 0; game < 200; game++) {
      const played = playRandomGame(rng);

      expect(totalSeeds(played.finalState)).toBe(48);
      for (const count of played.finalState.pits) {
        expect(count).toBeGreaterThanOrEqual(0);
      }
      expect(played.finalState.stores[0]).toBeGreaterThanOrEqual(0);
      expect(played.finalState.stores[1]).toBeGreaterThanOrEqual(0);
    }
  });

  it('never mutates the input state', () => {
    const state = freezeState(makeState([1, 0, 4, 4, 4, 4, 4, 4, 4, 4, 5, 4]));
    const snapshot = JSON.stringify(state);

    applyMove(state, 0);

    expect(JSON.stringify(state)).toBe(snapshot);
  });

  it('does not mutate a standard starting state', () => {
    const state = freezeState(createGame());
    const snapshot = JSON.stringify(state);

    applyMove(state, 2);

    expect(JSON.stringify(state)).toBe(snapshot);
  });

  it('is deterministic for the same state and move', () => {
    const state = createGame();

    expect(applyMove(state, 1)).toEqual(applyMove(state, 1));
    expect(applyMove(state, 4)).toEqual(applyMove(state, 4));
  });
});
