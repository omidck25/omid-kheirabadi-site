# omid kheirabadi — portfolio site

Static site for Omid Kheirabadi, a Rotterdam-based performance artist. Migrated from
Wix (omidkheirabadi.com) to a standalone static site — plain HTML/CSS/JS, no build
step, no framework, no dependencies. Deployable as-is to any static host.

## Structure

- `index.html` — homepage. "Drift" concept: photo tiles float/bounce around the
  screen, freeze on hover/tap to show a caption, draggable. One random image per
  project per pageload (see "Image pools" below).
- `happenings.html` — a content page. `info.html` and `announcements.html`
  used to be pages too, but were both removed — see "Info modal" and
  "Announcements modal" below.
- `store.html`, `blog.html` — **drafts**, not real yet (see "Open items").
- `projects/*.html` — 14 individual project pages, each with a hero image, the
  full write-up, and a filmstrip gallery of that project's photos at the bottom.
  13 of these came from the original Wix scrape; `radical-meditation.html`
  (2024) was added later directly from the user's own photos/text (not on the
  original Wix site) — its images live at
  `assets/images/projects/radical-meditation/` like any other project, just
  not covered by `content/image-manifest.md`'s "from the Wix scrape" scope.
- `assets/css/site.css` — the only stylesheet, shared by every page.
- `assets/js/nav.js` — builds the ribbon nav + dropdown panels on every page
  (via `DOMContentLoaded`), and makes project galleries scroll infinitely.
- `assets/images/projects/<slug>/` — 221 images downloaded from the original Wix
  site, self-hosted (not hotlinked), plus 14 more for `radical-meditation`
  supplied directly by the user. Numbered `01.jpg`, `02.jpg`, ...
- `content/extracted-content.md` — full text extracted verbatim from the live Wix
  site (source of truth for all project descriptions, bio, announcements).
  Does not include `radical-meditation` (added later, not on Wix) — that
  project's text came from a `.txt` file the user dropped into its image
  folder, since incorporated into the page and removed.
- `content/image-manifest.md` — what's in each project's image folder (13
  Wix-scraped projects only, see above).
- `omid kheirabadi — drift.html` + `omid kheirabadi — drift_files/` — **legacy**,
  the user's original single-file draft before the rebuild. Superseded by
  `index.html`. Safe to delete, kept only as a backup of their original work.

## Navigation: the 4-ribbon frame

Every page has the same fixed frame, built by `nav.js` from a shared `SECTIONS`
data object (projects / happenings / announcements) plus a few plain links
(announcements, art store, blog) and the contact-modal trigger:

- **Left** (vertical text): "projects" — dropdown with the 8 projects that
  aren't also a curated happening, + year (see the dedup note below).
- **Right** (vertical text, mirrored direction from left): "happenings" —
  dropdown with the 6 documented happenings + year.
- **Top** (centered): brand "omid kheirabadi" — a plain link back to
  `index.html`, on every page including the homepage. (It briefly had
  special homepage-only click behavior that opened the info popup; that's
  gone now, superseded by the "more" dropdown below.)
