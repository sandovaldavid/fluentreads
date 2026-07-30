import { describe, expect, test } from 'bun:test';
import {
  filterProducts,
  sortProducts,
  processProducts,
  getProductCounts,
  getGridClassFromColumns,
} from '../../src/utils/catalogFilters';
import type { Product } from '../../src/types/product';

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    title: 'Sample Product',
    description: 'A sample description',
    price: 50,
    coverImage: '/img.jpg',
    formatTags: ['pdf'],
    detailsLink: '/catalogo/libros/p1',
    productType: 'book',
    level: 'basic',
    featured: false,
    popularityTags: [],
    ...overrides,
  };
}

describe('filterProducts', () => {
  const products = [
    product({ id: 'b1', productType: 'book', level: 'basic', formatTags: ['pdf'] }),
    product({ id: 'p1', productType: 'pack', level: 'advanced', formatTags: ['audio'] }),
    product({ id: 'e1', productType: 'exam', level: 'intermediate', formatTags: ['video'] }),
  ];

  test('returns all products when filters are "any"/"all"', () => {
    expect(filterProducts(products)).toHaveLength(3);
  });

  test('filters by resource type', () => {
    const result = filterProducts(products, 'pack');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p1');
  });

  test('filters by level', () => {
    const result = filterProducts(products, 'any', 'intermediate');
    expect(result.map((p) => p.id)).toEqual(['e1']);
  });

  test('filters by format', () => {
    const result = filterProducts(products, 'any', 'all', 'audio');
    expect(result.map((p) => p.id)).toEqual(['p1']);
  });

  test('filters by search term matching the title', () => {
    const result = filterProducts(
      [
        product({ id: 'x1', title: 'Grammar Essentials' }),
        product({ id: 'x2', title: 'Vocabulary Boost' }),
      ],
      'any',
      'all',
      'all',
      'grammar'
    );
    expect(result.map((p) => p.id)).toEqual(['x1']);
  });

  test('filters by search term matching the description', () => {
    const result = filterProducts(
      [
        product({ id: 'x1', description: 'Great for IELTS prep' }),
        product({ id: 'x2', description: 'General reading' }),
      ],
      'any',
      'all',
      'all',
      'ielts'
    );
    expect(result.map((p) => p.id)).toEqual(['x1']);
  });

  test('filters by editorial name via the editorial map', () => {
    const books = [
      { ...product({ id: 'x1', title: 'Book One' }), editorialId: 'cambridge' } as Product,
      { ...product({ id: 'x2', title: 'Book Two' }), editorialId: 'oxford' } as Product,
    ];
    const editorialMap = new Map([
      ['cambridge', 'Cambridge University Press'],
      ['oxford', 'Oxford Press'],
    ]);

    const result = filterProducts(books, 'any', 'all', 'all', 'cambridge', editorialMap);
    expect(result.map((p) => p.id)).toEqual(['x1']);
  });

  test('combines multiple filters together', () => {
    const result = filterProducts(products, 'book', 'basic');
    expect(result.map((p) => p.id)).toEqual(['b1']);
  });

  test('returns an empty array when given no products', () => {
    expect(filterProducts([])).toEqual([]);
  });
});

describe('sortProducts', () => {
  test('sorts by price ascending', () => {
    const products = [
      product({ id: 'a', price: 30 }),
      product({ id: 'b', price: 10 }),
      product({ id: 'c', price: 20 }),
    ];
    expect(sortProducts(products, 'price-low').map((p) => p.id)).toEqual(['b', 'c', 'a']);
  });

  test('sorts by price descending', () => {
    const products = [
      product({ id: 'a', price: 30 }),
      product({ id: 'b', price: 10 }),
      product({ id: 'c', price: 20 }),
    ];
    expect(sortProducts(products, 'price-high').map((p) => p.id)).toEqual(['a', 'c', 'b']);
  });

  test('sorts bestsellers first, tiebreaking by rating', () => {
    const products = [
      product({
        id: 'low-rating-bestseller',
        popularityTags: ['bestSeller'],
        rating: { score: 3, reviewCount: 1 },
      }),
      product({ id: 'not-bestseller', rating: { score: 5, reviewCount: 1 } }),
      product({
        id: 'high-rating-bestseller',
        popularityTags: ['bestSeller'],
        rating: { score: 4.5, reviewCount: 1 },
      }),
    ];
    expect(sortProducts(products, 'bestseller').map((p) => p.id)).toEqual([
      'high-rating-bestseller',
      'low-rating-bestseller',
      'not-bestseller',
    ]);
  });

  test('sorts featured first, bestseller as secondary criteria', () => {
    const products = [
      product({ id: 'plain' }),
      product({ id: 'featured', featured: true }),
      product({ id: 'bestseller', popularityTags: ['bestSeller'] }),
    ];
    expect(sortProducts(products, 'featured').map((p) => p.id)).toEqual([
      'featured',
      'bestseller',
      'plain',
    ]);
  });

  test('sorts alphabetically ascending and descending', () => {
    const products = [product({ id: 'a', title: 'Banana' }), product({ id: 'b', title: 'Apple' })];
    expect(sortProducts(products, 'name-asc').map((p) => p.id)).toEqual(['b', 'a']);
    expect(sortProducts(products, 'name-desc').map((p) => p.id)).toEqual(['a', 'b']);
  });

  test('"newest" is a no-op today (no date field to sort by)', () => {
    const products = [product({ id: 'a' }), product({ id: 'b' })];
    expect(sortProducts(products, 'newest').map((p) => p.id)).toEqual(['a', 'b']);
  });

  test('returns an empty array when given no products', () => {
    expect(sortProducts([], 'featured')).toEqual([]);
  });
});

describe('processProducts', () => {
  test('filters then sorts in a single call', () => {
    const products = [
      product({ id: 'a', productType: 'book', price: 30 }),
      product({ id: 'b', productType: 'book', price: 10 }),
      product({ id: 'c', productType: 'pack', price: 5 }),
    ];

    const result = processProducts(products, 'book', 'all', 'all', 'price-low');
    expect(result.map((p) => p.id)).toEqual(['b', 'a']);
  });
});

describe('getProductCounts', () => {
  test('counts each product type plus a total', () => {
    const products = [
      product({ productType: 'book' }),
      product({ productType: 'book' }),
      product({ productType: 'pack' }),
      product({ productType: 'exam' }),
    ];
    expect(getProductCounts(products)).toEqual({
      totalCount: 4,
      bookCount: 2,
      packCount: 1,
      examCount: 1,
    });
  });

  test('returns all zeros for an empty list', () => {
    expect(getProductCounts([])).toEqual({
      totalCount: 0,
      bookCount: 0,
      packCount: 0,
      examCount: 0,
    });
  });
});

describe('getGridClassFromColumns', () => {
  test('returns the matching grid class for known column counts', () => {
    expect(getGridClassFromColumns(3)).toBe('grid-cols-1 sm:grid-cols-2 lg:grid-cols-3');
  });

  test('falls back to a default class for unknown column counts', () => {
    expect(getGridClassFromColumns(99)).toBe(
      'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    );
  });
});
