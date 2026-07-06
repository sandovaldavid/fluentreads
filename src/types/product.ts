import type { Rating, FormatTag, BookLevel, PopularityTag } from './book';
import type { ExamType, ExamDifficulty } from './exam';

export interface Product {
  id: string;
  title: string;
  description?: string;
  editorialId?: string;
  price: number;
  discount?: number | 0;
  level?: BookLevel | ExamDifficulty | string;
  popularityTags?: (PopularityTag | string)[];
  coverImage: string;
  rating?: Rating;
  formatTags: (FormatTag | string)[];
  featured?: boolean;
  detailsLink: string;
  altText?: string;
  examType?: ExamType | string;
  productType: 'book' | 'exam' | 'pack';
}
