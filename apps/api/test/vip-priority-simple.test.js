import { describe, test, expect } from '@jest/globals';
import { calculateVipWeight } from '../utils/utils.js';

describe('VIP Priority Simple', () => {
  test('calculateVipWeight basic cases', () => {
    expect(calculateVipWeight(false)).toBe(0);
    expect(() => calculateVipWeight(true)).toThrow('vipLevel must be provided when isVip is true');
    expect(calculateVipWeight(true, 'silver')).toBe(1);
    expect(calculateVipWeight(true, 'gold')).toBe(2);
    expect(calculateVipWeight(true, 'exec')).toBe(3);
  });
});
