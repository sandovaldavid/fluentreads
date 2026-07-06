// Book-related type definitions

export enum BookLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  ALL_LEVELS = 'all_levels',
  PROFESSIONAL = 'professional',
  INTERNATIONAL_EXAM = 'internationalExam',
}

export enum FormatTag {
  PDF = 'pdf',
  WORKBOOK = 'workbook',
  AUDIO = 'audio',
  VIDEO = 'video',
  SOFTWARE = 'software',
  EXAMS = 'exams',
}

export enum PopularityTag {
  BESTSELLER = 'bestSeller',
  NEW = 'new',
  SPECIAL_OFFER = 'specialOffer',
  COMPLETE_PACK = 'completePack',
  RECOMMENDED = 'recommended',
}

export interface Rating {
  score: number;
  reviewCount: number;
}

export interface Book {
  id: string;
  title: string;
  description: string;
  price: number;
  editorialId: string;
  discount?: number | 0;
  offerDays?: number | 0;
  coverImage: string;
  images?: string[];
  video?: string;
  rating?: Rating;
  level?: BookLevel | string;
  formatTags?: (FormatTag | string)[];
  popularityTags?: (PopularityTag | string)[];
  featured?: boolean;
  detailsLink: string;
  buyLink: string;
  altText?: string;
  includedItems: string[];
}
