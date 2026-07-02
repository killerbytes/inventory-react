import { describe, it, expect, vi } from 'vitest';
import { formatCurrency, getScore } from './formatters';

// Mock the environment variable for the currency
vi.stubEnv('VITE_CURRENCY', 'PHP');

describe('Formatters & Utilities', () => {
  describe('formatCurrency', () => {
    it('formats a number to PHP currency', () => {
      const result = formatCurrency(1000);
      // Depending on Node version/locale, Intl.NumberFormat might return a slightly different spacing.
      // But it should contain the number and the currency symbol.
      expect(result).toMatch(/1,000\.00/);
    });

    it('formats zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toMatch(/0\.00/);
    });
  });

  describe('getScore', () => {
    it('returns 100 for an exact match', () => {
      expect(getScore('Steel Bar', 'Steel Bar')).toBe(100);
    });

    it('returns 80 for a startsWith match', () => {
      expect(getScore('Steel Bar 999', 'Steel Bar')).toBe(80);
    });

    it('returns 50 for an includes match', () => {
      expect(getScore('Test Steel Bar 999', 'Steel Bar')).toBe(50);
    });

    it('returns 0 for no match', () => {
      expect(getScore('Cement', 'Steel')).toBe(0);
    });
  });
});
