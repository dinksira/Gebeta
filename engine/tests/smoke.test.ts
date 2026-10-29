import { ENGINE_VERSION } from '../src/index';

describe('Gebeta Engine Phase 0 Setup', () => {
  it('loads the engine module with semantic version', () => {
    expect(ENGINE_VERSION).toBe('0.1.0');
  });
});
