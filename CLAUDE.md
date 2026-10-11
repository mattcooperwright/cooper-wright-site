# cooper-wright-site

Matt Cooper-Wright's personal site. Astro 7 with React, MDX and Tailwind 4, built as static HTML.

## Commands
- `npm ci` installs exactly what package-lock.json records
- `npm run dev` starts the dev server
- `npm run check` runs astro check (types and content schema)
- `npm run build` writes the static site to `dist/`

## Structure
- `src/content.config.ts` holds the `pages` collection and its Zod manifest schema
- `src/content/pages/<slug>/` holds one page: `manifest.json` plus one payload
  (`index.mdx`, `index.html`, `index.tsx` or `url.txt`, matching `type`). Only mdx renders so far.
- `src/lib/pages.ts` has the payload checks and menu ordering
- `src/layouts/Base.astro` is the shared layout and generated menu
- `src/pages/` has the routes: `index`, `[slug]` and `404`
- `docs/decisions.md` is the decision log

To add a page, create a folder under `src/content/pages/` and run `npm run build`.
A bad manifest or a missing payload fails the build.

## Rules
- Work on a branch and open a pull request. Never push to or merge into main.
- Pin every dependency to an exact version, including GitHub Actions (by commit SHA).
- Never commit secrets, tokens or `.env` files. This repo is public.
- Ask before adding any external script or font. System fonts only for now.
- Record significant decisions in `docs/decisions.md`.
