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

## 2026-10-12: Kaleidoscope backdrop replaced with a fluted-glass WebGL shader
The canvas-2D kaleidoscope wedges in `KaleidoscopeBackground.astro` read as muddy rather than glassy, so the home page backdrop was rebuilt as `FlutedGlassBackground.astro`: a raw WebGL fragment shader rendering an iridescent, continuously-shifting plasma colour field, bent into fine vertical ridges that mimic reeded/fluted glass (brightening at each ridge centre, darkening in the grooves between them). It uses the browser's native `canvas.getContext('webgl')` API directly — no shader or 3D library — so it adds zero npm dependencies, the same spirit as the component it replaces. Same contract as before: fixed full-viewport canvas behind the tile grid, frozen on a single rendered frame under `prefers-reduced-motion`, silent no-op if WebGL is unavailable or shader compilation fails.

## 2026-10-12: Overused Grotesk, vendored, for the display role — and why not cdnfonts.com
The request was to set the home page's name heading in Neue Haas Grotesk Display Pro, loaded from cdnfonts.com. That was declined: this project self-hosts fonts and never links an external font host (the sandboxed-html exception doesn't cover the main site), and the old site's Neue Haas Grotesk Display Pro was already deliberately replaced once before (2026-10-11) specifically over licensing — it's a commercial Monotype/Linotype typeface, and cdnfonts.com is widely known for serving fonts without a license from the foundry, a real exposure for a public repo.

Overused Grotesk (`github.com/RandomMaerks/Overused-Grotesk`) is used instead: a variable neo-grotesk explicitly built as an open alternative to that same Swiss-grotesk territory, licensed SIL OFL 1.1. It isn't published to Fontsource, so it's vendored rather than installed from npm: pinned to release `v0.5-alpha.2`, subset to the project's standard `latin`/`latin-ext` unicode ranges with `fonttools`, and laid out under `src/assets/fonts/overused-grotesk/` in the exact shape `font-faces.ts` already expects a Fontsource package to have (see `docs/fonts.md`), so no shared font code needed to change. It replaces Inter under the existing `display` role rather than taking on a new one — `display` was added on 2026-10-11 solely as "the open-licence replacement for Neue Haas Grotesk Display Pro," and no page had used it since, so repurposing it for a more faithful replacement of that same typeface fits its original purpose exactly.

