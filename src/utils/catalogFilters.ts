import type { Product } from '@app-types/product';

// Books and exams describe "level" with two different enums (BookLevel vs
// ExamDifficulty). This is the one place that reconciles them into a single
// vocabulary so filtering by "Básico"/"Intermedio"/"Avanzado" also matches
// exams whose raw difficulty is beginner/upper-intermediate/proficient.
export type CanonicalLevel =
  'basic' | 'intermediate' | 'advanced' | 'professional' | 'all-levels' | 'international-exam';

export type SortOption = 'featured' | 'price-low' | 'price-high' | 'bestseller';

export const DEFAULT_RESOURCE_TYPE = 'any';
export const DEFAULT_LEVEL = 'all';
export const DEFAULT_FORMAT = 'all';
export const DEFAULT_EXAM_TYPE = 'all';
export const DEFAULT_SORT: SortOption = 'featured';
export const DEFAULT_SEARCH = '';

const LEVEL_ALIASES: Record<string, CanonicalLevel> = {
  basic: 'basic',
  beginner: 'basic',
  intermediate: 'intermediate',
  'upper-intermediate': 'intermediate',
  advanced: 'advanced',
  proficient: 'advanced',
  professional: 'professional',
  'all-levels': 'all-levels',
  'international-exam': 'international-exam',
};

export function normalizeLevel(rawLevel: string | undefined | null): CanonicalLevel | undefined {
  if (!rawLevel) return undefined;
  return LEVEL_ALIASES[rawLevel];
}

export interface CatalogFilterCriteria {
  resourceType?: string;
  level?: string;
  format?: string;
  examType?: string;
  search?: string;
}

/** Fully-resolved state — every field defaulted, never undefined. What
 *  parseCatalogParams returns and buildCatalogURL/Filter.tsx's dispatch
 *  contract expect. */
export interface CatalogQueryState {
  resourceType: string;
  level: string;
  format: string;
  examType: string;
  search: string;
  sort: string;
}

/** Single canonical predicate — used both at SSR time and re-run client-side. */
export function filterProducts(products: Product[], criteria: CatalogFilterCriteria): Product[] {
  const {
    resourceType = DEFAULT_RESOURCE_TYPE,
    level = DEFAULT_LEVEL,
    format = DEFAULT_FORMAT,
    examType = DEFAULT_EXAM_TYPE,
    search = DEFAULT_SEARCH,
  } = criteria;

  const normalizedSearch = search.trim().toLowerCase();
  const wantedLevel = level !== DEFAULT_LEVEL ? normalizeLevel(level) : undefined;

  return products.filter((product) => {
    if (resourceType !== DEFAULT_RESOURCE_TYPE && product.productType !== resourceType) {
      return false;
    }

    if (wantedLevel && normalizeLevel(product.level) !== wantedLevel) {
      return false;
    }

    if (format !== DEFAULT_FORMAT && !(product.formatTags ?? []).includes(format)) {
      return false;
    }

    if (examType !== DEFAULT_EXAM_TYPE && product.examType !== examType) {
      return false;
    }

    if (normalizedSearch && !product.title.toLowerCase().includes(normalizedSearch)) {
      return false;
    }

    return true;
  });
}

/** Single canonical comparator set — same ordering rules everywhere. */
export function sortProducts(products: Product[], sort: string = DEFAULT_SORT): Product[] {
  const sorted = [...products];

  switch (sort) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);

    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);

    case 'bestseller':
      return sorted.sort((a, b) => {
        const aBest = a.popularityTags?.includes('bestSeller') ? 1 : 0;
        const bBest = b.popularityTags?.includes('bestSeller') ? 1 : 0;
        if (aBest !== bBest) return bBest - aBest;
        return (b.rating?.score || 0) - (a.rating?.score || 0);
      });

    case 'featured':
    default:
      return sorted.sort((a, b) => {
        const aFeatured = a.featured ? 1 : 0;
        const bFeatured = b.featured ? 1 : 0;
        if (aFeatured !== bFeatured) return bFeatured - aFeatured;
        const aBest = a.popularityTags?.includes('bestSeller') ? 1 : 0;
        const bBest = b.popularityTags?.includes('bestSeller') ? 1 : 0;
        return bBest - aBest;
      });
  }
}

export function processProducts(
  products: Product[],
  criteria: CatalogFilterCriteria,
  sort: string = DEFAULT_SORT
): Product[] {
  return sortProducts(filterProducts(products, criteria), sort);
}

/** One grid-column → Tailwind-class mapping, used by every catalog container. */
export function getGridClassFromColumns(cols: number): string {
  const gridClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
  };

  return gridClasses[cols] || gridClasses[4];
}

/** Single param vocabulary shared by every catalog page: type/level/format/examType/sort/q. */
export function parseCatalogParams(searchParams: URLSearchParams): CatalogQueryState {
  return {
    resourceType: searchParams.get('type') || DEFAULT_RESOURCE_TYPE,
    level: searchParams.get('level') || DEFAULT_LEVEL,
    format: searchParams.get('format') || DEFAULT_FORMAT,
    examType: searchParams.get('examType') || DEFAULT_EXAM_TYPE,
    search: searchParams.get('q') || DEFAULT_SEARCH,
    sort: searchParams.get('sort') || DEFAULT_SORT,
  };
}

export function buildCatalogURL(href: string, state: CatalogQueryState): string {
  const url = new URL(href);

  const setOrDelete = (key: string, value: string | undefined, defaultValue: string) => {
    if (value && value !== defaultValue) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  };

  setOrDelete('type', state.resourceType, DEFAULT_RESOURCE_TYPE);
  setOrDelete('level', state.level, DEFAULT_LEVEL);
  setOrDelete('format', state.format, DEFAULT_FORMAT);
  setOrDelete('examType', state.examType, DEFAULT_EXAM_TYPE);
  setOrDelete('sort', state.sort, DEFAULT_SORT);
  setOrDelete('q', state.search, DEFAULT_SEARCH);

  return url.toString();
}
