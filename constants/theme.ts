export const Colors = {
  black: '#0A0A0A',
  white: '#FFFFFF',
  gray: '#6B6B6B',
  lightGray: '#A0A0A0',
  ultraLight: '#F5F5F5',
  border: '#F0F0F0',
  divider: '#E0E0E0',
  overdue: '#111111',
  card: '#FFFFFF',
  bg: '#F8F8F8',
};

export const Critical = {
  1: '#CCCCCC',
  2: '#999999',
  3: '#666666',
  4: '#333333',
  5: '#000000',
} as Record<number, string>;

export const CriticalNames = {
  1: 'Low',
  2: 'Moderate',
  3: 'Important',
  4: 'High',
  5: 'Critical',
} as Record<number, string>;

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  chip: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
};
