# Fonts

All fonts are self-hosted: most as pinned Fontsource npm packages, one (Overused Grotesk) as a vendored copy pinned to a specific upstream release, because it isn't published to Fontsource. Nothing loads from an external font host. Pages refer to fonts by role, never by family name, so a family can be swapped in one place.

| Family | Role | Source | Version | Licence |
| --- | --- | --- | --- | --- |
| Overused Grotesk | display | vendored, `github.com/RandomMaerks/Overused-Grotesk` @ `v0.5-alpha.2` | 0.5.0-alpha.2 | OFL-1.1 |
| Hanken Grotesk | body | `@fontsource-variable/hanken-grotesk` | 5.3.0 | OFL-1.1 |
| Newsreader | serif | `@fontsource-variable/newsreader` | 5.3.0 | OFL-1.1 |
| Outfit | geometric | `@fontsource-variable/outfit` | 5.3.0 | OFL-1.1 |
| Gasoek One | poster | `@fontsource/gasoek-one` | 5.3.0 | OFL-1.1 |
| Sofia Sans | humanist | `@fontsource-variable/sofia-sans` | 5.3.0 | OFL-1.1 |
| Rethink Sans | rounded | `@fontsource-variable/rethink-sans` | 5.3.0 | OFL-1.1 |
| DM Sans | grotesque | `@fontsource-variable/dm-sans` | 5.3.0 | OFL-1.1 |
| Onest | plain | `@fontsource-variable/onest` | 5.3.0 | OFL-1.1 |
| Roboto Mono | mono | `@fontsource-variable/roboto-mono` | 5.3.0 | OFL-1.1 |

All are variable fonts covering their full weight range, except Gasoek One, which ships a single weight (400). Body, serif, rounded and grotesque include italics; grotesque (DM Sans) also has optical sizing. The others are upright only, and `font-synthesis: none` stops the browser faking bold or italic.

## Using a role on a page

`Base.astro` always loads `mono`, the menu's face, so `font-mono` is Roboto Mono on every page that uses that layout.

1. List the roles in the page's manifest: `"fonts": ["serif", "poster"]`. Home and 404 have no manifest and pass `fonts={['body']}` to `Base.astro` instead.
2. Style with the role token: the Tailwind utility `font-serif`, or `var(--font-serif)` in CSS or inline styles.

Only the roles a page lists are loaded on that page. A role used without being listed falls back to the system font stack, so a missing entry shows up as the wrong typeface rather than a broken page. `Base.astro` sets body text to the body role, so a page that does not list `body` shows its text in the system stack, as the `hello` placeholder does.

## How it works

- `src/lib/fonts.ts` is the single source of truth: role, family, package, version, licence and weights. It has no Astro imports, because the manifest schema reads its role list.
- `src/lib/font-faces.ts` reads the `@font-face` rules from each package's own CSS, keeping only the `latin` and `latin-ext` subsets. Other scripts, such as Cyrillic, Greek or Korean, are not served.
- `astro.config.mjs` passes these to Astro's Fonts API with the local provider. Astro copies the woff2 files into `dist/_astro/fonts/`, and the `<Font>` component in `Base.astro` writes the `@font-face` rules and a `--webfont-<role>` variable inline on the pages that need them. Astro also generates metric-matched fallbacks to reduce layout shift.
- `src/styles/global.css` defines the `--font-<role>` tokens on top of the `--webfont-<role>` variables.
- `/fonts-specimen/` is an unlisted page showing every role at two weights.

## Adding or changing a family

Install the package pinned to an exact version, confirm its licence is OFL or another open licence, and update `src/lib/fonts.ts` and the table above. `npm test` checks the recorded version, licence and weights against the installed package. Ask before adding any font from outside Fontsource.

**If a family isn't on Fontsource**, vendor it instead of linking an external font host: download the pinned release's font file, subset it to the `latin`/`latin-ext` unicode ranges above with `fonttools`/`pyftsubset` (a one-off local tool, not a project dependency), and lay it out as a local package with the exact shape `font-faces.ts` expects, so the rest of the font pipeline needs no changes:
```
src/assets/fonts/<family>/
  package.json   # { "name", "version", "license" } — read by tests/fonts.test.ts like a Fontsource package.json
  <family>.css   # one @font-face block per subset, src: url(./files/*.woff2), filenames ending -<subset>-<tag>-normal.woff2
  files/
    <family>-latin-<tag>-normal.woff2
    <family>-latin-ext-<tag>-normal.woff2
```
In `fonts.ts`, point `package` at this directory as an **absolute path** (e.g. `fileURLToPath(new URL('../assets/fonts/<family>', import.meta.url))`), not a relative one — it has to resolve the same way for `font-faces.ts`'s `require.resolve` (anchored at `src/lib/`) and for Astro's local font provider (which resolves relative to the project root), and an absolute path is the only thing both agree on. Overused Grotesk (`display` role) is the example of this pattern.
