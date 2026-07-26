# omid kheirabadi — portfolio site

Static site for Omid Kheirabadi, a Rotterdam-based performance artist. Migrated from
Wix (omidkheirabadi.com) to a standalone static site — plain HTML/CSS/JS, no build
step, no framework, no dependencies. Deployable as-is to any static host.

## Structure

- `index.html` — homepage. "Drift" concept: photo tiles float/bounce around the
  screen, freeze on hover/tap to show a caption, draggable. One random image per
  project per pageload (see "Image pools" below).
- `info.html`, `announcements.html`, `happenings.html` — content pages.
- `store.html`, `blog.html` — **drafts**, not real yet (see "Open items").
- `projects/*.html` — 13 individual project pages, each with a hero image, the
  full write-up, and a filmstrip gallery of that project's photos at the bottom.
- `assets/css/site.css` — the only stylesheet, shared by every page.
- `assets/js/nav.js` — builds the ribbon nav + dropdown panels on every page
  (via `DOMContentLoaded`), and makes project galleries scroll infinitely.
- `assets/images/projects/<slug>/` — 221 images downloaded from the original Wix
  site, self-hosted (not hotlinked). Numbered `01.jpg`, `02.jpg`, ...
- `content/extracted-content.md` — full text extracted verbatim from the live Wix
  site (source of truth for all project descriptions, bio, announcements).
- `content/image-manifest.md` — what's in each project's image folder.
- `omid kheirabadi — drift.html` + `omid kheirabadi — drift_files/` — **legacy**,
  the user's original single-file draft before the rebuild. Superseded by
  `index.html`. Safe to delete, kept only as a backup of their original work.

## Navigation: the 4-ribbon frame

Every page has the same fixed frame, built by `nav.js` from a shared `SECTIONS`
data object (projects / happenings / announcements) plus a few plain links (info,
art store, blog):

- **Left** (vertical text): "projects" — dropdown with all 13 projects + year.
- **Right** (vertical text, mirrored direction from left): "happenings" —
  dropdown with the 6 documented happenings + year.
- **Top** (centered): brand "omid kheirabadi", links home.
- **Bottom**: "announcements" (dropdown, 20 entries) + "info" + "art store" +
  "blog" — all plain/direct links except announcements.

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

## Contact form (`info.html`)

Uses [Web3Forms](https://web3forms.com) (free, no backend). The access key in
the form is live and confirmed connected to the user's correct inbox. Has a
staged "sending..." animation with a forced minimum delay so it never feels
instant, plus a styled success/error note.

## Open items / known drafts

- **`store.html`**: placeholder layout only, using existing project photos as
  fake "products." Needs real product photos/prices, and the buy buttons need
  to be wired to [Stripe Payment Links](https://stripe.com/payment-links) when
  the user is ready.
- **`blog.html`**: two placeholder posts showing the format (title, date, 1-2
  images, short text). Needs real posts.
- **Hosting**: not deployed yet. Recommended Cloudflare Pages or Netlify (both
  free, no build step needed — just deploy the folder).
- Some project years are missing — see above.

## A note on this dev environment's preview tool

The Claude Browser preview pane used during development has a persistent
caching bug: after editing `site.css` or `nav.js`, an already-open preview tab
often keeps serving the stale version even after a "force" navigate. Workaround
that was needed repeatedly: open a genuinely new tab, or swap the
`<link>`/`<script>` src via a cache-busting query string through
`javascript_exec` to confirm a fix actually landed. This is a tool-only quirk,
not a real production caching issue — real visitors won't hit it.
