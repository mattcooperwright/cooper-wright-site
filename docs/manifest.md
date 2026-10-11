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
| `type` | `react`, `html`, `mdx` or `external` | yes | | Decides which payload the folder holds. |
| `status` | `published`, `unlisted` or `draft` | no | `published` | See [Status](#status). |
| `section` | `Writing`, `Projects` or `Experiments` | no | | Menu group. Pages without one go under "More". |
| `updated` | date | no | | Date of the last meaningful change. |
| `tags` | array of strings | no | | Not used by the site yet. |
| `menuOrder` | number | no | | Lower numbers come first within a menu group. Pages without one follow, by date. |
| `navTheme` | `light`, `dark` or `auto` | no | `auto` | Colours of the header on this page. `auto` follows the visitor's system setting. |
| `image` | path | no | | Share image, as a site-root path to a file in `public/`, such as `/images/hello.png`. Becomes an absolute `og:image`. |
| `indexStyle` | object | no | | Inline styles for this page's card on the index. Accepts `background`, `color` and `fontFamily`, all strings. |
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

There is no sitemap yet. When one is added it should use `getListedPages()` in `src/lib/pages.ts`.

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

The html type is defined in the schema but doesn't render yet. A page of that type fails the build with "not implemented yet" until the first real one is ported.
