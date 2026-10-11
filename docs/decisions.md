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
Unlisted and draft pages must stay out of any sitemap. When one is added, it should be built from `getListedPages()` in `src/lib/pages.ts`.

## 2026-10-11: Open-licence replacements for commercial fonts
The old site used four commercial typefaces. They were replaced with open-licence (OFL-1.1) families: Neue Haas Grotesk Display Pro became Inter, Plantin MT Pro became Newsreader, BR Cobane became Hanken Grotesk, and BR Segma became Outfit. Gasoek One, Sofia Sans, Rethink Sans and DM Sans were added alongside them.

## 2026-10-11: Self-hosted fonts, loaded per page by role
Fonts come from pinned Fontsource npm packages and are served from the site through Astro's Fonts API with the local provider. No external font host is used. Pages name roles (display, body, serif, geometric, poster, humanist, rounded and grotesque), not families, and each page downloads only the roles listed in its manifest's `fonts` field. Adding `fonts` was an optional field, so `schemaVersion` stays at 1. See `docs/fonts.md`.
