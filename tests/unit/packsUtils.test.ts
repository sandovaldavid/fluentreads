import { describe, expect, test } from 'bun:test';
import { filterPacks, sortPacks, getFilteredPageTitle } from '../../src/utils/packsUtils';
import type { Pack } from '../../src/types/pack';

function pack(overrides: Partial<Pack> = {}): Pack {
  return {
    id: 'pack-1',
    title: 'Sample Pack',
    description: 'A sample pack',
    price: 100,
    coverImage: '/img.jpg',
    booksIds: [],
    includedItems: [],
    detailsLink: '/catalogo/packs/pack-1',
    buyLink: '/checkout',
    level: 'basic',
    formatTags: [],
    popularityTags: [],
    featured: false,
    ...overrides,
  };
}

describe('filterPacks', () => {
  const packs = [
    pack({ id: 'a', level: 'basic', formatTags: ['pdf'] }),
    pack({ id: 'b', level: 'advanced', formatTags: ['audio'] }),
  ];

  test('returns all packs when filters are "all"', () => {
    expect(filterPacks(packs, 'all', 'all')).toHaveLength(2);
  });

  test('filters by level', () => {
    expect(filterPacks(packs, 'advanced', 'all').map((p) => p.id)).toEqual(['b']);
  });

  test('filters by format', () => {
    expect(filterPacks(packs, 'all', 'pdf').map((p) => p.id)).toEqual(['a']);
  });

  test('combines level and format filters', () => {
    expect(filterPacks(packs, 'basic', 'pdf').map((p) => p.id)).toEqual(['a']);
    expect(filterPacks(packs, 'basic', 'audio')).toEqual([]);
  });
});

describe('sortPacks', () => {
  test('sorts by price ascending/descending', () => {
    const packs = [pack({ id: 'a', price: 30 }), pack({ id: 'b', price: 10 })];
    expect(sortPacks(packs, 'price-low').map((p) => p.id)).toEqual(['b', 'a']);
    expect(sortPacks(packs, 'price-high').map((p) => p.id)).toEqual(['a', 'b']);
  });

  test('sorts bestsellers first', () => {
    const packs = [pack({ id: 'a' }), pack({ id: 'b', popularityTags: ['bestSeller'] })];
    expect(sortPacks(packs, 'bestseller').map((p) => p.id)).toEqual(['b', 'a']);
  });

  test('sorts by book count descending', () => {
    const packs = [
      pack({ id: 'small', booksIds: ['x'] }),
      pack({ id: 'large', booksIds: ['x', 'y', 'z'] }),
    ];
    expect(sortPacks(packs, 'book-count').map((p) => p.id)).toEqual(['large', 'small']);
  });

  test('sorts featured first by default', () => {
    const packs = [pack({ id: 'plain' }), pack({ id: 'featured', featured: true })];
    expect(sortPacks(packs, 'featured').map((p) => p.id)).toEqual(['featured', 'plain']);
  });
});

describe('getFilteredPageTitle', () => {
  const site = 'https://fluentreads.com';

  test('returns the default title/description when no filters are active', () => {
    const result = getFilteredPageTitle({
      level: 'all',
      format: 'all',
      baseUrl: '/catalogo/packs',
      site,
    });
    expect(result.pageTitle).toBe('Packs de Libros en Inglés');
    expect(result.canonicalUrl).toBe('https://fluentreads.com/catalogo/packs');
  });

  test('customizes the title/canonical URL for a level filter', () => {
    const result = getFilteredPageTitle({
      level: 'advanced',
      format: 'all',
      baseUrl: '/catalogo/packs',
      site,
    });
    expect(result.pageTitle).toContain('Avanzado');
    expect(result.canonicalUrl).toBe('https://fluentreads.com/catalogo/packs?level=advanced');
  });

  test('combines level and format customization', () => {
    const result = getFilteredPageTitle({
      level: 'basic',
      format: 'audio',
      baseUrl: '/catalogo/packs',
      site,
    });
    expect(result.pageTitle).toBe('Material con Audio - Packs de Libros - Básico');
  });
});
