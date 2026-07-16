// Content Collections configuration for FluentReads
// Migrates all JSON data from src/database/ to validated collections using Astro file() loader + Zod schemas
// Docs: https://docs.astro.build/en/guides/content-collections/

import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Shared sub-schemas
const ratingSchema = z.object({
  score: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
});

const formatTagEnum = z.enum(['pdf', 'workbook', 'audio', 'video', 'software', 'exams']);
const popularityTagEnum = z.enum([
  'bestSeller',
  'new',
  'specialOffer',
  'completePack',
  'recommended',
]);
const bookLevelEnum = z.enum([
  'basic',
  'beginner',
  'intermediate',
  'advanced',
  'professional',
  'all-levels',
  'international-exam',
]);

// Books collection
const books = defineCollection({
  loader: file('src/data/books.json'),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    price: z.number().positive(),
    editorialId: z.string(),
    discount: z.number().min(0).max(100).optional().default(0),
    offerDays: z.number().int().positive().optional().default(7),
    coverImage: z.url(),
    altText: z.string().optional(),
    images: z.array(z.url()).optional().default([]),
    video: z.string().optional(),
    rating: ratingSchema.optional(),
    level: bookLevelEnum.optional(),
    formatTags: z.array(formatTagEnum).optional().default([]),
    popularityTags: z.array(popularityTagEnum).optional().default([]),
    featured: z.boolean().optional().default(false),
    detailsLink: z.string(),
    buyLink: z.string(),
    includedItems: z.array(z.string()).default([]),
  }),
});

// Packs collection
const packs = defineCollection({
  loader: file('src/data/packs.json'),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    price: z.number().positive(),
    discount: z.number().min(0).max(100).optional().default(0),
    offerDays: z.number().int().positive().optional().default(7),
    coverImage: z.url(),
    altText: z.string().optional(),
    images: z.array(z.url()).optional().default([]),
    video: z.string().optional(),
    booksIds: z.array(z.string()).default([]),
    rating: ratingSchema.optional(),
    level: bookLevelEnum.optional(),
    formatTags: z.array(formatTagEnum).optional().default([]),
    popularityTags: z.array(popularityTagEnum).optional().default([]),
    featured: z.boolean().optional().default(false),
    detailsLink: z.string(),
    buyLink: z.string(),
    includedItems: z.array(z.string()).default([]),
  }),
});

// Exams collection
const examTypeEnum = z.enum([
  'IELTS',
  'TOEFL',
  'Cambridge',
  'SAT',
  'PTE',
  'FCE',
  'CPE',
  'GRE',
  'Other',
]);
const examDifficultyEnum = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'upper-intermediate',
  'proficient',
]);

const exams = defineCollection({
  loader: file('src/data/exams.json'),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    price: z.number().positive(),
    discount: z.number().min(0).max(100).optional().default(0),
    coverImage: z.url(),
    altText: z.string().optional(),
    images: z.array(z.url()).optional().default([]),
    video: z.string().optional(),
    examType: examTypeEnum,
    difficulty: examDifficultyEnum,
    duration: z.string().optional(),
    rating: ratingSchema.optional(),
    formatTags: z.array(formatTagEnum).optional().default([]),
    popularityTags: z.array(popularityTagEnum).optional().default([]),
    featured: z.boolean().optional().default(false),
    buyLink: z.string(),
    detailsLink: z.string(),
    includedItems: z.array(z.string()).default([]),
  }),
});

// Editorial collection
const editorial = defineCollection({
  loader: file('src/data/editorial.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
  }),
});

// Testimonies collection
const testimonies = defineCollection({
  loader: file('src/data/testimonies.json'),
  schema: z.object({
    id: z.string(),
    quote: z.string(),
    author: z.string(),
    position: z.string(),
    avatarUrl: z.url(),
    rating: z.number().min(0).max(5),
    date: z.string(),
  }),
});

// Offers collection
const offers = defineCollection({
  loader: file('src/data/offers.json'),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    discount: z.number().min(0).max(100),
    originalPrice: z.number().positive(),
    salePrice: z.number().positive(),
    image: z.string(),
    link: z.string(),
  }),
});

// Categories collection
const categories = defineCollection({
  loader: file('src/data/categories.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    icon: z.enum(['Book', 'Books', 'GraduationCap']),
    image: z.string(),
    link: z.string(),
  }),
});

// FAQs — general, catalog, payment
const faqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});

const generalFaqs = defineCollection({
  loader: file('src/data/general-faqs.json'),
  schema: faqSchema,
});

const catalogFaqs = defineCollection({
  loader: file('src/data/catalog-faqs.json'),
  schema: faqSchema,
});

const paymentFaqs = defineCollection({
  loader: file('src/data/payment-faqs.json'),
  schema: faqSchema,
});

// Legal collection
const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

// Offer Hero Banner collection
const offerHeroBanner = defineCollection({
  loader: file('src/data/offer-hero-banner.json'),
  schema: z.object({
    id: z.string(),
    type: z.enum(['book', 'pack', 'exam']),
    expiration: z.string(),
    customLink: z.string(),
  }),
});

export const collections = {
  books,
  packs,
  exams,
  editorial,
  testimonies,
  offers,
  categories,
  generalFaqs,
  catalogFaqs,
  paymentFaqs,
  offerHeroBanner,
  legal,
};
