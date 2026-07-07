import type { FormatTag, PopularityTag, Rating } from './book';

export enum ExamType {
  IELTS = 'IELTS',
  TOEFL = 'TOEFL',
  CAMBRIDGE = 'Cambridge',
  SAT = 'SAT',
  PTE = 'PTE',
  FCE = 'FCE',
  CPE = 'CPE',
  GRE = 'GRE',
  OTHER = 'Other',
}

export enum ExamDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  UPPER_INTERMEDIATE = 'upper-intermediate',
  PROFICIENT = 'proficient',
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  price: number;
  discount?: number | 0;
  coverImage: string;
  images?: string[];
  level?: ExamDifficulty | string;
  video?: string;
  rating?: Rating;
  examType: ExamType | string;
  difficulty: ExamDifficulty | string;
  formatTags?: (FormatTag | string)[];
  popularityTags?: (PopularityTag | string)[];
  featured?: boolean;
  buyLink: string;
  detailsLink: string;
  altText?: string;
  includedItems: string[];
  requirements?: string[];
}
