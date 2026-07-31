import { describe, expect, test } from 'bun:test';
import {
  buildCanonicalCatalog,
  resolveCart,
  type CanonicalProduct,
} from '../../src/utils/catalogPricing';
import type { CartItem } from '../../src/utils/cartManager';

const catalog: CanonicalProduct[] = buildCanonicalCatalog([
  { id: 'book-1', type: 'book', title: 'Book One', image: '/book-1.jpg', price: 100, discount: 0 },
  { id: 'book-2', type: 'book', title: 'Book Two', image: '/book-2.jpg', price: 50, discount: 20 },
  { id: 'pack-1', type: 'pack', title: 'Pack One', image: '/pack-1.jpg', price: 200, discount: 10 },
]);

function cartItem(overrides: Partial<CartItem> = {}): CartItem {
  return { id: 'book-1', type: 'book', quantity: 1, ...overrides };
}

describe('buildCanonicalCatalog', () => {
  test('bakes the discount into the canonical price', () => {
    const [, book2] = catalog;
    expect(book2.price).toBeCloseTo(40, 5); // 50 * (1 - 20/100)
  });

  test('leaves an undiscounted price untouched', () => {
    const [book1] = catalog;
    expect(book1.price).toBe(100);
  });
});

describe('resolveCart', () => {
  test('resolves title/image/price from the catalog, not the cart item', () => {
    const resolved = resolveCart([cartItem({ id: 'book-1', quantity: 2 })], catalog);

    expect(resolved.lines).toEqual([
      {
        id: 'book-1',
        type: 'book',
        title: 'Book One',
        image: '/book-1.jpg',
        quantity: 2,
        unitPrice: 100,
        lineTotal: 200,
      },
    ]);
    expect(resolved.total).toBe(200);
    expect(resolved.removedIds).toEqual([]);
  });

  test('applies the catalog discount when computing the line total', () => {
    const resolved = resolveCart([cartItem({ id: 'book-2', quantity: 3 })], catalog);

    expect(resolved.lines[0].unitPrice).toBeCloseTo(40, 5);
    expect(resolved.lines[0].lineTotal).toBeCloseTo(120, 5);
  });

  test('drops cart entries that no longer match any catalog product', () => {
    const resolved = resolveCart(
      [cartItem({ id: 'book-1' }), cartItem({ id: 'deleted-product' })],
      catalog
    );

    expect(resolved.lines).toHaveLength(1);
    expect(resolved.lines[0].id).toBe('book-1');
    expect(resolved.removedIds).toEqual(['deleted-product']);
  });

  test('distinguishes products with the same id but different types', () => {
    const catalogWithCollision: CanonicalProduct[] = buildCanonicalCatalog([
      { id: 'shared-id', type: 'book', title: 'The Book', image: '/b.jpg', price: 10 },
      { id: 'shared-id', type: 'offer', title: 'The Offer', image: '/o.jpg', price: 999 },
    ]);

    const resolved = resolveCart(
      [cartItem({ id: 'shared-id', type: 'book' })],
      catalogWithCollision
    );

    expect(resolved.lines).toHaveLength(1);
    expect(resolved.lines[0].title).toBe('The Book');
    expect(resolved.lines[0].unitPrice).toBe(10);
  });

  test('ignores a tampered price/title on the raw cart item entirely', () => {
    // CartItem shouldn't even carry these fields, but simulate a
    // maliciously-edited localStorage payload reaching resolveCart anyway.
    const tampered = {
      id: 'book-1',
      type: 'book',
      quantity: 1,
      price: 0.01,
      title: 'Hacked',
    } as CartItem;

    const resolved = resolveCart([tampered], catalog);

    expect(resolved.lines[0].unitPrice).toBe(100);
    expect(resolved.lines[0].title).toBe('Book One');
  });

  test('sums line totals across multiple products', () => {
    const resolved = resolveCart(
      [
        cartItem({ id: 'book-1', quantity: 1 }),
        cartItem({ id: 'pack-1', type: 'pack', quantity: 2 }),
      ],
      catalog
    );

    // book-1: 100 * 1 = 100; pack-1: (200 * 0.9) * 2 = 360
    expect(resolved.total).toBeCloseTo(460, 5);
  });

  test('returns an empty result for an empty cart', () => {
    const resolved = resolveCart([], catalog);
    expect(resolved).toEqual({ lines: [], removedIds: [], total: 0 });
  });
});
