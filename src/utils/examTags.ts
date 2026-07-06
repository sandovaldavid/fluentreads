import { ExamDifficulty } from '../types/exam';

export const difficultyStyles = {
  beginner: 'bg-blue-100 text-blue-800 border-blue-200',
  intermediate: 'bg-green-100 text-green-800 border-green-200',
  advanced: 'bg-purple-100 text-purple-800 border-purple-200',
};

export const difficultyConfig = {
  beginner: {
    label: 'Principiante',
    color: difficultyStyles.beginner,
    tag: ExamDifficulty.BEGINNER,
  },
  intermediate: {
    label: 'Intermedio',
    color: difficultyStyles.intermediate,
    tag: ExamDifficulty.INTERMEDIATE,
  },
  advanced: {
    label: 'Avanzado',
    color: difficultyStyles.advanced,
    tag: ExamDifficulty.ADVANCED,
  },
};
