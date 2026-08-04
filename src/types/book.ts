// Runtime enum constants for book catalog values.
// The Book data shape lives in src/types/content.ts, inferred from the
// Zod schemas in src/content.config.ts (single source of truth, see #57).

export enum BookLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  ALL_LEVELS = 'all-levels',
  PROFESSIONAL = 'professional',
  INTERNATIONAL_EXAM = 'international-exam',
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
