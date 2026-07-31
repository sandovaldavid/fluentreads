import type { ResolvedCartLine } from './catalogPricing';
import { formatPEN } from './pricing';

/**
 * Short, human-typeable id so the buyer and seller can both reference the
 * same request when confirming payment/availability over WhatsApp.
 */
export function generateOrderRequestId(): string {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `FR-${Date.now().toString(36).toUpperCase()}${random}`;
}

/**
 * Build the WhatsApp order message from resolved cart lines (title/price
 * already verified against the canonical catalog — never raw cart data).
 */
export function buildWhatsAppMessage(
  lines: ResolvedCartLine[],
  total: number,
  requestId: string
): string {
  let message = `*Nuevo pedido desde FluentReads*\n*Ref: ${requestId}*\n\n*Productos:*\n`;

  lines.forEach((line, index) => {
    message += `${index + 1}. ${line.title} (${line.quantity}x) - ${formatPEN(line.lineTotal)}\n`;
  });

  message += `\n*Total: ${formatPEN(total)}*\n\nEsta es una solicitud de pedido pendiente de confirmación. El vendedor confirmará disponibilidad, contenido y total antes de recibir la transferencia. ¡Gracias!`;

  return message;
}

/**
 * Build the wa.me deep link that opens WhatsApp with the order message prefilled.
 */
export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
