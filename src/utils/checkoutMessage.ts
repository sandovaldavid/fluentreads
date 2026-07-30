import type { CartItem } from './cartManager';
import { formatPEN } from './pricing';

/**
 * Build the WhatsApp order message from the current cart contents.
 * Extracted from checkout.astro so the exact wording/format is unit-testable.
 */
export function buildWhatsAppMessage(cart: CartItem[], total: number): string {
  let message = `*Nuevo pedido desde FluentReads*\n\n*Productos:*\n`;

  cart.forEach((item, index) => {
    message += `${index + 1}. ${item.title} (${item.quantity}x) - ${formatPEN(item.price * item.quantity)}\n`;
  });

  message += `\n*Total: ${formatPEN(total)}*\n\nPor favor, confirmame este pedido para enviarte los datos de pago. ¡Gracias!`;

  return message;
}

/**
 * Build the wa.me deep link that opens WhatsApp with the order message prefilled.
 */
export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
