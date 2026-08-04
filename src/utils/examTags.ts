import { ExamDifficulty } from '../types/exam';

export const difficultyConfig = {
  beginner: {
    label: 'Principiante',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    tag: ExamDifficulty.BEGINNER,
  },
  intermediate: {
    label: 'Intermedio',
    color: 'bg-green-100 text-green-800 border-green-200',
    tag: ExamDifficulty.INTERMEDIATE,
  },
  advanced: {
    label: 'Avanzado',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    tag: ExamDifficulty.ADVANCED,
  },
  'upper-intermediate': {
    label: 'Intermedio Alto',
    color: 'bg-green-100 text-green-800 border-green-200',
    tag: ExamDifficulty.UPPER_INTERMEDIATE,
  },
  proficient: {
    label: 'Proficiente',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    tag: ExamDifficulty.PROFICIENT,
  },
};
