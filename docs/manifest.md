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
| `navTheme` | `light`, `dark` or `auto` | no | `auto` | No longer used: the menu is near-black on every page (docs/decisions.md, 2026-10-17). Kept so existing manifests stay valid. |
| `image` | path | no | | Site-root path to a file in `public/`, such as `/images/tek-tek.webp`. Fills the page's home page tile and becomes its absolute `og:image`. Give every Experiments page one, as a square WebP. See [Home page tile](#home-page-tile). |
| `indexStyle` | object | no | | Colours and font of this page's home page tile. `background` and `color` are CSS colours (default `#171717` and white); the build warns, without failing, if their contrast is below 4.5:1. `fontFamily` is a font role name such as `serif` or `poster`; anything else uses the plain role. On a tile with an `image`, `color` and `fontFamily` style the title, and `background` is hidden behind the picture. See [Home page tile](#home-page-tile). |
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

## Home page tile

Every published page gets a tile on the home page, newest first. `unlisted` and `draft` pages get none. A tile has two forms, chosen by whether the manifest has an `image`.

| | Text tile (no `image`) | Picture tile (`image`) |
| --- | --- | --- |
| Use for | Writing, and anything without a visual of its own | Experiments, and any page that is something to look at |
| Fill | `indexStyle.background` | the picture, edge to edge inside the rounded corners |
| Title | `indexStyle.color` and `fontFamily`, large, at the top | same colour and font, at the foot on a dark gradient |
| Description | shown, up to five lines | **not shown** |
| Section tag | white label cut out of the fill | solid white label over the picture |
| Alt text | none | empty, because the title next to it names the page |

Tiles are square, so every picture is cropped to a square by the tile.

**Rules for a page that gets a picture tile**

1. **Experiments pages get an `image`.** Writing pages stay text tiles unless the author says otherwise. Projects has no rule yet: use a text tile unless asked.
2. **A real grab of the page.** Capture the live page in headless Chromium, never a mock-up or an illustration. For pages that play or animate, capture them in action, so the picture shows the interface doing something.
3. **Square, 1000×1000 WebP**, quality about 80, normally 30 to 100 KB. Save it as `public/images/<slug>.webp` and set `"image": "/images/<slug>.webp"`. The build fails if the file is missing.
4. **Crop for the tile.** The title covers the bottom 40 percent or so, so keep what matters in the top 60. The section tag sits 20px in from the top left, 112×24px at tile size (about a fifth of the picture's width and a twentieth of its height), so leave that corner on empty space. If the page has its own big headline, start the crop below it, so the tile's title doesn't repeat it.
5. **Check the title on the fade.** `indexStyle.color` is drawn over a near-black gradient, so it must read on dark. Look at the tile on the home page before opening the pull request, on desktop and on a phone width.
6. **Still write a `description`.** The tile doesn't show it, but the section page, the meta tag, `og:description` and the RSS feed use it.

Because `image` is also `og:image`, the same file is what link previews show.

**A page with no visual of its own** (a note, an external link) stays a text tile: set `indexStyle` and leave `image` out.

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
Plus `public/images/poster.webp`, the square grab for its tile.
```json
{
  "schemaVersion": 1,
  "title": "Poster",
  "description": "A hand-built HTML page.",
  "date": "2026-10-11",
  "type": "html",
  "section": "Projects",
  "image": "/images/poster.webp",
  "navTheme": "dark",
  "indexStyle": { "color": "#fff" }
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
