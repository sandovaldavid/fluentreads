import type { Pack } from '../types/pack';
import { BookLevel, FormatTag, PopularityTag } from '../types/book';
import type { BreadcrumbItem } from '../types/navigation';

/**
 * Interface for level and format name mapping objects
 */
interface NameMapping {
  [key: string]: string;
}

/**
 * Level name mapping with proper type checking
 */
export const levelNames: NameMapping = {
  basic: 'Básico',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  professional: 'Profesional',
  'all-levels': 'Multi-nivel',
};

/**
 * Format name mapping with proper type checking
 */
export const formatNames: NameMapping = {
  pdf: 'PDF',
  workbook: 'Workbooks',
  audio: 'Material con Audio',
  video: 'Material con Video',
  software: 'Software',
  complete: 'Packs Completos',
};

/**
 * Interface for page metadata options
 */
export interface FilterPageOptions {
  level: string;
  format: string;
  baseUrl: string;
  site: URL | string;
}

/**
 * Interface for page metadata result
 */
export interface FilterPageResult {
  pageTitle: string;
  pageDescription: string;
  canonicalUrl: string;
  categoryHeroImage: string;
}

/**
 * Generate page metadata based on filter parameters
 */
export function getFilteredPageTitle({
  level,
  format,
  baseUrl,
  site,
}: FilterPageOptions): FilterPageResult {
  // Default values
  let pageTitle = 'Packs de Libros en Inglés';
  let pageDescription =
    'Explora nuestra colección de packs de libros en inglés. Ahorra con nuestros paquetes especiales que incluyen libros, material digital y recursos adicionales.';
  let canonicalUrl = new URL(baseUrl, site).toString();
  const categoryHeroImage = '/images/packs-hero.jpg';

  // Apply level filter customization
  if (level !== 'all') {
    const levelName = levelNames[level] || level;
    pageTitle = `Packs de Libros - ${levelName}`;
    pageDescription = `Packs de materiales educativos en inglés para ${levelName}. Encuentra los paquetes perfectos para tu nivel de aprendizaje.`;
    canonicalUrl = new URL(`${baseUrl}?level=${level}`, site).toString();
  }

  // Apply format filter customization
  if (format !== 'all') {
    const formatName = formatNames[format] || format;
    pageTitle = `${formatName} - ${pageTitle}`;
    pageDescription = `Packs de ${formatName} ${pageDescription}`;
    canonicalUrl = new URL(`${baseUrl}?format=${format}`, site).toString();
  }

  return {
    pageTitle,
    pageDescription,
    canonicalUrl,
    categoryHeroImage,
  };
}

/**
 * Validate and transform raw pack data to proper Pack objects
 * This ensures we have properly typed and validated Pack objects
 */
export function getSafePacks(packsData: any[]): Pack[] {
  return packsData.map((pack) => ({
    id: pack.id || '',
    title: pack.title || '',
    description: pack.description || '',
    price: pack.price || 0,
    coverImage: pack.coverImage || '',
    altText: `${pack.title} Pack cover`,
    includedItems: pack.includedItems || [],
    rating: pack.rating || { score: 0, reviewCount: 0 },
    buyLink: pack.buyLink || '#',
    detailsLink: pack.detailsLink || '#',
    discount: pack.discount || 0,
    booksIds: pack.booksIds || [],
    level: pack.level as BookLevel,
    formatTags: (pack.formatTags || []) as FormatTag[],
    popularityTags: (pack.popularityTags || []) as PopularityTag[],
    featured: pack.featured || false,
    images: pack.images || [],
    video: pack.video || '',
  }));
}

/**
 * Get standard breadcrumb navigation items for packs page
 */
export function getBreadcrumbItems(): BreadcrumbItem[] {
  return [
    { label: 'Inicio', url: '/' },
    { label: 'Catálogo', url: '/catalogo' },
    { label: 'Packs de Libros', url: '/catalogo/packs', active: true },
  ];
}

/**
 * Filter packs by level and format
 */
export function filterPacks(packs: Pack[], level: string, format: string): Pack[] {
  let filtered = [...packs];

  if (level !== 'all') {
    filtered = filtered.filter((pack) => pack.level === level);
  }

  if (format !== 'all') {
    filtered = filtered.filter(
      (pack) => pack.formatTags && pack.formatTags.includes(format as any)
    );
  }

  return filtered;
}

/**
 * Sort packs by various criteria
 */
export function sortPacks(packs: Pack[], sortType: string): Pack[] {
  const sorted = [...packs];

  switch (sortType) {
    case 'price-low':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'bestseller':
      sorted.sort((a, b) => {
        const aIsBestseller = a.popularityTags?.includes('bestSeller');
        const bIsBestseller = b.popularityTags?.includes('bestSeller');
        if (aIsBestseller && !bIsBestseller) return -1;
        if (!aIsBestseller && bIsBestseller) return 1;
        return (b.rating?.score || 0) - (a.rating?.score || 0);
      });
      break;
    case 'book-count':
      sorted.sort((a, b) => (b.booksIds?.length || 0) - (a.booksIds?.length || 0));
      break;
    case 'featured':
    default:
      sorted.sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));
      break;
  }

  return sorted;
}
