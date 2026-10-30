export const spacing = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space5: 20,
  space6: 24,
  space8: 32,
  space12: 48,
  space16: 64,
} as const;

export const radius = {
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 20,
  radiusFull: 999,
} as const;

export const elevations = {
  card: {
    shadowColor: '#3B2417',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  board: {
    shadowColor: '#1C120C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 8,
  },
} as const;
