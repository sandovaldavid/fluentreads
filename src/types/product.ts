// Unified view type across books, packs and exams. Not a collection shape —
// built by listProducts.ts from the collection data. The per-collection
// shapes live in src/types/content.ts, inferred from the Zod schemas.

export interface Product {
  id: string;
  title: string;
  description?: string;
  editorialId?: string;
  price: number;
  discount?: number | 0;
  offerDays?: number;
  level?: string;
  popularityTags?: string[];
  coverImage: string;
  images?: string[];
  video?: string;
  rating?: { score: number; reviewCount: number };
  formatTags: string[];
  featured?: boolean;
  detailsLink: string;
  altText?: string;
  examType?: string;
  includedItems?: string[];
  booksIds?: string[];
  productType: 'book' | 'exam' | 'pack';
}
