import type { FormatTag, PopularityTag, Rating, BookLevel } from './book';

export interface Pack {
  id: string;
  title: string;
  description: string;
  price: number;
  discount?: number | 0;
  offerDays?: number;
  coverImage: string;
  images?: string[];
  video?: string;
  booksIds: string[];
  rating?: Rating;
  level?: BookLevel | string;
  formatTags?: (FormatTag | string)[];
  popularityTags?: (PopularityTag | string)[];
  featured?: boolean;
  detailsLink: string;
  buyLink: string;
  altText?: string;
  includedItems: string[];
  stock?: number;
}
