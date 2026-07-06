import type { Product } from '../types/product';

import booksData from '../database/books.json';
import packsData from '../database/packs.json';
import examsData from '../database/exams.json';

/**
 * Retrieves all products from the database, converting them to the unified Product type
 * @returns Array of all products (books, packs, exams)
 */
export function getAllProducts(): Product[] {
  // Process books and add productType property
  const processedBooks: Product[] = booksData.map((book) => ({
    ...book,
    productType: 'book' as const,
  }));

  // Process packs and add productType property
  const processedPacks: Product[] = Array.isArray(packsData)
    ? packsData.map((pack) => ({
        ...pack,
        productType: 'pack' as const,
      }))
    : [];

  // Process exams and add productType property
  // Fix: Ensure examsData is properly processed as an array
  const examDataArray = Array.isArray(examsData) ? examsData : [examsData];
  const processedExams: Product[] = examDataArray.map((exam) => ({
    ...exam,
    productType: 'exam' as const,
    level: exam.difficulty, // Map difficulty to level for consistent filtering
    detailsLink: exam.detailsLink || `/catalogo/examenes-internacionales/${exam.id}`, // Ensure proper link format
  }));

  // Log counts for debugging
  console.log(`Processed ${processedBooks.length} books`);
  console.log(`Processed ${processedPacks.length} packs`);
  console.log(`Processed ${processedExams.length} exams`);

  // Return the combined array of products
  return [...processedBooks, ...processedPacks, ...processedExams];
}

/**
 * Get a random selection of products
 * @param count Number of products to return
 * @param filterFn Optional filter function to apply
 * @returns Array of random products
 */
export function getRandomProducts(
  count: number,
  filterFn?: (product: Product) => boolean
): Product[] {
  const allProducts = getAllProducts();

  // Apply filter if provided
  const filteredProducts = filterFn ? allProducts.filter(filterFn) : allProducts;

  // Shuffle the products array using Fisher-Yates algorithm
  const shuffled = [...filteredProducts];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Return the requested number of products, or all if count exceeds available products
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get products filtered by type
 * @param type Product type to filter by ('book', 'pack', or 'exam')
 * @param count Maximum number of products to return (optional)
 * @returns Array of products of the specified type
 */
export function getProductsByType(type: 'book' | 'pack' | 'exam', count?: number): Product[] {
  const allProducts = getAllProducts();
  const filteredByType = allProducts.filter((product) => product.productType === type);

  if (count) {
    return filteredByType.slice(0, Math.min(count, filteredByType.length));
  }

  return filteredByType;
}

/**
 * Get featured products across all types or of a specific type
 * @param count Number of featured products to return
 * @param type Optional product type to filter by
 * @returns Array of featured products
 */
export function getFeaturedProducts(count: number, type?: 'book' | 'pack' | 'exam'): Product[] {
  return getRandomProducts(count, (product) => {
    const typeMatch = type ? product.productType === type : true;
    return typeMatch && !!product.featured;
  });
}

/**
 * Get products by level
 * @param level The level to filter by
 * @param count Maximum number of products to return
 * @returns Array of products of the specified level
 */
export function getProductsByLevel(level: string, count?: number): Product[] {
  const allProducts = getAllProducts();
  const filteredByLevel = allProducts.filter((product) => product.level === level);

  if (count) {
    return filteredByLevel.slice(0, Math.min(count, filteredByLevel.length));
  }

  return filteredByLevel;
}

/**
 * Get bestseller products
 * @param count Number of bestseller products to return
 * @returns Array of bestseller products
 */
export function getBestsellerProducts(count: number): Product[] {
  return getRandomProducts(
    count,
    (product) =>
      Array.isArray(product.popularityTags) && product.popularityTags.includes('bestSeller')
  );
}
