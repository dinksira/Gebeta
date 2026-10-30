export const motion = {
  motionFast: 120,      // Button press, small tap feedback
  motionBase: 220,      // Screen transitions, fades
  motionSlow: 360,      // Sheets, dialogs, result reveal
  sowStep: 200,         // Normal single seed drop delay
  sowStepFast: 120,     // Fast animation setting
  captureEffect: 450,   // Flash and sweep duration for captures
  extraTurnPulse: 400,  // Pulse glow on store for extra turn
} as const;