- **Bottom**: a single "more" trigger, dropdown opening upward (same
  `.ribbon-panel` flyout mechanism as projects/happenings, just anchored to
  the bottom of the screen via `bottom:var(--ribbon-h)` instead of a side).
  Inside `#panel-more`, three buttons, all popups now, none of them a real
  page: "info" (see "Info modal" below), "announcements" (see
  "Announcements modal" below — used to be a real page, `announcements.html`
  was removed the same way `info.html` was), "contact" (see "Contact modal"
  below). Merged into one menu per explicit request ("not sure what to call
  it" — went with "more"; open to relabeling). On desktop the panel shrinks
  to a small popup that hugs its own content and floats centered above the
  trigger (`#panel-more{ left:50%; right:auto; width:auto;
  transform:translateX(-50%); }` inside the `min-width:721px` media query)
  — it inherited full edge-to-edge width from the old long-announcements-list
  layout, which read as an oversized white box for 3 short centered words on
  a wide screen. Phone/tablet untouched, already in reasonable proportion at
  that width. "Art store" and "blog" are temporarily removed from navigation
  entirely (not deleted — `store.html` and `blog.html` still exist as draft
  pages) until there's real content for them; `nav.js`'s `PLAIN_LINKS`
  entries for them are left in place since the code already no-ops
  gracefully when the corresponding `[data-*-link]` element isn't present on
  a page, so no JS cleanup was needed to hide them.
- The generic `data-section` open/close/current-page logic (originally built
  for projects/happenings) is reused as-is for "more" — no special-casing
  needed there, and unlike before there's no longer a "current page inside
  more" concept to propagate, since none of its three items are real pages.
- The 6 curated "happenings" are a subset of the 13 Wix-scraped projects —
  same underlying project pages, just featured in both places conceptually.
  `SECTIONS.projects` deliberately excludes any entry that's also in
  `SECTIONS.happenings`, so the same project page isn't listed in both
  dropdowns. This also fixed a highlighting bug for free: pages in both
  lists used to light up both the left "projects" and right "happenings"
  ribbon triggers together; with the duplicate removed from `projects`,
  only "happenings" ever matches on those pages, no special-casing needed
  in `populateRibbons()` to keep them mutually exclusive.

All ribbons are **white** with a hairline border (not colored — an earlier
"funky colored ribbons" version was explicitly reverted).

Bottom-ribbon items are rotated 180° (upside down) by default and flip upright on
hover/touch/open — same for the vertical left/right labels, which read in
mirrored directions from each other.

### Gotcha: don't couple width-changing styles to space-evenly flex siblings

The bottom ribbon holds items in one `justify-content:space-evenly` flex row.
Toggling `font-style: italic` on hover-in of one item (back when the site had
an italic/upright font toggle — since removed, see "Single font system"
below) changed *its own* rendered width slightly (italic glyphs measure
differently), which reflowed the whole row and visibly shifted the other
items — looked like "random items jumping" and took a few rounds to actually
diagnose. The general lesson still applies even with italic gone: don't
toggle width-affecting properties (font-style, font-weight, letter-spacing,
font-family) on elements that share a flex row with siblings whose position
matters — and per a later reversion attempt (see "Single font system"
below), this isn't limited to horizontal rows either: the same class of
bug hit a *vertically* stacked list too, as a height change from
different text-wrapping instead of a width change. `transform` is always
safe (it's post-layout, never triggers reflow) — that's why the
rotate-on-hover doesn't have this problem.

### Gotcha: `.current`/`.open` styling must target the specific trigger, not the ribbon

Early version added `.current`/`.open` classes to the parent `.ribbon` div, which
worked when each ribbon had exactly one trigger. Once the bottom ribbon grew to
four triggers sharing one container, that pattern made ALL FOUR light up/flip
together. Fixed by targeting the specific trigger element directly
(`.ribbon-trigger.current`, `.ribbon-bottom.open [data-section]`) instead of the
shared ancestor. Keep this in mind before adding more items to any ribbon.

### Gotcha: Cloudflare strips `.html` from URLs — normalize before comparing

Cloudflare's static asset serving redirects clean URLs (`/happenings.html`
→ `/happenings`),
so `location.pathname`'s last segment won't have the `.html` extension that
`SECTIONS`/`PLAIN_LINKS` hrefs use. `nav.js` re-appends `.html` before comparing
(`if (currentFile && !/\.html$/.test(currentFile)) currentFile += '.html';`) —
without this, the "current page" never matches and the ribbon trigger for the
page you're on never gets `.current` (so it never locks upright). Local
`file://` testing won't catch this since local paths keep the extension; it
only shows up on the live Cloudflare deployment.

### The current-page ribbon trigger stays upright permanently

`.ribbon-trigger.current{ transform:rotate(0deg) !important; }` — whichever
ribbon item matches the page you're on (set by the `.current` class logic
above) stays readable/upright the whole time you're on that page, not just on
hover. Applies to all four ribbons, mobile and desktop.

### Single font system: Space Grotesk everywhere, no italic

