import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const PAGE_TYPES = ['react', 'html', 'mdx', 'external'] as const;

// Provisional manifest fields. See docs/decisions.md before changing them.
const manifest = z.strictObject({
  schemaVersion: z.literal(1),
  title: z.string().min(1),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  type: z.enum(PAGE_TYPES),
  visible: z.boolean().default(true),
  menuOrder: z.number().optional(),
  source: z.string().default('manual'),
  indexStyle: z
    .strictObject({
      background: z.string().optional(),
      color: z.string().optional(),
      fontFamily: z.string().optional(),
    })
    .optional(),
});

const pages = defineCollection({
  // One folder per page. The folder name is the page's id and URL slug.
  loader: glob({
    pattern: '*/manifest.json',
    base: './src/content/pages',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: manifest,
});

export const collections = { pages };
