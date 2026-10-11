# Page manifest, version 1

Every page is a folder under `src/content/pages/`. The folder name is the page's slug and URL (`src/content/pages/hello/` becomes `/hello/`), so the slug is never a manifest field. The folder holds `manifest.json` and, for every type except external, one payload file.

The schema lives in `src/lib/manifest.ts` and is checked at build time. Unknown fields fail the build, as does a missing or mismatched payload, or an `image` that isn't in `public/`.

## Fields

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `schemaVersion` | `1` | yes | | Always the number 1 for this version. |
| `title` | string | yes | | Used in the menu, the index, `<title>` and `og:title`. Must not be empty. |
| `description` | string | yes | | Used in the index, the description meta tag and `og:description`. |
| `date` | date | yes | | `YYYY-MM-DD`. Sorts pages within a menu group and on the index, newest first. |
| `type` | `md`, `html`, `mdx`, `react` or `external` | yes | | Decides which payload the folder holds and how it renders. See [Types](#types). |
| `status` | `published`, `unlisted` or `draft` | no | `published` | See [Status](#status). |
| `section` | `Writing`, `Projects` or `Experiments` | no | | Menu group. Pages without one go under "More". |
| `updated` | date | no | | Date of the last meaningful change. |
| `tags` | array of strings | no | | Shown on md posts and as RSS categories. |
| `menuOrder` | number | no | | Lower numbers come first within a menu group. Pages without one follow, by date. |
| `navTheme` | `light`, `dark` or `auto` | no | `auto` | Colours of the header, or of the slim bar on html pages. `auto` follows the visitor's system setting. |
| `image` | path | no | | Share image, as a site-root path to a file in `public/`, such as `/images/hello.png`. Becomes an absolute `og:image`. |
| `indexStyle` | object | no | | Colours and font of this page's home page tile. `background` and `color` are CSS colours (default white and `#171717`); the build warns, without failing, if their contrast is below 4.5:1. `fontFamily` is a font role name such as `serif` or `poster`; anything else uses the body role. |
| `url` | http or https URL | external only | | Required when `type` is `external` and rejected for every other type. |
| `source` | string | no | `manual` | Where the page came from, for example a publisher tool. |
| `hydrate` | boolean | no | `false` | React pages only. Set it when the component uses state, effects or animation, and add a route shim (see the react example). |
| `fonts` | array of font roles | no | `[]` | Roles this page loads: `display`, `body`, `serif`, `geometric`, `poster`, `humanist`, `rounded`, `grotesque`. See `docs/fonts.md`. |

## Status

| Status | Production build | Dev server | Menu and index | Sitemap | `noindex` |
| --- | --- | --- | --- | --- | --- |
| `published` | built | renders | listed | included | no |
| `unlisted` | built, loads by URL | renders | left out | left out | yes |
| `draft` | not built | renders | left out | left out | yes |

The sitemap (`/sitemap.xml`) is built from `getListedPages()` in `src/lib/pages.ts`, so only published pages on this site appear. External pages are left out. The RSS feed (`/rss.xml`) lists published Writing pages. Section indexes at `/writing/`, `/projects/` and `/experiments/` list each section's published pages, newest first.

## Types

| Type | Payload | Renders as | Who may submit |
| --- | --- | --- | --- |
| `md` | `index.md` | Post layout: title, UK date, updated date, tags, reading time, link to section. Body in the serif role, headings in the display role. | anyone, including chat and machine senders |
| `html` | `index.html` | Sandboxed shell: a slim bar, then the payload in a `srcdoc` iframe with `sandbox="allow-scripts"`. | anyone, including chat and machine senders |
| `external` | none | A menu and index link to `url`. | anyone, including chat and machine senders |
| `mdx` | `index.mdx` | Simple article layout. | human pull request only |
| `react` | `index.tsx` | Full-bleed component, static unless `hydrate`. | human pull request only |

mdx and react execute code at build time, so they only arrive through a reviewed pull request.

**md rules.** Plain Markdown only. Raw HTML of any kind (tags, comments, `<script>`) fails the build with its line number, because Markdown would pass it through unsandboxed. Use the html type for HTML. Imports and `{expressions}` have no effect in md; they render as text.

**html rules.** One self-contained `index.html`. It runs in an iframe without `allow-same-origin`, so it has an opaque origin and can't reach the site, its cookies or the parent page. A Content-Security-Policy on the shell, inherited by the iframe, allows:

- scripts from `https://cdnjs.cloudflare.com`, `https://cdn.jsdelivr.net` and inline
- styles inline and from `https://fonts.googleapis.com`
- fonts from `https://fonts.gstatic.com`
- images from `data:` and `blob:` only
- no network connections (`connect-src 'none'`), no forms, no `<base>`

Anything else, including the site's own files and self-hosted fonts, is blocked. Pin library versions in script URLs. `/gsap-sandbox/` is an unlisted fixture that proves animation libraries work.

## Menu order

Groups appear in this order: Writing, Projects, Experiments, then More for pages with no section. Empty groups are hidden. Within a group, pages sort by `menuOrder` ascending, then by `date`, newest first. External pages appear in the menu and open in a new tab with `rel="noopener noreferrer"`.

## Examples

### mdx
```
src/content/pages/hello/
  manifest.json
  index.mdx
```
```json
{
  "schemaVersion": 1,
  "title": "Hello",
  "description": "A short note.",
  "date": "2026-10-11",
  "type": "mdx",
  "section": "Writing",
  "tags": ["notes"]
}
```

### html
```
src/content/pages/poster/
  manifest.json
  index.html
```
```json
{
  "schemaVersion": 1,
  "title": "Poster",
  "description": "A hand-built HTML page.",
  "date": "2026-10-11",
  "type": "html",
  "section": "Projects",
  "image": "/images/poster.png",
  "navTheme": "dark",
  "indexStyle": { "background": "#111", "color": "#fff" }
}
```

### react
```
src/content/pages/sketch/
  manifest.json
  index.tsx
```
```json
{
  "schemaVersion": 1,
  "title": "Sketch",
  "description": "An interactive experiment.",
  "date": "2026-10-11",
  "type": "react",
  "section": "Experiments",
  "status": "unlisted"
}
```

`index.tsx` default-exports the page component. Without `hydrate` it renders to static HTML with no JavaScript. With `"hydrate": true`, add a route shim at `src/pages/sketch.astro`, because Astro can only hydrate a component it imports by name:
```astro
---
import Page from '../content/pages/sketch/index.tsx';
import HydratedPage from '../layouts/HydratedPage.astro';
---
<HydratedPage id="sketch">
  <Page client:load />
</HydratedPage>
```
The build fails if a page has `hydrate: true` without a shim, if a shim has no matching page, or if a hydrated page is a draft in a production build (a shim always publishes, so use `unlisted` instead).

### md
```
src/content/pages/hello/
  manifest.json
  index.md
```
```json
{
  "schemaVersion": 1,
  "title": "Hello",
  "description": "A short note.",
  "date": "2026-10-11",
  "updated": "2026-10-12",
  "type": "md",
  "section": "Writing",
  "tags": ["notes"]
}
```

### external
```
src/content/pages/talk/
  manifest.json
```
```json
{
  "schemaVersion": 1,
  "title": "A talk elsewhere",
  "description": "Recording on another site.",
  "date": "2026-10-11",
  "type": "external",
  "url": "https://example.com/talk"
}
```

Folder names `writing`, `projects`, `experiments`, `rss.xml`, `sitemap.xml`, `robots.txt` and `404` are reserved for site routes and fail the build.
