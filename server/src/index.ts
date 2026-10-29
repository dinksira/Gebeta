import { ENGINE_VERSION } from '@gebeta/engine';

export function getServerStatus(): { status: string; engineVersion: string } {
  return {
    status: 'ok',
    engineVersion: ENGINE_VERSION,
  };
}
