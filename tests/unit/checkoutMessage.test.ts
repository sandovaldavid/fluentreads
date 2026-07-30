import { describe, expect, test } from 'bun:test';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '../../src/utils/checkoutMessage';
import type { CartItem } from '../../src/utils/cartManager';

function item(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 'essential-grammar-advanced',
    title: 'Essential Grammar Advanced',
    price: 39.99,
    image: '/img.jpg',
    type: 'book',
    quantity: 1,
    ...overrides,
  };
}

describe('buildWhatsAppMessage', () => {
  test('lists every cart item with quantity and line total', () => {
    const cart = [
      item({ title: 'Book A', price: 10, quantity: 2 }),
      item({ title: 'Book B', price: 5, quantity: 1 }),
    ];

    const message = buildWhatsAppMessage(cart, 25);

    expect(message).toContain('1. Book A (2x) - S/20.00');
    expect(message).toContain('2. Book B (1x) - S/5.00');
  });

  test('includes the header and total footer', () => {
    const message = buildWhatsAppMessage([item({ price: 10, quantity: 1 })], 10);

    expect(message).toStartWith('*Nuevo pedido desde FluentReads*');
    expect(message).toContain('*Total: S/10.00*');
    expect(message).toContain('Por favor, confirmame este pedido');
  });

  test('produces just the header/total when the cart is empty', () => {
    const message = buildWhatsAppMessage([], 0);

    expect(message).toContain('*Productos:*');
    expect(message).toContain('*Total: S/0.00*');
  });
});

describe('buildWhatsAppUrl', () => {
  test('builds a wa.me link with the phone number', () => {
    const url = buildWhatsAppUrl('51987654321', 'hola');
    expect(url).toStartWith('https://wa.me/51987654321?text=');
  });

  test('URL-encodes special characters and line breaks in the message', () => {
    const message = 'Línea 1\n*Total: S/10.00*';
    const url = buildWhatsAppUrl('51987654321', message);

    expect(url).toBe(`https://wa.me/51987654321?text=${encodeURIComponent(message)}`);
    // Raw newlines/asterisks must not leak unescaped into the URL.
    expect(url).not.toContain('\n');
  });
});
