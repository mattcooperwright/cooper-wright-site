import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { manifestSchema } from './lib/manifest';

const pages = defineCollection({
  // One folder per page. The folder name is the page's id and URL slug.
  loader: glob({
    pattern: '*/manifest.json',
    base: './src/content/pages',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: manifestSchema,
});

export const collections = { pages };
