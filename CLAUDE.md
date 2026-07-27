# omid kheirabadi — portfolio site

Static site for Omid Kheirabadi, a Rotterdam-based performance artist. Migrated from
Wix (omidkheirabadi.com) to a standalone static site — plain HTML/CSS/JS, no build
step, no framework, no dependencies. Deployable as-is to any static host.

## Structure

- `index.html` — homepage. "Drift" concept: photo tiles float/bounce around the
  screen, freeze on hover/tap to show a caption, draggable. One random image per
  project per pageload (see "Image pools" below).
- `announcements.html`, `happenings.html` — content pages. `info.html` used
  to be one too, but was removed — see "Info modal" below.
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

- **Left** (vertical text): "projects" — dropdown with all 13 projects + year.
- **Right** (vertical text, mirrored direction from left): "happenings" —
  dropdown with the 6 documented happenings + year.
- **Top** (centered): brand "omid kheirabadi". On every page except the
  homepage it's a plain link back to `index.html`. On the homepage itself,
  clicking/touching it instead opens the info popup — see "Info modal" below.
- **Bottom**: "announcements", "contact" — all plain/direct links/actions (no
  dropdown). Announcements used to be a dropdown of all 20 entries like
  projects/happenings, but was changed to a plain link to the full
  `announcements.html` page per explicit request. "Contact" isn't a link — it
  opens the quick contact modal (see below). "Info" used to be a third item
  here linking to `info.html`; both are gone now (see "Info modal"). "Art
  store" and "blog" are temporarily removed from this ribbon (not deleted —
  `store.html` and `blog.html` still exist as draft pages) until there's real
  content for them; `nav.js`'s `PLAIN_LINKS` entries for them are left in
  place since the code already no-ops gracefully when the corresponding
  `[data-*-link]` element isn't present on a page, so no JS cleanup was
  needed to hide them.

All ribbons are **white** with a hairline border (not colored — an earlier
"funky colored ribbons" version was explicitly reverted).

Bottom-ribbon items are rotated 180° (upside down) by default and flip upright on
hover/touch/open — same for the vertical left/right labels, which read in
mirrored directions from each other.

### Gotcha: don't couple width-changing styles to space-evenly flex siblings

The bottom ribbon holds 4 items in one `justify-content:space-evenly` flex row.
Toggling `font-style: italic` on hover-in of one item changed *its own* rendered
width slightly (italic glyphs measure differently), which reflowed the whole row
and visibly shifted the other 3 items — looked like "random items jumping" and
took a few rounds to actually diagnose. Fix: don't toggle width-affecting
properties (font-style, font-weight, letter-spacing) on elements that share a
flex row with siblings whose position matters. `transform` is always safe (it's
post-layout, never triggers reflow) — that's why the rotate-on-hover doesn't have
this problem.

### Gotcha: `.current`/`.open` styling must target the specific trigger, not the ribbon

Early version added `.current`/`.open` classes to the parent `.ribbon` div, which
worked when each ribbon had exactly one trigger. Once the bottom ribbon grew to
four triggers sharing one container, that pattern made ALL FOUR light up/flip
together. Fixed by targeting the specific trigger element directly
(`.ribbon-trigger.current`, `.ribbon-bottom.open [data-section]`) instead of the
shared ancestor. Keep this in mind before adding more items to any ribbon.

### Gotcha: Cloudflare strips `.html` from URLs — normalize before comparing

Cloudflare's static asset serving redirects clean URLs (`/announcements.html`
→ `/announcements`),
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

### Homepage-only reversed italics

On `index.html` only (`body.home` class), ribbon trigger text is upright by
default and goes italic on hover/open — the opposite of every other page, where
it's italic by default and goes upright on hover/open. This was an explicit,
deliberate user request, not an inconsistency to "fix."

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
injected by `nav.js`, that opens **only** when the "omid kheirabadi" brand
text is clicked/touched **while already on the homepage** (`initInfoModal()`
bails out immediately unless `document.body.classList.contains('home')`).
On every other page that same brand text is left completely alone — it's
still the plain link to `index.html` that `populateRibbons()` always sets,
no popup, no intercepted click. If the user doesn't like this pattern,
reverting means: restoring `info.html` (git history has the last version
before removal), re-adding its `data-info-link` ribbon item to all pages'
bottom ribbon + `nav.js`'s `PLAIN_LINKS`, and removing `initInfoModal()` +
its CSS.

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
