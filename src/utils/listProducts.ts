import type { Product } from '../types/product';

import booksData from '../data/books.json';
import packsData from '../data/packs.json';
import examsData from '../data/exams.json';

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

  // Return the combined array of products
  return [...processedBooks, ...processedPacks, ...processedExams];
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