The site used to mix two fonts — 'Newsreader' (an italic serif) for
headings/titles/body text and 'Space Grotesk' (upright sans) for nav/meta
labels — with an italic-default/upright-on-hover toggle on ribbon triggers
(reversed on the homepage specifically: upright by default, italic on
hover/open there). All of that was removed per explicit request ("simpler
but still classy... fits a contemporary conceptual artist" + "the font of
main texts and paragraphs I do not like"). The whole site — headings, body
text, nav, everything — now uses 'Space Grotesk' only, upright, at weights
400/500/700 (only weights actually @font-face'd in `assets/css/fonts.css`;
don't reach for other weights without adding the face first). Newsreader's
`@font-face` rules were deleted from `fonts.css` entirely since nothing
references it anymore — if it's ever needed again, the previous version is
in git history.

This also simplified away the italic-driven ribbon interaction entirely
(the `body.home` reversed-italic rule, the `.ribbon.open [data-section]`
italic toggle, etc.) — the rotate-to-upright-on-hover/current-page behavior
is untouched and is now the *only* interactive typographic signal on ribbon
triggers, which is intentionally simpler than before.

**Tried and reverted:** a hover/focus-triggered switch to 'Familjen
Grotesk' italic (a close aesthetic cousin of Space Grotesk that actually
ships an italic) was added to bring the reactive italic feel back, then
reverted the same session — the user found the substitute font not
actually similar enough and noticeably more compact, and worse, it
introduced a real bug: hovering a `.ribbon-panel li a` could change how
many lines its title wrapped to (different font metrics = different
text width), which shifted every item below it in the vertically-stacked
list — a harsh jitter when moving the mouse between adjacent titles in
the projects/happenings panels. This is the same class of problem as the
flex-siblings gotcha above (toggling a width/metrics-affecting property
reflows neighbors), just manifesting as a *height* change in a vertical
list instead of a *width* change in a horizontal row — don't reintroduce
a font-family/font-style hover toggle on these elements without solving
that first (e.g. reserving line-height-stable space, or only applying it
to single-line-guaranteed elements).

## Homepage drift physics (`index.html` inline script)

- Tiles bounce off the ribbon edges and off each other — but overlap is
  **allowed up to 25% of a tile's width/height per axis** before they push
  apart (not a hard no-overlap rule). Implemented via a "shrunk virtual box"
  collision check (inset by the allowed margin) reusing a standard single-axis
  least-overlap resolver — this converges reliably; a naive
  independent-both-axes push does not (tried it, caused unresolvable tug-of-war
  between 3+ overlapping tiles).
- Runs 4 collision-resolution passes per frame so clusters of 3+ overlapping
  tiles settle within a frame or two instead of fighting across many frames.
- All homepage setup code runs inside `DOMContentLoaded`, not inline — reading
  ribbon widths via `getBoundingClientRect()` before layout is guaranteed ready
  once produced a bogus (even negative) tile size. Don't move this back to
  running synchronously at parse time.
- Each project has a small **pool** of 4 candidate image indices; one is picked
  at random per pageload, so the homepage composition differs across visits.

## Content & images

- All project/bio/announcement text originates from `content/extracted-content.md`
  (scraped verbatim from the live Wix site). Treat it as ground truth if a page's
  wording needs checking.
- Project **years**: known confidently for most projects (stated on their own
  page or cross-referenced against the bio/announcements). Left **blank** where
  genuinely unknown rather than guessed: `belfast-oppressed`, `you-only-exist-on-paper`,
  `making-art`, `i-am-free-as-a-bird`. `inburgered-integrated` has a source
  discrepancy (bio says 2022, the project's own page says 2023) — using 2023.
  Ask the user to confirm/fill in the blanks if precision matters.
- Images were downloaded directly from Wix's CDN at their already-served
  resolution (not the huge originals) — no re-compression needed.

## Contact modal (`assets/js/nav.js`, `initContactModal`)

The only contact method on the site now — info.html's own form was removed
per explicit request (it felt too formal/hard to find), and info.html itself
is now gone too (see below). A "contact" item in the bottom ribbon (every
page) opens a small popup instead, injected by `nav.js`: To/From/Message
stacked, one send button, styled after a simple mail-compose sheet. Uses
[Web3Forms](https://web3forms.com) (free, no backend); the access key is
live and confirmed connected to the user's correct inbox. Has a staged
"sending..." animation with a forced minimum delay so it never feels
instant, plus a styled success/error note.

## Info modal (`assets/js/nav.js`, `initInfoModal`)

`info.html` was removed entirely — an explicit, deliberate experiment
("let's try it, if I don't like it, you will redo it"), not something to
casually re-add. The bio text now lives in a popup (`.info-modal-overlay`),
injected by `nav.js`. It first opened only via a special click handler on
the homepage's "omid kheirabadi" brand text; that was superseded by moving
"info" into the "more" ribbon-bottom dropdown (see "Navigation" above),
available identically on every page — `initInfoModal()` now just looks for
`[data-info-trigger]` inside that panel, no `body.home` gating. If the user
wants `info.html` back as a real page instead of a popup at all: git history
has the last version before removal; re-add its `data-info-link` ribbon item
and `nav.js`'s `PLAIN_LINKS` entry, and remove `initInfoModal()` + its CSS.

The modal is deliberately compact (small type, tight line-height, minimal
padding) so the bio text fits within the viewport without scrolling on
ordinary screens — `overflow-y:auto` + a generous `max-height` are kept
only as a last-resort safety net for very small screens, not the intended
way to view it. If more text gets added later, prefer trimming/tightening
further over letting it silently start scrolling.

## Announcements modal (`assets/js/nav.js`, `initAnnouncementsModal`)

`announcements.html` was removed the same way `info.html` was, per explicit
request ("it doesn't need its own page anymore"). All 20 entries (title,
optional date, thumbnail image, body text) now live in a popup opened from
"announcements" inside the "more" ribbon-bottom dropdown, on every page.

Unlike the info modal, this one is built from a data array (`ANNOUNCEMENTS`,
same slug/ext/title/when/body shape as the old page's markup) and DOM
methods (`createElement`/`textContent`) rather than one big `innerHTML`
string — with 20 entries' worth of quotes and apostrophes to get right,
hand-escaping all of that into a string literal is exactly the kind of
place a typo silently breaks the page; building nodes and setting
`textContent` sidesteps escaping entirely. Thumbnails resolve to
`assets/images/announcements/<slug>.<ext>` via `BASE`, same images the old
page used (still there, only the page linking to them was removed).

Kept intentionally small (smaller type, tighter spacing than the old page
had) per explicit request. Unlike the info modal, this one is *expected* to
scroll — 20 entries with images is a lot more content than the 3-paragraph
bio — so `overflow-y:auto` here is the normal way to use it, not a
last-resort fallback.

## Open items / known drafts

- **`store.html`**: placeholder layout only, using existing project photos as
  fake "products." Needs real product photos/prices, and the buy buttons need
  to be wired to [Stripe Payment Links](https://stripe.com/payment-links) when
  the user is ready.
- **`blog.html`**: two placeholder posts showing the format (title, date, 1-2
  images, short text). Needs real posts.
- **Hosting**: live on Cloudflare Workers static assets at
  `omid-kheirabadi-site.omid-ck25.workers.dev`, auto-deploys on push to `main`.
  Custom domain `omidkheirabadi.com` (owned via Namecheap) intentionally not
  connected yet — user wants to wait until the site is finalized.
- Some project years are missing — see above.

## A note on this dev environment's preview tool

The Claude Browser preview pane used during development has a persistent
caching bug: after editing `site.css` or `nav.js`, an already-open preview tab
often keeps serving the stale version even after a "force" navigate. Workaround
that was needed repeatedly: open a genuinely new tab, or swap the
`<link>`/`<script>` src via a cache-busting query string through
`javascript_exec` to confirm a fix actually landed. This is a tool-only quirk,
not a real production caching issue — real visitors won't hit it.

Also: the ribbon panels animate `max-width` on open (CSS `transition`). Reading
`getComputedStyle(panel).maxWidth` via `javascript_exec` *synchronously right
after* a click dispatch reads mid-transition (or pre-paint) and reports `0px`
even when the underlying CSS/JS is correct — this looks exactly like a broken
dropdown but isn't. Wait ~300ms after the click before checking computed
styles/dimensions, or check `classList.contains('open')` instead of measuring
layout immediately.
