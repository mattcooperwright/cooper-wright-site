# cooper-wright-site

Matt Cooper-Wright's personal site. Astro 7 with React, MDX and Tailwind 4, built as static HTML.

## Commands
- `npm ci` installs exactly what package-lock.json records
- `npm run dev` starts the dev server
- `npm run check` runs astro check (types and content schema)
- `npm test` runs the Vitest schema tests
- `npm run build` writes the static site to `dist/`

## Structure
- `src/lib/manifest.ts` is the Zod manifest schema. Keep Astro imports out of it.
- `src/content.config.ts` loads the `pages` collection with that schema
- `src/content/pages/<slug>/` holds one page: `manifest.json` plus its payload
  (`index.mdx`, `index.html` or `index.tsx`; none for external). Only mdx and external render so far.
- `src/lib/pages.ts` has status filtering, payload checks and menu grouping
- `tests/` holds the Vitest tests
- `src/layouts/Base.astro` is the shared layout and generated menu
- `src/pages/` has the routes: `index`, `[slug]` and `404`
- `docs/decisions.md` is the decision log
- `docs/manifest.md` documents every manifest field, with an example per type. Read it before editing a manifest.

To add a page, create a folder under `src/content/pages/` and run `npm run build`.
A bad manifest or a missing payload fails the build.

## Rules
- Work on a branch and open a pull request. Never push to or merge into main.
- Pin every dependency to an exact version, including GitHub Actions (by commit SHA).
- Never commit secrets, tokens or `.env` files. This repo is public.
- Ask before adding any external script or font. System fonts only for now.
- Record significant decisions in `docs/decisions.md`.
