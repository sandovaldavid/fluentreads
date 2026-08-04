import type { CollectionEntry } from 'astro:content';

export type Book = CollectionEntry<'books'>['data'];
export type Pack = CollectionEntry<'packs'>['data'];
export type Exam = CollectionEntry<'exams'>['data'];
