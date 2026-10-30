import type { Rules } from './types';

/**
 * Default v1 rules: Kalah-style 6x4 Gebeta.
 */
export const DEFAULT_RULES: Rules = Object.freeze({
  pitsPerSide: 6,
  seedsPerPit: 4,
  extraTurnOnStore: true,
  capture: true,
  relaySowing: false,
});

/**
 * Named rule presets. The id is stored with every match.
 */
export const RULES_PRESETS: Record<string, Rules> = Object.freeze({
  kalah6x4: DEFAULT_RULES,
});
