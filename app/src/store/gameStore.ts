import { create } from 'zustand';
import {
  applyMove,
  createGame,
  isLegal,
  type GameState,
  type MoveResult,
  type Player,
} from '@gebeta/engine';

export type GameMode = 'pass_play' | 'ai' | 'online';

export interface GameStoreState {
  state: GameState;
  mode: GameMode;
  isAnimating: boolean;
  selectedPit: number | null;
  statusMessageKey: string | null;
  statusParams: Record<string, string | number>;
  history: MoveResult[];

  // Actions
  initLocalGame: (firstPlayer?: Player) => void;
  handlePitPress: (pit: number) => Promise<void>;
  resetGame: () => void;
  rematch: () => void;
  setStatusMessage: (key: string | null, params?: Record<string, string | number>) => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  state: createGame(),
  mode: 'pass_play',
  isAnimating: false,
  selectedPit: null,
  statusMessageKey: null,
  statusParams: {},
  history: [],

  initLocalGame: (firstPlayer = 0) => {
    set({
      state: createGame(undefined, firstPlayer),
      mode: 'pass_play',
      isAnimating: false,
      selectedPit: null,
      statusMessageKey: 'game.yourTurn',
      statusParams: { name: firstPlayer === 0 ? 'Player 1' : 'Player 2' },
      history: [],
    });
  },

  handlePitPress: async (pit: number) => {
    const { state, isAnimating } = get();
    if (isAnimating || !isLegal(state, pit)) return;

    // Start animation phase
    set({ isAnimating: true, selectedPit: pit });

    try {
      const result = applyMove(state, pit);
      
      // In a real implementation, we would wait for animations to complete here.
      // For the store logic, we update the state and history.
      set((s) => ({
        state: result.state,
        history: [...s.history, result],
        isAnimating: false, // For now, instant. Will be controlled by UI later.
        selectedPit: null,
      }));

      if (result.extraTurn) {
        get().setStatusMessage('game.goAgain');
      } else if (result.captured > 0) {
        get().setStatusMessage('game.captured', { n: result.captured });
      } else {
        get().setStatusMessage('game.yourTurn', { 
          name: result.state.turn === 0 ? 'Player 1' : 'Player 2' 
        });
      }
    } catch (error) {
      console.error('Move execution failed:', error);
      set({ isAnimating: false, selectedPit: null });
    }
  },

  resetGame: () => {
    set({
      state: createGame(),
      isAnimating: false,
      selectedPit: null,
      statusMessageKey: null,
      history: [],
    });
  },

  rematch: () => {
    const { state, history } = get();
    // Swap starting player or pick loser. Simple swap for now.
    const lastFirstPlayer = history.length > 0 && history[0] ? history[0].state.turn : state.turn;
    const nextFirstPlayer = (lastFirstPlayer === 0 ? 1 : 0) as Player;
    get().initLocalGame(nextFirstPlayer);
  },

  setStatusMessage: (key, params = {}) => {
    set({ statusMessageKey: key, statusParams: params });
  },
}));
