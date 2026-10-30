export const colors = {
  // Wood & Board Palette
  woodDark: '#3B2417',        // Board frame, deep shadows, carved borders
  woodMid: '#6B4228',         // Board surface
  woodLight: '#A06A3C',       // Board highlights, rim light
  woodGlow: '#C98F56',        // Legal pit glow, active player accents
  pitDeep: '#2A180F',         // Inside hollow of carved pits
  pitInner: '#4A2C1A',        // Pit inner gradient highlight

  // Brand & Accents
  saffron: '#E3A21A',         // Primary action buttons, highlights
  saffronPressed: '#C48712',  // Pressed button state
  forest: '#2F6B4F',          // Player 0 marker, success, secondary brand
  terracotta: '#B8442F',      // Player 1 marker, danger, captures, loss

  // Neutrals (Light Theme / Parchment)
  bg: '#F7EFE3',              // App background (aged Ethiopian parchment)
  surface: '#FFFFFF',         // Cards, sheets, dialog surfaces
  surfaceAlt: '#EFE3D0',      // Secondary surface, input fields
  border: '#D9C8AE',          // Subtle dividers, outlines
  textPrimary: '#2A1B12',     // Dark coffee brown main text (high contrast)
  textSecondary: '#6E5A4B',   // Muted supporting text
  textOnWood: '#F7EFE3',      // Text rendered on wooden boards
  textOnBrand: '#2A1B12',     // Dark text on saffron (never white on saffron!)

  // Status & Feedback
  success: '#2F6B4F',
  warning: '#D98A0B',
  danger: '#B8442F',
  info: '#3E6E8E',

  // River Stone Seed Palette (Stable determinism by seed index)
  seedIvory: '#EADBC0',
  seedSand: '#D2B48C',
  seedClay: '#B5573A',
  seedOlive: '#7A7A3A',
  seedSlate: '#5E6B6B',
} as const;

export const SEED_COLORS = [
  colors.seedIvory,
  colors.seedSand,
  colors.seedClay,
  colors.seedOlive,
  colors.seedSlate,
] as const;
