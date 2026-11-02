import { useSessionStore } from '../src/store/sessionStore';

describe('sessionStore', () => {
  it('updates player name correctly', () => {
    useSessionStore.getState().setPlayerName('Kaleb');
    expect(useSessionStore.getState().playerName).toBe('Kaleb');
  });

  it('toggles sound and haptics', () => {
    const initialSound = useSessionStore.getState().soundEnabled;
    useSessionStore.getState().toggleSound();
    expect(useSessionStore.getState().soundEnabled).toBe(!initialSound);

    const initialHaptics = useSessionStore.getState().hapticsEnabled;
    useSessionStore.getState().toggleHaptics();
    expect(useSessionStore.getState().hapticsEnabled).toBe(!initialHaptics);
  });
});
