import type { Product } from '../types/product';

/**
 * Filter products based on specified criteria
 * @param products Array of products to filter
 * @param resourceType Type of resource ('book', 'pack', 'exam' or 'any')
 * @param level Product level ('basic', 'intermediate', etc. or 'all')
 * @param format Product format ('pdf', 'audio', etc. or 'all')
 * @param searchTerm Optional search term to filter by title, description or editorial
 * @param editorialMap Map of editorial IDs to names for searching by editorial
 * @returns Filtered array of products
 */
export function filterProducts(
  products: Product[],
  resourceType: string = 'any',
  level: string = 'all',
  format: string = 'all',
  searchTerm: string = '',
  editorialMap: Map<string, string> = new Map()
): Product[] {
  // Early return if no products
  if (!products || !products.length) return [];

  // Use Array.filter with combined conditions for better performance
  const filtered = products.filter((product) => {
    // Type filter
    if (resourceType !== 'any' && product.productType !== resourceType) {
      return false;
    }

    // Level filter
    if (level !== 'all' && product.level !== level) {
      return false;
    }

    // Format filter
    if (format !== 'all' && (!product.formatTags || !product.formatTags.includes(format as any))) {
      return false;
    }

    // Search term filter
    if (searchTerm) {
      const normalizedSearchTerm = searchTerm.toLowerCase();
      const titleMatch = product.title.toLowerCase().includes(normalizedSearchTerm);

      // Fixed: Properly check for description property
      const descriptionMatch =
        typeof product.description === 'string' &&
        product.description.toLowerCase().includes(normalizedSearchTerm);

      // Check editorial match for books - use proper type guard
      const editorialMatch =
        product.productType === 'book' &&
        'editorialId' in product &&
        product.editorialId &&
        editorialMap.has(product.editorialId) &&
        editorialMap.get(product.editorialId)?.toLowerCase().includes(normalizedSearchTerm);

      if (!titleMatch && !descriptionMatch && !editorialMatch) {
        return false;
      }
    }

    return true;
  });

  return filtered;
}

/**
 * Sort products based on the specified sort option
 * @param products Array of products to sort
 * @param sortOption Sort option ('price-low', 'price-high', 'bestseller', 'featured', etc.)
 * @returns Sorted array of products
 */
export function sortProducts(products: Product[], sortOption: string = 'featured'): Product[] {
  if (!products || !products.length) return [];

  const sortedProducts = [...products];

  // Handle all sorting options in a switch case for better maintainability
  switch (sortOption) {
    case 'price-low':
      return sortedProducts.sort((a, b) => a.price - b.price);

    case 'price-high':
      return sortedProducts.sort((a, b) => b.price - a.price);

    case 'bestseller':
      return sortedProducts.sort((a, b) => {
        const aIsBestseller = a.popularityTags?.includes('bestSeller') ? 1 : 0;
        const bIsBestseller = b.popularityTags?.includes('bestSeller') ? 1 : 0;

        // If bestseller status is the same, sort by rating as a tiebreaker
        if (aIsBestseller === bIsBestseller) {
          return (b.rating?.score || 0) - (a.rating?.score || 0);
        }

        return bIsBestseller - aIsBestseller;
      });

    case 'newest':
      // If there was a date field, we would sort by that here
      // In future, add date-based sorting
      return sortedProducts;

    case 'name-asc':
      return sortedProducts.sort((a, b) =>
        a.title.localeCompare(b.title, undefined, {
          sensitivity: 'base',
        })
      );

    case 'name-desc':
      return sortedProducts.sort((a, b) =>
        b.title.localeCompare(a.title, undefined, {
          sensitivity: 'base',
        })
      );

    case 'featured':
    default:
      // Sort by featured status, then by bestseller status as secondary criteria
      return sortedProducts.sort((a, b) => {
        if (a.featured !== b.featured) {
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
        // If featured status is the same, check bestseller status
        const aIsBestseller = a.popularityTags?.includes('bestSeller') ? 1 : 0;
        const bIsBestseller = b.popularityTags?.includes('bestSeller') ? 1 : 0;
        return bIsBestseller - aIsBestseller;
      });
  }
}

/**
 * Filter and sort products based on specified criteria
 * @param products Array of products to process
 * @param resourceType Type of resource
 * @param level Product level
 * @param format Product format
 * @param sortOption Sort option
 * @param searchTerm Search term
 * @param editorialMap Editorial ID to name map
 * @returns Filtered and sorted products
 */
export function processProducts(
  products: Product[],
  resourceType: string = 'any',
  level: string = 'all',
  format: string = 'all',
  sortOption: string = 'featured',
  searchTerm: string = '',
  editorialMap: Map<string, string> = new Map()
): Product[] {
  // First filter, then sort
  const filteredProducts = filterProducts(
    products,
    resourceType,
    level,
    format,
    searchTerm,
    editorialMap
  );

  return sortProducts(filteredProducts, sortOption);
}

/**
 * Get product counts by type
 * @param products Array of products
 * @returns Object with counts for each product type
 */
export function getProductCounts(products: Product[]) {
  if (!products || !products.length)
    return {
      totalCount: 0,
      bookCount: 0,
      packCount: 0,
      examCount: 0,
    };

  // Use reduce for a single-pass count of all types
  return products.reduce(
    (counts, product) => {
      counts.totalCount++;

      if (product.productType === 'book') counts.bookCount++;
      else if (product.productType === 'pack') counts.packCount++;
      else if (product.productType === 'exam') counts.examCount++;

      return counts;
    },
    {
      totalCount: 0,
      bookCount: 0,
      packCount: 0,
      examCount: 0,
    }
  );
}

/**
 * Get grid class based on number of columns
 * @param cols Number of columns
 * @returns Tailwind CSS grid class
 */
export function getGridClassFromColumns(cols: number): string {
  const gridClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
  };

  return gridClasses[cols] || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
}
