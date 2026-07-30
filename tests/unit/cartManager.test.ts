import { describe, expect, test, beforeEach } from 'bun:test';

/**
 * Bun's runtime does not provide `localStorage` outside a browser-like
 * environment. CartManager only touches it inside static methods (never at
 * module-load time), so a minimal in-memory polyfill installed before the
 * tests run is enough to exercise the real implementation.
 */
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

(globalThis as unknown as { localStorage: Storage }).localStorage = new MemoryStorage();

const { CartManager } = await import('../../src/utils/cartManager');

beforeEach(() => {
  localStorage.clear();
});

describe('CartManager.getCart', () => {
  test('returns an empty array when nothing has been stored', () => {
    expect(CartManager.getCart()).toEqual([]);
  });

  test('returns an empty array when the stored value is corrupted JSON', () => {
    localStorage.setItem('shoppingCart', '{not valid json');
    expect(CartManager.getCart()).toEqual([]);
  });
});

describe('CartManager.addItem', () => {
  test('adds a new item with quantity 1', () => {
    CartManager.addItem({ id: 'b1', title: 'Book 1', price: 10, image: '/i.jpg', type: 'book' });
    expect(CartManager.getCart()).toEqual([
      { id: 'b1', title: 'Book 1', price: 10, image: '/i.jpg', type: 'book', quantity: 1 },
    ]);
  });

  test('increments quantity when the same id is added again', () => {
    const item = { id: 'b1', title: 'Book 1', price: 10, image: '/i.jpg', type: 'book' as const };
    CartManager.addItem(item);
    CartManager.addItem(item);
    const cart = CartManager.getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  test('keeps distinct entries for different ids', () => {
    CartManager.addItem({ id: 'b1', title: 'Book 1', price: 10, image: '/i.jpg', type: 'book' });
    CartManager.addItem({ id: 'p1', title: 'Pack 1', price: 20, image: '/i.jpg', type: 'pack' });
    expect(CartManager.getCart()).toHaveLength(2);
  });
});

describe('CartManager.removeItem', () => {
  test('removes only the targeted item', () => {
    CartManager.addItem({ id: 'b1', title: 'Book 1', price: 10, image: '/i.jpg', type: 'book' });
    CartManager.addItem({ id: 'b2', title: 'Book 2', price: 15, image: '/i.jpg', type: 'book' });
    CartManager.removeItem('b1');
    const cart = CartManager.getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].id).toBe('b2');
  });
});

describe('CartManager.updateQuantity', () => {
  test('updates the quantity of an existing item', () => {
    CartManager.addItem({ id: 'b1', title: 'Book 1', price: 10, image: '/i.jpg', type: 'book' });
    CartManager.updateQuantity('b1', 5);
    expect(CartManager.getCart()[0].quantity).toBe(5);
  });

  test('ignores updates to a quantity below 1', () => {
    CartManager.addItem({ id: 'b1', title: 'Book 1', price: 10, image: '/i.jpg', type: 'book' });
    CartManager.updateQuantity('b1', 0);
    expect(CartManager.getCart()[0].quantity).toBe(1);
  });

  test('is a no-op for an id that is not in the cart', () => {
    CartManager.updateQuantity('missing', 3);
    expect(CartManager.getCart()).toEqual([]);
  });
});

describe('CartManager.clearCart', () => {
  test('empties the cart', () => {
    CartManager.addItem({ id: 'b1', title: 'Book 1', price: 10, image: '/i.jpg', type: 'book' });
    CartManager.clearCart();
    expect(CartManager.getCart()).toEqual([]);
  });
});

describe('CartManager.getItemCount', () => {
  test('sums quantities across all items', () => {
    CartManager.addItem({ id: 'b1', title: 'Book 1', price: 10, image: '/i.jpg', type: 'book' });
    CartManager.updateQuantity('b1', 3);
    CartManager.addItem({ id: 'b2', title: 'Book 2', price: 10, image: '/i.jpg', type: 'book' });
    expect(CartManager.getItemCount()).toBe(4);
  });
});

describe('CartManager.getCartTotal', () => {
  test('sums price * quantity across all items', () => {
    CartManager.addItem({ id: 'b1', title: 'Book 1', price: 10, image: '/i.jpg', type: 'book' });
    CartManager.updateQuantity('b1', 2);
    CartManager.addItem({ id: 'b2', title: 'Book 2', price: 5, image: '/i.jpg', type: 'book' });
    expect(CartManager.getCartTotal()).toBe(25);
  });

  test('returns 0 for an empty cart', () => {
    expect(CartManager.getCartTotal()).toBe(0);
  });
});
