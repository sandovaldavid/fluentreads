import type { Book } from '../types/book';
import type { Exam } from '../types/exam';
import type { Pack } from '../types/pack';
import type { Product } from '../types/product';

/**
 * Converts a Book object to a standardized Product type
 */
export function bookToProduct(book: Book): Product {
  return {
    id: book.id,
    title: book.title,
    editorialId: book.editorialId,
    price: book.price,
    discount: book.discount,
    level: book.level,
    popularityTags: book.popularityTags || [],
    coverImage: book.coverImage,
    rating: book.rating,
    formatTags: book.formatTags || [],
    featured: book.featured,
    detailsLink: book.detailsLink,
    altText: book.altText,
    productType: 'book',
  };
}

/**
 * Generate recommendations based on a product and related products
 *
 * @param product The main product (book, pack, or exam)
 * @param relatedProducts Array of related products to choose from
 * @param count Maximum number of recommendations to return
 * @returns Array of recommended products
 */
export function generateRecommendations(
  product: Book | Pack | Exam | Product,
  relatedProducts: Product[] = [],
  count: number = 4
): Product[] {
  // Filter out the current product from related products
  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id);

  // If we don't have enough related products, return what we have
  if (filteredRelated.length <= count) {
    return filteredRelated;
  }

  // Sort related products by relevance
  // First prioritize those that match the same level
  const sameLevel = filteredRelated.filter((p) => p.level === product.level);

  // Then prioritize those that match any format tags
  const hasMatchingFormat = filteredRelated.filter((p) => {
    if (!product.formatTags || !p.formatTags) return false;
    return p.formatTags.some((tag) => product.formatTags?.includes(tag));
  });

  // Combine and deduplicate
  const prioritized = [...sameLevel];

  hasMatchingFormat.forEach((item) => {
    if (!prioritized.some((p) => p.id === item.id)) {
      prioritized.push(item);
    }
  });

  // Add any remaining items if we need more
  let result = [...prioritized];

  if (result.length < count) {
    filteredRelated.forEach((item) => {
      if (!result.some((p) => p.id === item.id) && result.length < count) {
        result.push(item);
      }
    });
  }

  // If we have too many, trim to requested count
  return result.slice(0, count);
}
