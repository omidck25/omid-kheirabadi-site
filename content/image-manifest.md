# Project Image Manifest

Images downloaded from the live Wix site (https://www.omidkheirabadi.com) for each of the 13 project pages, saved locally at `assets/images/projects/<slug>/`. Filenames are sequential (`01.jpg`, `02.jpg`, ...) in the order the images appear on each page. URLs were captured after fully scrolling each page (to trigger lazy-loaded galleries/sliders) and de-duplicating by Wix's internal file ID. Downloaded at the resolution actually served in-page (Wix's `/v1/fill/...` responsive transform), not the multi-MB originals — comparable in approach to normal web image sizes, not the huge files in `omid kheirabadi — drift_files/`.

Total: **221 images** across 13 projects. No file exceeded 5MB (largest ~490KB, a PNG).

---

## 1. its-fine-really-silly-me
**16 images**, all `.jpg`, mostly ~980x784 (a few 595x476 / 380x476 smaller variants).
Files: 01.jpg – 16.jpg
URL: https://www.omidkheirabadi.com/its-fine-really-silly-me

## 2. carnisse-in-flux
**19 images**, all `.jpg`. Mix of ~980-wide landscape shots and several ~320x485 / ~487x731 portrait-orientation photos.
Files: 01.jpg – 19.jpg
URL: https://www.omidkheirabadi.com/carnisse-in-flux

## 3. bingo-machine
**8 images**, all `.jpg`, uniformly ~980x653. Sparsest of the "medium" projects — likely a single-row gallery, no separate slider content found beyond these 8.
Files: 01.jpg – 08.jpg
URL: https://www.omidkheirabadi.com/bingo-machine

## 4. happening-to-one-another
**11 images**, all `.jpg`. Mix of full-width (~980x653) and portrait (~324x485) images.
Files: 01.jpg – 11.jpg
URL: https://www.omidkheirabadi.com/happening-to-one-another

## 5. belfast-oppressed
**9 images**, all `.jpg`. Mix of full-width and ~300x450 portrait crops.
Files: 01.jpg – 09.jpg
URL: https://www.omidkheirabadi.com/belfast-oppressed

## 6. inburgered-integrated
**21 images**, all `.jpg`. Image-rich — mostly ~980x653 full-width shots plus a few 300x450 portraits.
Files: 01.jpg – 21.jpg
URL: https://www.omidkheirabadi.com/inburgered-integrated

## 7. alive-and-unborn
**28 images**, all `.jpg`. One of the richest galleries — wide mix of orientations (300x450, 675x450, 980x653/654, 487x731).
Files: 01.jpg – 28.jpg
URL: https://www.omidkheirabadi.com/alive-and-unborn

## 8. you-only-exist-on-paper
**11 images** — 10 `.jpg` + 1 `.png` (11.png, 450x600, ~490KB — the largest file downloaded, but still under the 5MB flag threshold).
Files: 01.jpg – 10.jpg, 11.png
URL: https://www.omidkheirabadi.com/you-only-exist-on-paper

## 9. one-day-is-too-short
**22 images**, all `.jpg`. Image-rich, similar structure to inburgered-integrated (full-width shots + portrait crops).
Files: 01.jpg – 22.jpg
URL: https://www.omidkheirabadi.com/one-day-is-too-short-three-days-are-too-long

## 10. making-art
**19 images**, all `.jpg`. Note: this page has a cookie-consent banner that briefly suppressed lazy-loading on first pass (only 6 images initially detected); after dismissing the banner and re-scrolling, the full 19-image set was captured. Includes a duplicated slider (4 images appeared twice in the DOM — de-duplicated by file ID).
Files: 01.jpg – 19.jpg
URL: https://www.omidkheirabadi.com/making-art

## 11. i-am-free-as-a-bird
**40 images**, all `.jpg`. By far the richest gallery — a long page (~24,000px) with a large uniform-size sequence (980x551, ~30 images) followed by a second set of portrait/landscape images (351x468 through 980x736).
Files: 01.jpg – 40.jpg
URL: https://www.omidkheirabadi.com/i-am-free-as-a-bird

## 12. spend-the-night-with-me
**12 images**, all `.jpg`, uniform ~980x551 / 980x644.
Files: 01.jpg – 12.jpg
URL: https://www.omidkheirabadi.com/spend-the-night-with-me

## 13. a-tough-soldier
**5 images**, all `.jpg` (980x693, 981x654, 487x731, 489x731, 980x653). Sparsest project overall — short page, single small gallery.
Files: 01.jpg – 05.jpg
URL: https://www.omidkheirabadi.com/a-tough-soldier

---

## Notes / Failures
- No project pages failed to load; all 13 URLs were reachable and yielded at least 5 images.
- No project had zero images beyond what already existed in `omid kheirabadi — drift_files/`.
- `making-art` required special handling (cookie-banner dismissal + re-scroll) to reveal its full gallery — worth double-checking manually if any images still seem missing when the new site is built.
- Image URLs are Wix `static.wixstatic.com` CDN links using the `/v1/fill/w_*,h_*,q_90,enc_avif,quality_auto/` responsive transform as actually served on the page — dimensions above reflect the downloaded file, not necessarily the original upload resolution.