## 2026-10-12: Home page name, tiles and nav — second pass
Four more changes alongside the font swap above. The home page heading is now large (`text-[14vw]`, capped at `text-9xl`), white, and has no background panel — a text-shadow keeps it legible over the glass backdrop instead. Tiles invert their colours (background and foreground swapped, including each page's own `indexStyle`) so they read as dark cards on the lighter backdrop rather than white boxes; `TILE_DEFAULTS` swapped the same way. Tiles are now `aspect-square`, with the description clamped to stop long copy breaking the square. The section label ("Writing", "Experiments") now renders in the nav's own typeface (`font-body`) regardless of the tile's font role, as a white-on-translucent-white chip so the tile's background shows through it, rather than a plain low-opacity caption.

## 2026-10-12: Header nav moved to a footer
`Base.astro`'s single shared nav (used by every page) moved from a `<header>` above `<main>` to a `<footer>` below it. Content and per-page light/dark/auto theming are unchanged; only its position and the header-to-footer margin direction (`mb-12` → `mt-12`) changed.

## 2026-10-12: Tile section tag is a literal hole, not a translucent tint
The section tag's translucent chip (previous entry) tinted the tile's own background; the brief asked for something more literal — a square genuinely cut out of the tile, showing the fixed glass backdrop through it. `Tile.astro` is only ever used in the home grid, which sits directly above `FlutedGlassBackground`'s `fixed inset-0 -z-10` canvas with nothing opaque in between, so a truly transparent pixel anywhere in a tile reveals the live, correctly-positioned animation underneath it — no duplication, no faking.

The tile's background fill is now its own `absolute inset-0` layer, separate from its content, with a hole cut into it via `mask-image`/`mask-composite: exclude` (plus `-webkit-mask-*`/`xor` for Safari) — two overlapping opaque mask layers excluded against each other leave a transparent gap. Unsupported browsers just ignore the mask and show a solid tile. The one simplification this needed: the hole can't gracefully chase a dynamically-sized text label (no reliable cross-browser way to mask an element by another element's rendered box), so the tag became a fixed-size chip (`20px, 20px, 112×24px`, sized for "EXPERIMENTS", the longest label) rather than one that hugs its text — the visible chip and the mask cutout use the same numbers, so they can't drift apart. The hole's second mask layer is a small inline SVG rounded rect (`rx`/`ry` 3px) rather than a plain gradient box, so its corners are softened rather than sharp.

## 2026-10-12: Tiles regain rounded corners
The 2026-10-12 redesign deliberately squared off the tiles' corners for a flatter card look. On request, tiles are now `rounded-[18px]` again — a bigger, more deliberate radius than the old default, not a reversion to the original `rounded-lg`. `overflow-hidden` (unchanged) clips the background fill and the mask cutout to this same rounded shape.

## 2026-10-12: Titles and wordmarks are verbatim
Manifest titles and visible wordmarks are kept exactly as the author wrote them. Their spelling and case are never corrected. The prompt was the INFIINITE ACIID page, whose title and logo had been changed to "Infiniite Aciid". The brand is INFIINITE ACIID, all capitals with that spelling, on purpose. The manifest title, the html `<title>` and the logo now match it. Internal identifiers such as the slug and the storage key were left as they were.

## 2026-10-12: Home page name outlined on three lines, menu pinned to the bottom
Merged with the second-pass home page above. The name keeps that pass's display font and has no panel, but it now runs one word per line at -0.075em tracking and 0.85 leading, drawn as a white outline with no fill. A drop shadow keeps it legible over the glass backdrop, since a text-shadow would show through the transparent fill. Tile titles are 3em with leading-none and wrap long words. The footer nav is pinned to the bottom of the viewport on the home page only, through `Base.astro`'s `navFixed` prop; other pages keep it in the flow below their content.

## 2026-10-14: Home page name in near-black with an inner shadow
The name is solid again and smaller (`clamp(2.75rem, 11vw, 9rem)`, down from `clamp(3rem, 17vw, 14rem)`). It is near-black (`#1a1a1a`) with a faint black inner shadow. CSS has no inset text shadow, so the shadow comes from a small inline SVG filter on the heading that blurs and offsets the inverse of the letter shapes and clips the result back inside them. The drop shadow from the outlined version is gone, since dark letters hold up over the backdrop on their own. A reeded-glass fill was tried first and rejected.

## 2026-10-17: Menu becomes a near-black left sidebar in Roboto Mono
The shared menu moved from the footer to a fixed left sidebar (`md:w-56`) on every page, near-black (`#111`) with light text, set in uppercase Roboto Mono. Below the `md` breakpoint it sits as a near-black bar at the top of the page instead. The home page's `navFixed` bottom pin is gone, since the sidebar is fixed everywhere.

Roboto Mono was requested by name, so it was added as the `mono` font role from `@fontsource-variable/roboto-mono` 5.3.0 (OFL-1.1). `Base.astro` loads it on every page, and Tailwind's `--font-mono` now points at it, so code in Markdown posts uses it too.

The menu is the same near-black on every page, so the manifest's `navTheme` no longer has any effect. The field stays in the schema so existing manifests remain valid. Sandboxed html pages draw their own menu in `HtmlShell.astro`; it has the same colours and layout but uses the system monospace stack, because that page's CSP has no `'self'` and cannot load the self-hosted font.

## 2026-10-31: Pinhole veil layered over the fluted glass
The fluted-glass shader stays as the base layer. A second layer, `PinholeVeil.astro`, now sits above it and below the page content on the home page: a 2D canvas filled with near-opaque white (97%) with small angled flecks cut out using `destination-out`, so the glass shows through only as pinpoints, like a night sky in negative. The inspiration was the sparse, minimal particle field on Google's Antigravity page, taken as a mood and not copied. Flecks are a mix of fine dashes and a few larger pinholes, denser toward the bottom of the viewport, drifting slowly upward with a slight sideways sway. It freezes on one frame under `prefers-reduced-motion`. No new dependency. The tile section-tag holes now reveal the veil and the glass through it, not the raw glass, so they read mostly white.
The tile section tag label is near-black (`#1a1a1a`, matching the home page name) instead of white with a dark shadow, since it now sits over the white veil and white text disappeared.

## 2026-10-31: Pinhole veil made opaque, larger and responsive
The veil is now fully opaque white (it was 97%), because the faint wash let the glass's grey vertical ridges ghost through everywhere. The glass now shows only inside the flecks. Flecks are roughly twice the size and a bit fewer. Their size now changes three ways: a gentle pulse (+/-35%) rolling diagonally across the screen, growth within 230px of the cursor (up to 4.8x at the centre), and a large swell (up to 6.5x) that starts 9 seconds after load and then recurs every 20 to 30 seconds, sweeping in from the left over about 2.5 seconds and ebbing over about 7. Under `prefers-reduced-motion` none of it runs and a single still frame is drawn. The cursor effect uses `pointermove`, so it also follows a finger on touch screens while dragging.

## 2026-10-31: Glass ridges softened
With the pinhole veil opaque, the fluted glass shows only inside the flecks, and in the large ones its vertical ridges read as grey stripes. The shader's ridge contrast is now faint: refraction 0.035 to 0.012, ridge shading 0.42..1.05 to 0.86..1.02, groove seam 0.65 to 0.94, specular glint 0.35 to 0.05. A hint of the ridges remains so the layer still reads as glass. The effect on the glass is only visible through the flecks, so no other part of the page changes.

## 2026-10-31: Menu becomes a slim rail with a hover index
The left sidebar listed every page, which would keep growing. It is now a slim rail (`9rem` on desktop, a sticky top bar on mobile) showing only Home and the top-level sections. The full list moved into an index panel, laid out like a site map: one column per section with a page count, each page's title large in the mono face and its description in two clamped lines below.

On desktop with a mouse, hovering the rail opens the index and moving off it closes it, with short delays so a passing cursor doesn't flash it. Hovering a section in the rail picks out its column. Clicking a section still goes to its section page. On mobile, and on wide touch screens with no hover, tapping a section opens the index scrolled to that section, and tapping it again or tapping the visible site closes it. Keyboard focus opens it, and Escape or tabbing out closes it. Without JavaScript the rail's links still reach Home and each section page.

The index never covers the whole screen. On desktop it stops `max(12vw, 6rem)` short of the right edge, and on mobile it is `78dvh` tall below the bar. The visible strip sits under a light scrim (`#111` at 22%), which is what catches the click that closes it. That also works over sandboxed html pages, whose iframe would otherwise swallow the click.

The menu is one component, `SiteMenu.astro`, used by both `Base.astro` and `HtmlShell.astro`, replacing the two separate menus. Its styles and script are inline and use no Tailwind classes, because HtmlShell's CSP has no `'self'` and can load neither the site stylesheet nor bundled scripts. That CSP already allowed inline scripts; the shell now uses that for the menu's open and close behaviour. The font is the `mono` role, falling back to the system mono stack where the role isn't defined, as on html pages.

## 2026-10-31: Menu typography reduced to one size
The rail and index now use a single style: the mono role at 12px, uppercase, regular weight. The large page titles, the 11px labels and the bold Home are gone. Hierarchy comes from colour on the near-black: page titles and active or current items white (`#f5f5f5`), section labels and rail items mid grey (`#a6a6a6`), descriptions, counts and the Index kicker darker grey (`#808080`). Each grey keeps at least 4.5:1 contrast. Uppercase is only CSS, so titles stay verbatim in the source and to screen readers. In the rail, the section you're in is white and underlined, while the section you've opened is white without the underline, which separates the two states on mobile.

## 2026-11-01: Menu opens one section at a time, titles only
Supersedes the hover index (2026-10-31). Opening one category showed every page in a full index, with descriptions and counts, which had little to do with the label that was tapped. Each section label in the rail now opens a small menu of only that section's page titles: no descriptions, counts or headings, since the label already names the section. The order is unchanged (menu order, then newest). Titles are verbatim, external pages keep their arrow, and the page you are on is underlined.

Opening is by click or tap on every device, desktop included. Clicking the label again, clicking or tapping anywhere outside, or pressing Escape closes it. With a menu open, hovering another label on desktop switches to it; moving the mouse away does not close it, because menus that vanish when the cursor drifts are an annoyance and click-to-open makes that closing unnecessary. A transparent layer behind the rail catches the outside click, including over sandboxed html pages, whose iframes would swallow it. The earlier dimming scrim is gone: with a small menu it made the page feel interrupted.

The open label becomes an inverted chip (white fill, near-black text), the same white label used for the section tags on the home page tiles, so it is clear which label the list belongs to. Rail labels have four states: mid grey by default, white on hover, white and underlined for the section you are in, and the chip for the open one. On desktop the list opens beside the rail with its first title level with the label. On mobile it drops from the top bar at full width in 44px rows and is only as tall as its list, so the site stays visible. Section labels are buttons for keyboard and screen reader users (`aria-expanded`), Tab moves from a label into its list, and Escape returns focus to the label. Without JavaScript each label is a plain link to its section page.

The section pages (`/writing/`, `/experiments/`) are no longer linked from the menu, since every title is listed. They remain reachable by URL and are still in the sitemap.

## 2026-11-01: Experiment tiles filled with a screen grab
The three Experiments tiles (TEK TEK, INFIINITE ACIID, I Am Sitting in a Room) now carry a picture. A tile with an `image` is filled by it, edge to edge inside the rounded corners. The title sits at the foot on a dark gradient, in the tile's own colour and font, and the description is left out. The section tag becomes a solid white chip, since the see-through hole in the tile fill would be hidden behind the picture. The picture has empty alt text, because the title right next to it already names the page. Tiles without an `image`, the Writing tiles, are unchanged.

The images are square WebP files at 1000px (about 30 to 40 KB each), in `public/images/`, referenced from each manifest's `image` field. Because `image` is also the page's share image, links to these pages now preview with the grab. The pictures are real screen grabs of the live pages from headless Chromium, cropped square: TEK TEK and INFIINITE ACIID while playing, so the live spectrum and the STOP state show, and Room on its first screen. Each crop was chosen to leave the top-left corner, where the chip sits, on empty space, and to start below the page's own headline where it has one, so the tile title doesn't repeat it. They are not regenerated automatically and will go stale if a page changes.

## 2026-11-01: Tile rules written into the manifest spec
`docs/manifest.md` now has a Home page tile section, so a future page, including one submitted by a chat or machine sender, gets the right tile without guessing. It sets out the two tile forms (text and picture), which sections get a picture (Experiments, yes; Writing, no; Projects, undecided so text), the image spec (a real grab, square 1000x1000 WebP, `public/images/<slug>.webp`) and how to crop for the title fade and the section tag. The `image` and `indexStyle` field rows and the html example were corrected to match, and `CLAUDE.md` points to it. Nothing is enforced by the build beyond the existing check that the image file exists, so the rules rely on whoever adds the page.

## 2026-11-01: pianohouse added, and sandboxed html pages may start blob workers
pianohouse is an html page in Experiments. It renders its piano, EP, organ and rave stab samples in a Web Worker built from a `blob:` URL. The shell CSP is `default-src 'none'` with no `worker-src`, so workers fall back to `script-src`, which has no `blob:`. The worker was refused and the page dropped to its plain oscillator fallback, with all five instruments sounding thinner. The shell CSP now adds `worker-src blob:`. A worker stays inside the sandboxed iframe's opaque origin, and `connect-src 'none'` still stops it reaching the network, so the added exposure is small. It applies to every html page, not only this one. The manifest title is `pianohouse` in lowercase, as the author wrote it.
