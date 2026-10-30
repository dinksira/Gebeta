import { applyMove } from '../src/applyMove';
import { createGame } from '../src/createGame';
import { getWinner } from '../src/status';
import { createRng, playRandomGame, totalSeeds } from './testUtils';

jest.setTimeout(120000);

describe('deterministic soak and replay', () => {
  it('replays 10,000 random games to identical final states', () => {
    const rng = createRng(987654321);
    let totalMoves = 0;

    for (let game = 0; game < 10000; game++) {
      const played = playRandomGame(rng);
      totalMoves += played.moveLog.length;

      let replayed = createGame(undefined, played.firstPlayer);
      let replayedMoves = 0;
      for (const pit of played.moveLog) {
        replayed = applyMove(replayed, pit).state;
        replayedMoves += 1;
      }

      expect(replayedMoves).toBe(played.moveLog.length);
      expect(replayed).toEqual(played.finalState);
      expect(replayed.over).toBe(true);
      expect(getWinner(replayed)).toBe(getWinner(played.finalState));
      expect(totalSeeds(replayed)).toBe(48);
      for (const count of replayed.pits) {
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }

    expect(totalMoves).toBeGreaterThan(10000);
  });
});
