// Runtime enum constants for exam catalog values.
// The Exam data shape lives in src/types/content.ts, inferred from the
// Zod schemas in src/content.config.ts (single source of truth, see #57).

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
