import { create } from 'zustand';
import i18n from '../i18n';

export interface SessionState {
  language: 'en' | 'am';
  playerName: string;
  hapticsEnabled: boolean;
  soundEnabled: boolean;

  setLanguage: (lng: 'en' | 'am') => void;
  setPlayerName: (name: string) => void;
  toggleHaptics: () => void;
  toggleSound: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  language: 'en',
  playerName: 'Player',
  hapticsEnabled: true,
  soundEnabled: true,

  setLanguage: (lng) => {
    i18n.changeLanguage(lng);
    set({ language: lng });
  },
  setPlayerName: (playerName) => set({ playerName }),
  toggleHaptics: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
}));
