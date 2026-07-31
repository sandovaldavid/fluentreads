import { getCollection } from 'astro:content';
import type { Product } from '../types/product';

/**
 * Retrieves all products from the validated Content Collections, converting
 * them to the unified Product type. This is the canonical source — nothing
 * should import src/data/*.json directly for books/packs/exams. See #57.
 * @returns Array of all products (books, packs, exams)
 */
export async function getAllProducts(): Promise<Product[]> {
  const [books, packs, exams] = await Promise.all([
    getCollection('books'),
    getCollection('packs'),
    getCollection('exams'),
  ]);

  const processedBooks: Product[] = books.map((entry) => ({
    ...entry.data,
    productType: 'book' as const,
  }));

  const processedPacks: Product[] = packs.map((entry) => ({
    ...entry.data,
    productType: 'pack' as const,
  }));

  const processedExams: Product[] = exams.map((entry) => ({
    ...entry.data,
    productType: 'exam' as const,
    level: entry.data.difficulty, // Map difficulty to level for consistent filtering
    detailsLink: entry.data.detailsLink || `/catalogo/examenes-internacionales/${entry.data.id}`,
  }));

  return [...processedBooks, ...processedPacks, ...processedExams];
}

/**
 * Get products filtered by type
 * @param type Product type to filter by ('book', 'pack', or 'exam')
 * @param count Maximum number of products to return (optional)
 * @returns Array of products of the specified type
 */
export async function getProductsByType(
  type: 'book' | 'pack' | 'exam',
  count?: number
): Promise<Product[]> {
  const allProducts = await getAllProducts();
  const filteredByType = allProducts.filter((product) => product.productType === type);

  if (count) {
    return filteredByType.slice(0, Math.min(count, filteredByType.length));
  }

  return filteredByType;
}

/**
 * Get products by level
 * @param level The level to filter by
 * @param count Maximum number of products to return
 * @returns Array of products of the specified level
 */
export async function getProductsByLevel(level: string, count?: number): Promise<Product[]> {
  const allProducts = await getAllProducts();
  const filteredByLevel = allProducts.filter((product) => product.level === level);

  if (count) {
    return filteredByLevel.slice(0, Math.min(count, filteredByLevel.length));
  }

  return filteredByLevel;
}
