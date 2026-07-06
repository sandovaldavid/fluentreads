import { BookLevel, FormatTag, PopularityTag } from '../types/book';

// Global style variables for levels
export const levelStyles = {
  basic: 'bg-blue-100 text-blue-800 border-blue-200',
  intermediate: 'bg-green-100 text-green-800 border-green-200',
  advanced: 'bg-purple-100 text-purple-800 border-purple-200',
  'all-levels': 'bg-amber-100 text-amber-800 border-amber-200',
  professional: 'bg-rose-100 text-rose-800 border-rose-200',
  'International Exam': 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

// Global style variables for format tags
export const popularityStyles = {
  bestseller: 'bg-amber-50 text-amber-600 border-amber-200',
  new: 'bg-green-50 text-green-600 border-green-200',
  specialOffer: 'bg-pink-50 text-pink-600 border-pink-200',
  completePack: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  recommended: 'bg-rose-50 text-rose-600 border-rose-200',
};

export const formatStyles = {
  pdf: 'bg-blue-50 text-blue-600 border-blue-200',
  workbook: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  audio: 'bg-purple-50 text-purple-600 border-purple-200',
  video: 'bg-red-50 text-red-600 border-red-200',
  software: 'bg-slate-50 text-slate-600 border-slate-200',
  exams: 'bg-orange-50 text-orange-600 border-orange-200',
};

// Icons for format tags
export const formatIcons = {
  pdf: 'PdfIcon',
  workbook: 'WorkbookIcon',
  audio: 'AudioIcon',
  video: 'VideoIcon',
  software: 'SoftwareIcon',
  exams: 'ExamsIcon',
};

// Icons for popularity tags
export const popularityIcons = {
  bestseller: '🚀',
  new: '🆕',
  specialOffer: '🏷',
  completePack: '🎁',
  recommended: '💯',
};

// Level tags configuration
export const levelConfig = {
  basic: {
    color: levelStyles.basic,
    label: 'Básico',
    tag: BookLevel.BASIC,
  },
  intermediate: {
    color: levelStyles.intermediate,
    label: 'Intermedio',
    tag: BookLevel.INTERMEDIATE,
  },
  advanced: {
    color: levelStyles.advanced,
    label: 'Avanzado',
    tag: BookLevel.ADVANCED,
  },
  all_levels: {
    color: levelStyles['all-levels'],
    label: 'Todos los Niveles',
    tag: BookLevel.ALL_LEVELS,
  },
  professional: {
    color: levelStyles.professional,
    label: 'Profesional',
    tag: BookLevel.PROFESSIONAL,
  },
  internationalExam: {
    color: levelStyles['International Exam'],
    label: 'Examen Internacional',
    tag: BookLevel.INTERNATIONAL_EXAM,
  },
};

// Popularity tags configuration
export const popularityConfig = {
  bestSeller: {
    icon: popularityIcons.bestseller,
    label: 'Más vendido',
    color: popularityStyles.bestseller,
    tag: PopularityTag.BESTSELLER,
  },
  new: {
    icon: popularityIcons.new,
    label: 'Nuevo',
    color: popularityStyles.new,
    tag: PopularityTag.NEW,
  },
  specialOffer: {
    icon: popularityIcons.specialOffer,
    label: 'Oferta especial',
    color: popularityStyles.specialOffer,
    tag: PopularityTag.SPECIAL_OFFER,
  },
  completePack: {
    icon: popularityIcons.completePack,
    label: 'Pack Completo',
    color: popularityStyles.completePack,
    tag: PopularityTag.COMPLETE_PACK,
  },
  recommended: {
    icon: popularityIcons.recommended,
    label: 'Recomendado',
    color: popularityStyles.recommended,
    tag: PopularityTag.RECOMMENDED,
  },
};

// Format tags configuration
export const formatConfig = {
  pdf: {
    icon: formatIcons.pdf,
    label: 'PDF',
    color: formatStyles.pdf,
    tag: FormatTag.PDF,
  },
  workbook: {
    icon: formatIcons.workbook,
    label: 'Workbook',
    color: formatStyles.workbook,
    tag: FormatTag.WORKBOOK,
  },
  audio: {
    icon: formatIcons.audio,
    label: 'Audios',
    color: formatStyles.audio,
    tag: FormatTag.AUDIO,
  },
  video: {
    icon: formatIcons.video,
    label: 'Videos',
    color: formatStyles.video,
    tag: FormatTag.VIDEO,
  },
  software: {
    icon: formatIcons.software,
    label: 'Software',
    color: formatStyles.software,
    tag: FormatTag.SOFTWARE,
  },
  exams: {
    icon: formatIcons.exams,
    label: 'Exámenes',
    color: formatStyles.exams,
    tag: FormatTag.EXAMS,
  },
};
