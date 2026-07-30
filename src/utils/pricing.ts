/**
 * Pricing helpers shared by product cards and checkout.
 * Keeping discount math and currency formatting in one place avoids
 * duplicated `price * (1 - discount / 100)` formulas drifting apart.
 */

/**
 * Apply a percentage discount to a price.
 * @param price Base price (PEN)
 * @param discountPercent Discount percentage in the 0-100 range
 */
export function calculateDiscountedPrice(price: number, discountPercent: number = 0): number {
  if (!discountPercent || discountPercent <= 0) return price;
  return price * (1 - discountPercent / 100);
}

/**
 * Format an amount as Peruvian Sol currency (S/1234.50).
 */
export function formatPEN(amount: number): string {
  return `S/${amount.toFixed(2)}`;
}
