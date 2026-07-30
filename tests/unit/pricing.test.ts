import { describe, expect, test } from 'bun:test';
import { calculateDiscountedPrice, formatPEN } from '../../src/utils/pricing';

describe('calculateDiscountedPrice', () => {
  test('returns the original price when there is no discount', () => {
    expect(calculateDiscountedPrice(100, 0)).toBe(100);
  });

  test('returns the original price when discount is undefined', () => {
    expect(calculateDiscountedPrice(100)).toBe(100);
  });

  test('applies a partial discount correctly', () => {
    expect(calculateDiscountedPrice(100, 25)).toBeCloseTo(75, 5);
  });

  test('applies a full 100% discount down to zero', () => {
    expect(calculateDiscountedPrice(50, 100)).toBe(0);
  });

  test('ignores negative discounts and returns the original price', () => {
    expect(calculateDiscountedPrice(100, -10)).toBe(100);
  });

  test('matches the previous inline formula used by product cards', () => {
    const price = 39.99;
    const discount = 15;
    const expected = price * (1 - discount / 100);
    expect(calculateDiscountedPrice(price, discount)).toBeCloseTo(expected, 10);
  });
});

describe('formatPEN', () => {
  test('formats whole numbers with two decimals and the S/ prefix', () => {
    expect(formatPEN(100)).toBe('S/100.00');
  });

  test('rounds to two decimals', () => {
    expect(formatPEN(19.995)).toBe('S/20.00');
  });

  test('formats zero correctly', () => {
    expect(formatPEN(0)).toBe('S/0.00');
  });
});
