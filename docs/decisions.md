# Decisions

## 2026-10-11: New public repository with clean history
The site lives in a new public repository that starts from an empty history. Nothing from the old repository's history is carried over.

## 2026-10-11: Old site archived privately
The previous site, built with Vite and React, is archived in a private repository. Its pages are not ported yet and will be moved across one at a time.

## 2026-10-11: Astro with React
Astro was chosen for two reasons. Content collections validate every page's manifest against a Zod schema at build time, so a malformed page stops the build instead of reaching the live site. Static output means the site deploys as plain files with no server or adapter. The React integration keeps the option of interactive pages built as React components.

## 2026-10-11: Provisional manifest fields
Superseded by the version 1 manifest below. Kept for history.

Each page is a folder holding `manifest.json` and one payload. The manifest fields are provisional and may change as real pages are ported: `schemaVersion` (literal 1), `title`, `description`, `date`, `updated` (optional), `type` (react, html, mdx or external), `visible` (default true), `menuOrder` (optional number), `source` (default "manual") and `indexStyle` (optional background, color and fontFamily). The schema is strict, so unknown fields fail the build.

Open questions:
- Payload filenames are `index.mdx`, `index.html`, `index.tsx` and `url.txt`. The external type has no URL field in the manifest, so the URL sits in `url.txt` for now. A `url` manifest field may be cleaner.
- Only the mdx type renders. The other types fail the build with a "not implemented yet" error until a real page needs them.
- Hidden pages (`visible: false`) get no route at all. If they should stay reachable by URL while off the menu, the filter in `src/lib/pages.ts` changes.

## 2026-10-11: Manifest version 1 is final
The provisional fields are replaced by the version 1 manifest documented in `docs/manifest.md`. The schema lives in `src/lib/manifest.ts` with no Astro imports, so a separate publisher can reuse it. `visible` became `status` (published, unlisted or draft), and the external page's URL moved from `url.txt` into a `url` field. These changes stay at version 1 because no page had been published under the provisional fields.

This resolves the earlier open questions. Unlisted pages build and load by URL with a `noindex` tag. Drafts render only on the dev server. The html and react types still fail the build until a real page needs them.

## 2026-10-11: Three sections
The menu has three sections, in this order: Writing, Projects and Experiments. A page with no `section` goes under "More", after them.

## 2026-10-11: Manifest versioning
Adding an optional field keeps `schemaVersion` at 1. Renaming or removing a field needs `schemaVersion` 2, and the site must keep accepting version 1 manifests alongside it.

## 2026-10-11: No sitemap yet
Superseded by "Sitemap, RSS and site URL" below. Unlisted and draft pages must stay out of any sitemap. When one is added, it should be built from `getListedPages()` in `src/lib/pages.ts`.

## 2026-10-11: Open-licence replacements for commercial fonts
The old site used four commercial typefaces. They were replaced with open-licence (OFL-1.1) families: Neue Haas Grotesk Display Pro became Inter, Plantin MT Pro became Newsreader, BR Cobane became Hanken Grotesk, and BR Segma became Outfit. Gasoek One, Sofia Sans, Rethink Sans and DM Sans were added alongside them.

## 2026-10-11: Self-hosted fonts, loaded per page by role
Fonts come from pinned Fontsource npm packages and are served from the site through Astro's Fonts API with the local provider. No external font host is used. Pages name roles (display, body, serif, geometric, poster, humanist, rounded and grotesque), not families, and each page downloads only the roles listed in its manifest's `fonts` field. Adding `fonts` was an optional field, so `schemaVersion` stays at 1. See `docs/fonts.md`.

## 2026-10-11: Three pages ported from the archive, URLs preserved
I Am Sitting in a Room, Making Is Thinking and Cynefin for designers were ported from the archive as react pages, keeping their old URLs: `/sitting-in-a-room/`, `/making-is-thinking/` and `/cynefin-for-designers/`. Only fonts and routing changed; each page keeps its own tokens and structure. The home page was deliberately not ported. The old Figma Make scaffolding was left behind: `components/ui`, `Menu.tsx`, `routes.tsx`, `App.tsx` and its theme CSS.

## 2026-10-11: Hydrated react pages use route shims
React pages render to static HTML by default. Astro can only hydrate a component it imports statically, so a react page that needs client JavaScript sets `hydrate: true` and gets a short route shim in `src/pages/<slug>.astro`. Each hydrated page ships only its own code. Sitting in a Room (copy button) and Making Is Thinking (scroll-driven noise) are hydrated; Cynefin is static. Faux bold and italic stay off site-wide, so Gasoek One's bold text renders at its single regular weight.

## 2026-10-11: Who may submit which page types
Chat and machine senders may submit md, html and external pages only. mdx and react need a human pull request, because both execute code at build time. To keep md safe for those senders, raw HTML in an md payload fails the build: Markdown would otherwise pass it through, unsandboxed, onto the site's own origin.

## 2026-10-11: Sandboxed shell for html pages
html pages render inside a `srcdoc` iframe with `sandbox="allow-scripts"`, never `allow-same-origin`, so the payload gets an opaque origin. A CSP meta tag on the shell, inherited by the iframe, allows scripts from cdnjs and jsdelivr and inline, styles inline and from Google Fonts, fonts from gstatic, images from data: and blob:, and no connections. The policy has no `'self'`, so the shell styles its bar inline with system fonts and ships no JavaScript. html pages have their own route, `[sandboxed].astro`, so the site stylesheet never reaches them.

## 2026-10-11: Sitemap, RSS and site URL
The site URL is https://matt.cooper-wright.com. The sitemap is a small custom endpoint built from `getListedPages()`, because `@astrojs/sitemap` filters without access to page status. The RSS feed uses `@astrojs/rss` and lists published Writing pages.

## 2026-10-11: Home page shows every published page in one grid
The home page shows all published pages as tiles in one responsive grid, newest first by date. There is no featured or pinned slot: a `featured` field is deferred until the list outgrows a single grid. Tiles take their colours and font role from `indexStyle`, and the tile markup lives in `src/components/Tile.astro` so it can be restyled in one place.

## 2026-10-12: Home page redesign — new font role, animated backdrop, flat tiles
Added a `plain` font role (Onest, OFL-1.1, via `@fontsource-variable/onest`) for the home page's own heading and for tiles with no `indexStyle.fontFamily`, in place of the `body` role. It reads as a simpler, more neutral grotesque than the site's other sans roles, and sits a step away from `grotesque` (DM Sans) itself.

The grid now sits over `src/components/KaleidoscopeBackground.astro`, a fixed full-viewport canvas behind the tiles: a slow mirrored rotation of drifting colour with a fine grain overlay, built with plain canvas 2D so it adds no dependency. It freezes on a single frame under `prefers-reduced-motion`. The page's own heading moved into a small flat white panel so it stays legible over the animated colour.

Tiles lost their rounded corners and their `border border-black/10` outline, replaced by a plain drop shadow, since a flat, sharp-edged card reads more clearly against the animated backdrop than a bordered, rounded one. The keyboard focus ring stays, for accessibility.

