import { describe, expect, test } from 'bun:test';
import {
  filterProducts,
  sortProducts,
  processProducts,
  normalizeLevel,
  getGridClassFromColumns,
  parseCatalogParams,
  buildCatalogURL,
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

describe('normalizeLevel', () => {
  test('passes canonical BookLevel values through unchanged', () => {
    expect(normalizeLevel('basic')).toBe('basic');
    expect(normalizeLevel('intermediate')).toBe('intermediate');
    expect(normalizeLevel('advanced')).toBe('advanced');
    expect(normalizeLevel('professional')).toBe('professional');
    expect(normalizeLevel('all-levels')).toBe('all-levels');
    expect(normalizeLevel('international-exam')).toBe('international-exam');
  });

  test('reconciles ExamDifficulty values into the same scale as BookLevel', () => {
    expect(normalizeLevel('beginner')).toBe('basic');
    expect(normalizeLevel('upper-intermediate')).toBe('intermediate');
    expect(normalizeLevel('proficient')).toBe('advanced');
  });

  test('returns undefined for unknown or missing values', () => {
    expect(normalizeLevel(undefined)).toBeUndefined();
    expect(normalizeLevel(null)).toBeUndefined();
    expect(normalizeLevel('not-a-real-level')).toBeUndefined();
  });
});

describe('filterProducts', () => {
  const products = [
    product({ id: 'b1', productType: 'book', level: 'basic', formatTags: ['pdf'] }),
    product({ id: 'p1', productType: 'pack', level: 'advanced', formatTags: ['audio'] }),
    product({ id: 'e1', productType: 'exam', level: 'intermediate', formatTags: ['video'] }),
  ];

  test('returns all products with default criteria', () => {
    expect(filterProducts(products, {})).toHaveLength(3);
  });

  test('filters by resource type', () => {
    const result = filterProducts(products, { resourceType: 'pack' });
    expect(result.map((p) => p.id)).toEqual(['p1']);
  });

  test('filters by level', () => {
    const result = filterProducts(products, { level: 'intermediate' });
    expect(result.map((p) => p.id)).toEqual(['e1']);
  });

  test('filtering by an ExamDifficulty-flavored level also matches equivalent BookLevel products', () => {
    // "upper-intermediate" (exam vocabulary) normalizes to the same bucket
    // as "intermediate" (book vocabulary) — see src/utils/catalogFilters.ts.
    const mixed = [
      product({ id: 'book-intermediate', productType: 'book', level: 'intermediate' }),
      product({ id: 'exam-upper-intermediate', productType: 'exam', level: 'upper-intermediate' }),
      product({ id: 'exam-beginner', productType: 'exam', level: 'beginner' }),
    ];
    const result = filterProducts(mixed, { level: 'intermediate' });
    expect(result.map((p) => p.id).sort()).toEqual([
      'book-intermediate',
      'exam-upper-intermediate',
    ]);
  });

  test('filters by format', () => {
    const result = filterProducts(products, { format: 'audio' });
    expect(result.map((p) => p.id)).toEqual(['p1']);
  });

  test('filters by examType', () => {
    const exams = [
      product({ id: 'ielts-1', productType: 'exam', examType: 'IELTS' }),
      product({ id: 'toefl-1', productType: 'exam', examType: 'TOEFL' }),
    ];
    const result = filterProducts(exams, { examType: 'IELTS' });
    expect(result.map((p) => p.id)).toEqual(['ielts-1']);
  });

  test('filters by search term matching the title only', () => {
    const result = filterProducts(
      [
        product({ id: 'x1', title: 'Grammar Essentials' }),
        product({ id: 'x2', title: 'Vocabulary Boost' }),
      ],
      { search: 'grammar' }
    );
    expect(result.map((p) => p.id)).toEqual(['x1']);
  });

  test('search does not match description or editorial (consistent, title-only field)', () => {
    const result = filterProducts(
      [
        {
          ...product({ id: 'x1', title: 'Reading Practice' }),
          description: 'Great for IELTS prep',
        },
        product({ id: 'x2', title: 'Vocabulary Boost' }),
      ],
      { search: 'ielts' }
    );
    expect(result).toHaveLength(0);
  });

  test('combines multiple filters together', () => {
    const result = filterProducts(products, { resourceType: 'book', level: 'basic' });
    expect(result.map((p) => p.id)).toEqual(['b1']);
  });

  test('returns an empty array when given no products', () => {
    expect(filterProducts([], {})).toEqual([]);
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

  test('an unrecognized sort value (including the retired "newest") falls back to featured ordering', () => {
    // "newest" was removed as a selectable option (no real date field to sort
    // by — see issue #56); this documents that it degrades safely instead of
    // throwing or leaving the list unsorted in an undefined order.
    const products = [product({ id: 'plain' }), product({ id: 'featured', featured: true })];
    expect(sortProducts(products, 'newest').map((p) => p.id)).toEqual(['featured', 'plain']);
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

    const result = processProducts(products, { resourceType: 'book' }, 'price-low');
    expect(result.map((p) => p.id)).toEqual(['b', 'a']);
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

describe('parseCatalogParams / buildCatalogURL', () => {
  test('round-trips the full shared param vocabulary', () => {
    const params = new URLSearchParams(
      'type=exam&level=advanced&format=pdf&examType=IELTS&sort=price-low&q=grammar'
    );
    const state = parseCatalogParams(params);
    expect(state).toEqual({
      resourceType: 'exam',
      level: 'advanced',
      format: 'pdf',
      examType: 'IELTS',
      search: 'grammar',
      sort: 'price-low',
    });

    const url = buildCatalogURL('https://example.com/catalogo', state);
    const rebuilt = parseCatalogParams(new URL(url).searchParams);
    expect(rebuilt).toEqual(state);
  });

  test('defaults are omitted from the built URL', () => {
    const url = buildCatalogURL('https://example.com/catalogo', {
      resourceType: 'any',
      level: 'all',
      format: 'all',
      examType: 'all',
      sort: 'featured',
      search: '',
    });
    expect(url).toBe('https://example.com/catalogo');
  });

  test('missing params parse to defaults', () => {
    expect(parseCatalogParams(new URLSearchParams(''))).toEqual({
      resourceType: 'any',
      level: 'all',
      format: 'all',
      examType: 'all',
      search: '',
      sort: 'featured',
    });
  });
});
