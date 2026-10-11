// Page manifest schema, version 1. Documented in docs/manifest.md.
// No Astro imports here: this module is shared with a future publisher.
import { z } from 'zod';
import { FONT_ROLES } from './fonts';

export const PAGE_TYPES = ['react', 'html', 'mdx', 'md', 'external'] as const;
export const STATUSES = ['published', 'unlisted', 'draft'] as const;
export const SECTIONS = ['Writing', 'Projects', 'Experiments'] as const;
export const NAV_THEMES = ['light', 'dark', 'auto'] as const;

export const manifestSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    title: z.string().min(1),
    description: z.string(),
    date: z.coerce.date(),
    type: z.enum(PAGE_TYPES),
    status: z.enum(STATUSES).default('published'),
    section: z.enum(SECTIONS).optional(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string().min(1)).optional(),
    menuOrder: z.number().optional(),
    navTheme: z.enum(NAV_THEMES).default('auto'),
    // A site-root path to a file in public/, such as /images/share.png.
    image: z.string().startsWith('/').optional(),
    indexStyle: z
      .strictObject({
        background: z.string().optional(),
        color: z.string().optional(),
        fontFamily: z.string().optional(),
      })
      .optional(),
    url: z.url({ protocol: /^https?$/ }).optional(),
    source: z.string().default('manual'),
    // Font roles this page loads. See docs/fonts.md.
    fonts: z.array(z.enum(FONT_ROLES)).default([]),
    // React pages with state, effects or animation. Needs a route shim; see docs/manifest.md.
    hydrate: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'external' && data.url === undefined) {
      ctx.addIssue({ code: 'custom', path: ['url'], message: 'url is required when type is external' });
    }
    if (data.type !== 'external' && data.url !== undefined) {
      ctx.addIssue({ code: 'custom', path: ['url'], message: 'url is only allowed when type is external' });
    }
    if (data.hydrate && data.type !== 'react') {
      ctx.addIssue({ code: 'custom', path: ['hydrate'], message: 'hydrate is only allowed when type is react' });
    }
  });

export type Manifest = z.output<typeof manifestSchema>;
export type ManifestInput = z.input<typeof manifestSchema>;
