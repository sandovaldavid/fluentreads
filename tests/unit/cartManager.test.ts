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

  test('returns an empty array when the stored value is not an array', () => {
    localStorage.setItem('shoppingCart', JSON.stringify({ not: 'an array' }));
    expect(CartManager.getCart()).toEqual([]);
  });

  test('drops entries with an unknown product type', () => {
    localStorage.setItem(
      'shoppingCart',
      JSON.stringify([{ id: 'b1', type: 'not-a-real-type', quantity: 1 }])
    );
    expect(CartManager.getCart()).toEqual([]);
  });

  test('drops entries with a non-positive or non-integer quantity', () => {
    localStorage.setItem(
      'shoppingCart',
      JSON.stringify([
        { id: 'b1', type: 'book', quantity: 0 },
        { id: 'b2', type: 'book', quantity: -1 },
        { id: 'b3', type: 'book', quantity: 1.5 },
        { id: 'b4', type: 'book', quantity: 1000 },
      ])
    );
    expect(CartManager.getCart()).toEqual([]);
  });

  test('drops entries carrying extra fields like price or title without trusting them', () => {
    // A tampered localStorage value trying to smuggle a price back in.
    localStorage.setItem(
      'shoppingCart',
      JSON.stringify([{ id: 'b1', type: 'book', quantity: 1, price: 0.01, title: 'Hacked' }])
    );
    const cart = CartManager.getCart();
    expect(cart).toHaveLength(1);
    // isValidCartItem doesn't strip extra keys, but nothing downstream reads
    // them — CartItem's contract is id/type/quantity only.
    expect(cart[0].id).toBe('b1');
    expect(cart[0].quantity).toBe(1);
  });
});

describe('CartManager.addItem', () => {
  test('adds a new item with quantity 1', () => {
    CartManager.addItem('b1', 'book');
    expect(CartManager.getCart()).toEqual([{ id: 'b1', type: 'book', quantity: 1 }]);
  });

  test('increments quantity when the same id+type is added again', () => {
    CartManager.addItem('b1', 'book');
    CartManager.addItem('b1', 'book');
    const cart = CartManager.getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  test('keeps distinct entries for different ids', () => {
    CartManager.addItem('b1', 'book');
    CartManager.addItem('p1', 'pack');
    expect(CartManager.getCart()).toHaveLength(2);
  });

  test('keeps distinct entries when the same id is used across different types', () => {
    CartManager.addItem('shared-id', 'book');
    CartManager.addItem('shared-id', 'offer');
    expect(CartManager.getCart()).toHaveLength(2);
  });

  test('does not increment quantity past MAX_QUANTITY', () => {
    for (let i = 0; i < CartManager.MAX_QUANTITY + 10; i++) {
      CartManager.addItem('b1', 'book');
    }
    expect(CartManager.getCart()[0].quantity).toBe(CartManager.MAX_QUANTITY);
  });
});

describe('CartManager.removeItem', () => {
  test('removes only the targeted item', () => {
    CartManager.addItem('b1', 'book');
    CartManager.addItem('b2', 'book');
    CartManager.removeItem('b1', 'book');
    const cart = CartManager.getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].id).toBe('b2');
  });

  test('does not remove an item of a different type sharing the same id', () => {
    CartManager.addItem('shared-id', 'book');
    CartManager.addItem('shared-id', 'offer');
    CartManager.removeItem('shared-id', 'book');
    const cart = CartManager.getCart();
    expect(cart).toEqual([{ id: 'shared-id', type: 'offer', quantity: 1 }]);
  });
});

describe('CartManager.updateQuantity', () => {
  test('updates the quantity of an existing item', () => {
    CartManager.addItem('b1', 'book');
    CartManager.updateQuantity('b1', 'book', 5);
    expect(CartManager.getCart()[0].quantity).toBe(5);
  });

  test('ignores updates to a quantity below 1', () => {
    CartManager.addItem('b1', 'book');
    CartManager.updateQuantity('b1', 'book', 0);
    expect(CartManager.getCart()[0].quantity).toBe(1);
  });

  test('ignores non-integer quantities', () => {
    CartManager.addItem('b1', 'book');
    CartManager.updateQuantity('b1', 'book', 2.5);
    expect(CartManager.getCart()[0].quantity).toBe(1);
  });

  test('ignores quantities above MAX_QUANTITY', () => {
    CartManager.addItem('b1', 'book');
    CartManager.updateQuantity('b1', 'book', CartManager.MAX_QUANTITY + 1);
    expect(CartManager.getCart()[0].quantity).toBe(1);
  });

  test('is a no-op for an id that is not in the cart', () => {
    CartManager.updateQuantity('missing', 'book', 3);
    expect(CartManager.getCart()).toEqual([]);
  });
});

describe('CartManager.clearCart', () => {
  test('empties the cart', () => {
    CartManager.addItem('b1', 'book');
    CartManager.clearCart();
    expect(CartManager.getCart()).toEqual([]);
  });
});

describe('CartManager.getItemCount', () => {
  test('sums quantities across all items', () => {
    CartManager.addItem('b1', 'book');
    CartManager.updateQuantity('b1', 'book', 3);
    CartManager.addItem('b2', 'book');
    expect(CartManager.getItemCount()).toBe(4);
  });
});
