import type { CartItem, ProductType } from './cartManager';
import { calculateDiscountedPrice } from './pricing';

/**
 * A single sellable entity as known at build time — the only source
 * checkout trusts for title/image/price. Built from Content Collections
 * (books/packs/exams/offers), never from anything the browser can edit.
 */
export interface CanonicalProduct {
  id: string;
  type: ProductType;
  title: string;
  image: string;
  /** Final unit price to charge, discount already applied. */
  price: number;
}

export interface ResolvedCartLine {
  id: string;
  type: ProductType;
  title: string;
  image: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ResolvedCart {
  lines: ResolvedCartLine[];
  /** ids present in the stored cart that no longer match any canonical product. */
  removedIds: string[];
  total: number;
}

function catalogKey(id: string, type: ProductType): string {
  return `${type}:${id}`;
}

export function buildCanonicalCatalog(
  entries: Array<{
    id: string;
    type: ProductType;
    title: string;
    image: string;
    price: number;
    discount?: number;
  }>
): CanonicalProduct[] {
  return entries.map((entry) => ({
    id: entry.id,
    type: entry.type,
    title: entry.title,
    image: entry.image,
    price: calculateDiscountedPrice(entry.price, entry.discount ?? 0),
  }));
}

/**
 * Resolve a raw cart (id/type/quantity only) against the canonical catalog.
 * Any cart entry that no longer matches a real product is dropped and its
 * id reported in `removedIds` instead of being trusted for price/title.
 */
export function resolveCart(cart: CartItem[], catalog: CanonicalProduct[]): ResolvedCart {
  const byKey = new Map(catalog.map((product) => [catalogKey(product.id, product.type), product]));

  const lines: ResolvedCartLine[] = [];
  const removedIds: string[] = [];

  for (const item of cart) {
    const product = byKey.get(catalogKey(item.id, item.type));
    if (!product) {
      removedIds.push(item.id);
      continue;
    }

    lines.push({
      id: product.id,
      type: product.type,
      title: product.title,
      image: product.image,
      quantity: item.quantity,
      unitPrice: product.price,
      lineTotal: product.price * item.quantity,
    });
  }

  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  return { lines, removedIds, total };
}
