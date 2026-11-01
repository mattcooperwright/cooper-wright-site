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
  (`index.md`, `index.html`, `index.mdx` or `index.tsx`; none for external)
- md and html are safe for chat and machine senders; mdx and react need a human PR (docs/manifest.md)
- A react page with `hydrate: true` also needs a route shim, `src/pages/<slug>.astro` (see docs/manifest.md)
- `src/lib/pages.ts` has status filtering, payload checks and menu grouping
- `tests/` holds the Vitest tests
- `src/layouts/Base.astro` is the shared layout
- `src/components/SiteMenu.astro` is the site menu (rail plus section menus), used by Base and HtmlShell
- `src/pages/` has the routes: `index`, `[slug]`, `[sandboxed]` (html), `[section]`, `rss.xml`, `sitemap.xml`, `404`
- `docs/decisions.md` is the decision log
- `docs/fonts.md` lists the self-hosted fonts and how pages load them by role
- `docs/manifest.md` documents every manifest field, with an example per type, and the rules for home page tiles. Read it before editing a manifest.
- Experiments pages get a square WebP grab as their tile `image` (docs/manifest.md, Home page tile)

To add a page, create a folder under `src/content/pages/` and run `npm run build`.
A bad manifest or a missing payload fails the build.

## Rules
- Work on a branch and open a pull request. Never push to or merge into main.
- Pin every dependency to an exact version, including GitHub Actions (by commit SHA).
- Never commit secrets, tokens or `.env` files. This repo is public.
- Ask before adding any external script or font. Fonts are self-hosted only; never link a font host.
  Exception: sandboxed html payloads may use what their CSP allows (cdnjs, jsdelivr, Google Fonts).
- Style text with font roles (`font-body`, `var(--font-serif)`), never family names.
- Titles and names are verbatim. Never correct the spelling or case of a manifest title or visible wordmark.
- Record significant decisions in `docs/decisions.md`.
