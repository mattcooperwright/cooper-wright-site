# Fonts

All fonts are self-hosted from pinned Fontsource npm packages. Nothing loads from an external font host. Pages refer to fonts by role, never by family name, so a family can be swapped in one place.

| Family | Role | Source | Version | Licence |
| --- | --- | --- | --- | --- |
| Inter | display | `@fontsource-variable/inter` | 5.3.0 | OFL-1.1 |
| Hanken Grotesk | body | `@fontsource-variable/hanken-grotesk` | 5.3.0 | OFL-1.1 |
| Newsreader | serif | `@fontsource-variable/newsreader` | 5.3.0 | OFL-1.1 |
| Outfit | geometric | `@fontsource-variable/outfit` | 5.3.0 | OFL-1.1 |
| Gasoek One | poster | `@fontsource/gasoek-one` | 5.3.0 | OFL-1.1 |
| Sofia Sans | humanist | `@fontsource-variable/sofia-sans` | 5.3.0 | OFL-1.1 |
| Rethink Sans | rounded | `@fontsource-variable/rethink-sans` | 5.3.0 | OFL-1.1 |
| DM Sans | grotesque | `@fontsource-variable/dm-sans` | 5.3.0 | OFL-1.1 |

All are variable fonts covering their full weight range, except Gasoek One, which ships a single weight (400). Body and serif include italics. The others are upright only, and `font-synthesis: none` stops the browser faking bold or italic.

## Using a role on a page

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
