import { describe, expect, test } from 'bun:test';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  generateOrderRequestId,
} from '../../src/utils/checkoutMessage';
import type { ResolvedCartLine } from '../../src/utils/catalogPricing';

function line(overrides: Partial<ResolvedCartLine> = {}): ResolvedCartLine {
  return {
    id: 'essential-grammar-advanced',
    type: 'book',
    title: 'Essential Grammar Advanced',
    image: '/img.jpg',
    quantity: 1,
    unitPrice: 39.99,
    lineTotal: 39.99,
    ...overrides,
  };
}

describe('buildWhatsAppMessage', () => {
  test('lists every cart line with quantity and line total', () => {
    const lines = [
      line({ title: 'Book A', unitPrice: 10, quantity: 2, lineTotal: 20 }),
      line({ title: 'Book B', unitPrice: 5, quantity: 1, lineTotal: 5 }),
    ];

    const message = buildWhatsAppMessage(lines, 25, 'FR-TEST1234');

    expect(message).toContain('1. Book A (2x) - S/20.00');
    expect(message).toContain('2. Book B (1x) - S/5.00');
  });

  test('includes the header, request id, and total footer', () => {
    const message = buildWhatsAppMessage(
      [line({ unitPrice: 10, quantity: 1, lineTotal: 10 })],
      10,
      'FR-ABC123'
    );

    expect(message).toStartWith('*Nuevo pedido desde FluentReads*');
    expect(message).toContain('*Ref: FR-ABC123*');
    expect(message).toContain('*Total: S/10.00*');
    expect(message).toContain('solicitud de pedido pendiente de confirmación');
  });

  test('produces just the header/total when the cart is empty', () => {
    const message = buildWhatsAppMessage([], 0, 'FR-EMPTY01');

    expect(message).toContain('*Productos:*');
    expect(message).toContain('*Total: S/0.00*');
  });

  test('uses the pre-computed lineTotal rather than recomputing from unitPrice * quantity', () => {
    // Guards against silently trusting a mismatched lineTotal/unitPrice pair
    // instead of whatever resolveCart() actually computed.
    const message = buildWhatsAppMessage(
      [line({ unitPrice: 999, quantity: 1, lineTotal: 10 })],
      10,
      'FR-GUARD01'
    );
    expect(message).toContain('S/10.00');
    expect(message).not.toContain('S/999.00');
  });
});

describe('generateOrderRequestId', () => {
  test('produces an FR-prefixed id', () => {
    expect(generateOrderRequestId()).toMatch(/^FR-[A-Z0-9]+$/);
  });

  test('produces different ids on successive calls', () => {
    const ids = new Set(Array.from({ length: 20 }, () => generateOrderRequestId()));
    expect(ids.size).toBeGreaterThan(1);
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
