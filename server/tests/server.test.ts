import { getServerStatus } from '../src/index';

describe('Gebeta Server Phase 0 Setup', () => {
  it('reports server status and engine version', () => {
    const status = getServerStatus();
    expect(status.status).toBe('ok');
    expect(status.engineVersion).toBe('0.1.0');
  });
});
