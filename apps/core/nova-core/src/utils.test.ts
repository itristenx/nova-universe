import { describe, it, expect } from 'vitest';
import { getUrgencyColor, validateEmail, generateRandomString } from './lib/utils';

describe('getUrgencyColor', () => {
  it('returns class names based on urgency', () => {
    expect(getUrgencyColor('urgent')).toBe('bg-red-100 text-red-800 border-red-200');
    expect(getUrgencyColor('high')).toBe('bg-orange-100 text-orange-800 border-orange-200');
    expect(getUrgencyColor('medium')).toBe('bg-yellow-100 text-yellow-800 border-yellow-200');
    expect(getUrgencyColor('low')).toBe('bg-green-100 text-green-800 border-green-200');
    expect(getUrgencyColor('unknown')).toBe('bg-gray-100 text-gray-800 border-gray-200');
  });
});

describe('validateEmail', () => {
  it('validates proper email formats', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('bad-email')).toBe(false);
  });
});

describe('generateRandomString', () => {
  it('returns a string of the requested length', () => {
    const str = generateRandomString(8);
    expect(str).toHaveLength(8);
    expect(/^[A-Za-z0-9]+$/.test(str)).toBe(true);
  });
});
