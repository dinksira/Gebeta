import { useGameStore } from '../src/store/gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('initializes a local game correctly', () => {
    useGameStore.getState().initLocalGame(0);
    const state = useGameStore.getState().state;
    expect(state.turn).toBe(0);
    expect(state.pits).toEqual([4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
    expect(state.stores).toEqual([0, 0]);
  });

  it('handles pit press and executes move', async () => {
    useGameStore.getState().initLocalGame(0);

    // Pit 0 is legal for Player 0
    await useGameStore.getState().handlePitPress(0);
    const state = useGameStore.getState().state;
    const history = useGameStore.getState().history;
    expect(state.pits[0]).toBe(0);
    expect(history.length).toBe(1);
  });
});
