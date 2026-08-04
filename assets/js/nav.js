// Shared sidebar nav, built the same way on every page.
// Each page sets `window.SITE_BASE` before including this script:
//   '' for pages at the site root, '../' for pages one folder deep (e.g. /projects/*.html).
(function () {
  var BASE = window.SITE_BASE || '';

  var SECTIONS = {
    // Entries that are also one of the curated "happenings" below are
    // deliberately left out of this list — they live in the happenings
    // dropdown only, so the same project page isn't listed in both menus.
    projects: [
      { title: "radical meditation", href: "projects/radical-meditation.html", year: "2025" },
      { title: "inburgered", href: "projects/inburgered-integrated.html", year: "2023" },
      { title: "alive & unborn", href: "projects/alive-and-unborn.html", year: "2023" },
      { title: "you only exist on paper", href: "projects/you-only-exist-on-paper.html", year: "2021" },
      { title: "one day is too short...", href: "projects/one-day-is-too-short.html", year: "2022" },
      { title: "making art", href: "projects/making-art.html", year: "2020" },
      { title: "i'm free as a bird", href: "projects/i-am-free-as-a-bird.html", year: "2020" },
      { title: "a tough soldier", href: "projects/a-tough-soldier.html", year: "2019" },
      { title: "happening to one another", href: "projects/happening-to-one-another.html", year: "2023" },
    ],
    happenings: [
      { title: "[wrong order]", href: "projects/wrong-order.html", year: "2025" },
      { title: "carnisse in flux", href: "projects/carnisse-in-flux.html", year: "2024" },
      { title: "it's fine really, silly me!", href: "projects/its-fine-really-silly-me.html", year: "2025" },
      { title: "bingo machine", href: "projects/bingo-machine.html", year: "2024" },
      { title: "belfast, oppressed", href: "projects/belfast-oppressed.html", year: "2022" },
      { title: "spend the night with me", href: "projects/spend-the-night-with-me.html", year: "2020" },
    ],
  };

  // plain (non-dropdown) links that just need their href set relative to
  // the current page's depth, plus a "current" highlight when active
  var PLAIN_LINKS = [
    { attr: 'data-store-link', href: 'store.html' },
    { attr: 'data-blog-link', href: 'blog.html' },
  ];

  function populateRibbons() {
    // Cloudflare's static asset serving strips ".html" from URLs
    // (info.html -> /info), so re-add it before comparing against SECTIONS/
    // PLAIN_LINKS hrefs, which always keep the extension.
    var currentFile = location.pathname.split('/').pop() || 'index.html';
    if (currentFile && !/\.html$/.test(currentFile)) currentFile += '.html';

    var brand = document.querySelector('.ribbon-brand');
    if (brand) brand.setAttribute('href', BASE + 'index.html');

    PLAIN_LINKS.forEach(function (link) {
      var el = document.querySelector('[' + link.attr + ']');
      if (!el) return;
      el.setAttribute('href', BASE + link.href);
      if (currentFile === link.href) el.classList.add('current');
    });

    Object.keys(SECTIONS).forEach(function (key) {
      var panel = document.getElementById('panel-' + key);
      if (!panel) return;

      var list = document.createElement('ul');
      var entries = SECTIONS[key];
      var hasCurrent = false;

      if (entries.length === 0) {
        var empty = document.createElement('li');
        empty.className = 'empty';
        empty.textContent = 'coming soon';
        list.appendChild(empty);
      } else {
        entries.forEach(function (entry) {
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.href = BASE + entry.href;
          a.appendChild(document.createTextNode(entry.title));
          if (entry.year) {
            var yearSpan = document.createElement('span');
            yearSpan.className = 'year';
            yearSpan.textContent = entry.year;
            a.appendChild(yearSpan);
          }
          var entryFile = entry.href.split('#')[0].split('/').pop();
          if (entryFile === currentFile) {
            a.classList.add('current');
            hasCurrent = true;
          }
          li.appendChild(a);
          list.appendChild(li);
        });
      }

      panel.appendChild(list);
      if (hasCurrent) {
        var trigger = document.querySelector('[data-section="' + key + '"]');
        if (trigger) trigger.classList.add('current');
      }
    });

    document.querySelectorAll('.ribbon-trigger[data-section]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        // stop this click from also reaching the "click outside closes it"
        // listener below — on some touch browsers that could otherwise
        // fire on the same tap and immediately re-close the panel
        e.stopPropagation();
        var ribbon = btn.closest('.ribbon');
        var isOpen = ribbon.classList.contains('open');
        document.querySelectorAll('.ribbon.open').forEach(function (r) {
          r.classList.remove('open');
        });
        if (!isOpen) ribbon.classList.add('open');
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.ribbon')) {
        document.querySelectorAll('.ribbon.open').forEach(function (r) {
          r.classList.remove('open');
        });
      }
    });
  }

  // Makes a .filmstrip gallery loop infinitely by cloning a small buffer
  // of frames at each end and jumping scrollLeft by one gallery-width
  // once the user scrolls into that buffer. Desktop/mouse also gets a
  // slow ambient auto-drift.
  //
  // Touch (phone and tablet) gets the same loop, but the correction is
  // debounced to only run once scrolling has fully settled — no active
  // finger, no momentum still coasting — instead of on every 'scroll'
  // event. That timing is the whole fix for the jitter reported earlier:
  // while a finger is dragging, or the browser is still running
  // momentum/inertia after release, it owns an internal touch-tracking
  // state tied to scrollLeft, and ANY programmatic scrollLeft change
  // during that window fights it, no matter how carefully timed.
  // Waiting until scrolling is provably idle sidesteps that entirely —
  // there's nothing left to fight. Touch also skips autoplay (nothing
  // to fight there either, but no reason to add it back) and uses a
  // smaller clone buffer, since it only needs to cover a single swipe's
  // worth of distance rather than a continuously-running auto-drift.
  function loopifyFilmstrip(strip) {
    var frames = Array.prototype.slice.call(strip.children);
    var n = frames.length;
    if (n < 3) return;

    var coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

    function widthOf(nodes) {
      var gap = parseFloat(getComputedStyle(strip).gap) || 0;
      return nodes.reduce(function (sum, el) {
        return sum + el.getBoundingClientRect().width + gap;
      }, 0);
    }

    function makeClone(el) {
      var clone = el.cloneNode(true);
      var img = clone.querySelector('img');
      if (img) img.removeAttribute('loading'); // load buffer clones eagerly for accurate widths
      return clone;
    }

    // wrap just the strip (not the "N images" label above it) so the
    // arrow buttons can be centered on the image row specifically
    var wrap = document.createElement('div');
    wrap.className = 'filmstrip-wrap';
    strip.parentNode.insertBefore(wrap, strip);
    wrap.appendChild(strip);

    var prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'filmstrip-arrow filmstrip-arrow-prev';
    prevBtn.setAttribute('aria-label', 'Previous images');
    prevBtn.textContent = '‹';
    var nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'filmstrip-arrow filmstrip-arrow-next';
    nextBtn.setAttribute('aria-label', 'Next images');
    nextBtn.textContent = '›';
    wrap.appendChild(prevBtn);
    wrap.appendChild(nextBtn);

    // Pause state used by the arrow buttons (mouse-only — they're hidden
    // on touch devices via the pointer:coarse CSS rule).
    var paused = false;
    var resumeTimer = null;
    function pauseFor(ms) {
      paused = true;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () { paused = false; }, ms);
    }

    // step by ~1.5 images per click, not a big page-sized jump
    function stepWidth() {
      var avg = widthOf(frames) / frames.length;
      return avg * 1.5;
    }
    prevBtn.addEventListener('click', function () {
      pauseFor(1200);
      strip.scrollBy({ left: -stepWidth(), behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', function () {
      pauseFor(1200);
      strip.scrollBy({ left: stepWidth(), behavior: 'smooth' });
    });

    var bufferCount = coarsePointer ? Math.min(n, 4) : Math.min(n, 8);
    var tailClones = frames.slice(-bufferCount).map(makeClone);
    var headClones = frames.slice(0, bufferCount).map(makeClone);
    tailClones.forEach(function (c) { strip.insertBefore(c, strip.firstChild); });
    headClones.forEach(function (c) { strip.appendChild(c); });

    function init() {
      var leadWidth = widthOf(tailClones);
      var originalWidth = widthOf(frames);
      if (!originalWidth) return;

      strip.scrollLeft = leadWidth;

      // Looping (instead of a single if/else if) fully normalizes the
      // position in one pass no matter how far out of range a single
      // scroll step landed.
      function correct() {
        while (strip.scrollLeft < leadWidth - originalWidth + 8) {
          strip.scrollLeft += originalWidth;
        }
        while (strip.scrollLeft > leadWidth + originalWidth - 8) {
          strip.scrollLeft -= originalWidth;
        }
      }

      if (coarsePointer) {
        var settleTimer = null;
        strip.addEventListener('scroll', function () {
          clearTimeout(settleTimer);
          settleTimer = setTimeout(correct, 200);
        });
        return;
      }

      // Desktop/mouse: correct immediately on every scroll event — safe
      // since there's no touch gesture to fight, and autoplay needs it
      // to keep drifting smoothly through the loop without waiting.
      strip.addEventListener('scroll', correct);

      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduceMotion) {
        var hovering = false;
        strip.addEventListener('pointerenter', function () { hovering = true; });
        strip.addEventListener('pointerleave', function () { hovering = false; });
        var AUTO_SPEED = 0.35; // px per animation frame — a slow, ambient drift
        (function tick() {
          if (!paused && !hovering) strip.scrollLeft += AUTO_SPEED;
          requestAnimationFrame(tick);
        })();
      }
    }

    var toWaitFor = tailClones.concat(headClones)
      .map(function (c) { return c.querySelector('img'); })
      .filter(Boolean);
    var remaining = toWaitFor.length;
    if (remaining === 0) { init(); return; }
    toWaitFor.forEach(function (img) {
      if (img.complete) {
        remaining--;
        if (remaining === 0) init();
      } else {
        img.addEventListener('load', function () {
          remaining--;
          if (remaining === 0) init();
        }, { once: true });
      }
    });
  }

  // Click/tap any gallery image to view it enlarged, with prev/next
  // (desktop) or swipe (touch) to browse the rest of that project's photos.
  // Uses event delegation on the filmstrip rather than binding per-image
  // click handlers, since loopifyFilmstrip() clones each image 2-3x in the
  // DOM for the infinite-scroll illusion — direct handlers would only
  // cover the original images, missing most of what's visible while
  // actively scrolling.
  function initGalleryLightbox() {
    var filmstrips = document.querySelectorAll('.gallery .filmstrip');
    if (!filmstrips.length) return;

    var uniqueSrcs = [];
    filmstrips.forEach(function (strip) {
      Array.prototype.forEach.call(strip.querySelectorAll('img'), function (img) {
        if (uniqueSrcs.indexOf(img.src) === -1) uniqueSrcs.push(img.src);
      });
    });
    if (!uniqueSrcs.length) return;

    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Close">&times;</button>' +
      '<button type="button" class="lightbox-arrow lightbox-prev" aria-label="Previous image">&larr;</button>' +
      '<img src="" alt="">' +
      '<button type="button" class="lightbox-arrow lightbox-next" aria-label="Next image">&rarr;</button>';
    document.body.appendChild(overlay);

    var imgEl = overlay.querySelector('img');
    var closeBtn = overlay.querySelector('.lightbox-close');
    var prevBtn = overlay.querySelector('.lightbox-prev');
    var nextBtn = overlay.querySelector('.lightbox-next');
    var current = 0;

    function show(i) {
      current = (i + uniqueSrcs.length) % uniqueSrcs.length;
      imgEl.src = uniqueSrcs[current];
    }
    function openAt(i) {
      show(i);
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    filmstrips.forEach(function (strip) {
      strip.addEventListener('click', function (e) {
        var img = e.target.closest('img');
        if (!img) return;
        var idx = uniqueSrcs.indexOf(img.src);
        if (idx === -1) return;
        openAt(idx);
      });
    });
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', function () { show(current - 1); });
    nextBtn.addEventListener('click', function () { show(current + 1); });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });

    // Touch swipe to browse — arrows are hidden on touch devices
    // (pointer:coarse, see site.css) in favor of swiping the image
    // itself, same gesture as the gallery filmstrip.
    var touchStartX = null, touchStartY = null;
    overlay.addEventListener('touchstart', function (e) {
      var t = e.changedTouches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    }, { passive: true });
    overlay.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - touchStartX;
      var dy = t.clientY - touchStartY;
      touchStartX = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        show(current + (dx < 0 ? 1 : -1));
      }
    });
  }

  // Injects the quick "say hello" contact modal (opened from "contact"
  // inside the "more" ribbon-bottom dropdown, present on every page) and
  // wires it up to Web3Forms — same backend/access key as the old full
  // form on info.html, just a faster path to it: To/From/Message stacked,
  // one send action, no page nav.
  function initContactModal() {
    var trigger = document.querySelector('[data-contact-trigger]');
    if (!trigger) return;

    var overlay = document.createElement('div');
    overlay.className = 'contact-modal-overlay';
    overlay.innerHTML =
      '<div class="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contactModalTitle">' +
        '<button type="button" class="contact-modal-close" aria-label="Close">&times;</button>' +
        '<h2 id="contactModalTitle">say hello</h2>' +
        '<form id="quickContactForm" action="https://api.web3forms.com/submit" method="POST">' +
          '<input type="hidden" name="access_key" value="6c272ff5-262f-418b-9d98-1b1960402820">' +
          '<input type="hidden" name="subject" value="New message from omidkheirabadi.com">' +
          '<input type="checkbox" name="botcheck" style="display:none;" tabindex="-1" autocomplete="off">' +
          '<div class="qc-row"><span class="qc-label">To:</span><span class="qc-value">Omid Kheirabadi</span></div>' +
          '<div class="qc-row"><label class="qc-label" for="qc-email">From:</label>' +
            '<input class="qc-input" type="email" id="qc-email" name="email" placeholder="your email address" required></div>' +
          '<label class="qc-message-label" for="qc-message">Message:</label>' +
          '<textarea id="qc-message" name="message" required placeholder="Say hello..."></textarea>' +
          '<p class="form-note" id="qcFormNote" style="display:none;"></p>' +
          '<div class="qc-actions">' +
            '<button type="submit" class="qc-send">Send Email</button>' +
            '<button type="button" class="qc-cancel">Cancel</button>' +
          '</div>' +
        '</form>' +
      '</div>';
    document.body.appendChild(overlay);

    var closeBtn = overlay.querySelector('.contact-modal-close');
    var cancelBtn = overlay.querySelector('.qc-cancel');
    var emailField = overlay.querySelector('#qc-email');
    var form = overlay.querySelector('#quickContactForm');
    var formNote = overlay.querySelector('#qcFormNote');

    function openModal() {
      // trigger lives inside the "more" ribbon-bottom dropdown now — close
      // it so it's not still visibly open behind the modal
      document.querySelectorAll('.ribbon.open').forEach(function (r) { r.classList.remove('open'); });
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { emailField.focus(); }, 260);
    }
    function closeModal() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    trigger.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    function submitPayload(payload) {
      return fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      }).then(function (res) { return res.json(); }).catch(function () { return { success: false }; });
    }
    function wait(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('.qc-send');
      var payload = Object.fromEntries(new FormData(form));

      btn.disabled = true;
      btn.classList.add('sending');
      formNote.classList.remove('show', 'success', 'error');

      var dots = 0;
      var dotTimer = setInterval(function () {
        dots = (dots % 3) + 1;
        btn.textContent = 'Sending' + '.'.repeat(dots);
      }, 350);

      Promise.all([submitPayload(payload), wait(1200)]).then(function (results) {
        var data = results[0];
        clearInterval(dotTimer);
        btn.disabled = false;
        btn.classList.remove('sending');
        formNote.style.display = 'block';

        if (data.success) {
          btn.textContent = 'Sent ✓';
          btn.classList.add('sent');
          formNote.classList.add('success');
          formNote.textContent = "Thank you — your message is on its way. I'll get back to you soon.";
          form.reset();
          setTimeout(closeModal, 1600);
          setTimeout(function () {
            btn.classList.remove('sent');
            btn.textContent = 'Send Email';
          }, 1800);
        } else {
          btn.textContent = 'Send Email';
          formNote.classList.add('error');
          formNote.textContent = 'Something went wrong — please try again, or email directly.';
        }
        requestAnimationFrame(function () { formNote.classList.add('show'); });
      });
    });
  }

  // The standalone info.html page is gone — the bio text now lives in a
  // popup, opened from "info" inside the "more" ribbon-bottom dropdown,
  // present on every page (merged there alongside announcements/contact
  // per explicit request). The "omid kheirabadi" brand text up top is
  // just the plain link back to index.html it always was — no special
  // click handling on it, on any page including the homepage.
  function initInfoModal() {
    var trigger = document.querySelector('[data-info-trigger]');
    if (!trigger) return;

    var overlay = document.createElement('div');
    overlay.className = 'info-modal-overlay';
    overlay.innerHTML =
      '<div class="info-modal" role="dialog" aria-modal="true" aria-labelledby="infoModalTitle">' +
        '<button type="button" class="info-modal-close" aria-label="Close">&times;</button>' +
        '<h2 id="infoModalTitle">info</h2>' +
        '<p>I\'m Omid Kheirabadi. I lived most of my life in Tehran and now live and work in Rotterdam. I make performance work and I am trained as an interior architect; both practices shape how I think about space, power, and the ways we live together. I am interested in the mechanisms that sustain global inequality, borders, and Western dominance, and in searching&mdash;even if only temporarily&mdash;for other ways people might exist together. My work moves between performance, participatory workshops, happenings, installations, and is almost always built around the active participation.</p>' +
        '<p>After completing my MFA in Artistic Research at the Royal Academy of Art in The Hague (2022), I have spent the last few years developing what I call performance sessions, inspired by Augusto Boal\'s Theatre of the Oppressed and the idea of arte útil. Art as something capable of producing real transformations in the world. Through the Performative Interventions program at the Zurich University of the Arts (ZHdK), I further explored the relationship between performance and resistance to global capitalism. During a four-month residency at the Goethe-Institut Rotterdam, I continued refining this practice, bringing together improvisation, collective creation, and open dialogue into site-responsive works shaped by the people involved and the specific places in which they unfold.</p>' +
        '<p>My background in architecture continues to influence how I think about performance. During my MA in Interior Architecture at the Maastricht Academy of Architecture (2017&ndash;2019), I became interested in architecture and its representation as instruments of power, and in how spaces quietly instruct our behaviours. In my performance sessions, I often work against these invisible instructions, exploring how even small shifts in the use of a space can produce different relationships between people.</p>' +
        '<p>My work has been presented through festivals, exhibitions, residencies, and public spaces in Amsterdam, Berlin, Istanbul, Utrecht, Leuven, Belfast, The Hague, Maastricht, Sierre, and Rotterdam. I am currently based at <a href="https://timewindow.nl/" target="_blank" rel="noopener">TimeWindow</a> in Rotterdam, continuing to work between performance, spatial practice, and participation. Through these practices, I create situations where people can question what feels inevitable, rehearse other possibilities, and experience what I have come to call "rehearsals of resistance."</p>' +
      '</div>';
    document.body.appendChild(overlay);

    var closeBtn = overlay.querySelector('.info-modal-close');

    function openModal() {
      // trigger lives inside the "more" ribbon-bottom dropdown — close it
      // so it's not still visibly open behind the modal
      document.querySelectorAll('.ribbon.open').forEach(function (r) { r.classList.remove('open'); });
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    trigger.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });
  }

  // announcements.html was removed the same way info.html was — the list
  // now lives in a popup, opened from "announcements" inside the "more"
  // dropdown. Kept as data + DOM-building (rather than one big innerHTML
  // string like the info modal) since there are 20 entries with images —
  // building nodes and setting textContent avoids having to hand-escape
  // quotes/apostrophes across that much text.
  var ANNOUNCEMENTS = [
    { slug: 'kabk-guest-teacher', ext: 'jpg', title: 'Guest Teaching at Royal Academy of Art (KABK)', when: 'October 2025 – June 2026', body: [
      'I am happy to share that I am joining the Graphic Design Bachelor at the Royal Academy of Art (KABK) in The Hague as a guest teacher, leading a course on presentation skills as part of the Design Bundle for first-year students, running from October to December 2025 and again from May to June 2026.'
    ] },
    { slug: 'rietveld-guest-teacher', ext: 'jpg', title: 'Guest Teaching at Gerrit Rietveld Academie', when: '2025–2026', body: [
      'I am teaching in the Fine Arts Bachelor at the Gerrit Rietveld Academie in Amsterdam, now in its third year running an intensive performance workshop for second-year students, focused on improvised, collective concept development. The next edition takes place in May 2026.'
    ] },
    { slug: 'tu-berlin-workshop', ext: 'png', title: 'Workshop Facilitator at TU Berlin', when: 'June 2026', body: [
      'In June 2026 I will lead a two-day performance workshop at TU Berlin, as part of the academy-wide course "Art & Science" led by Prof. Vanessa Schaller.'
    ] },
    { slug: 'summer-residency-in-istanbul', ext: 'jpg', title: 'Summer Residency in Istanbul', when: 'August 2025', body: [
      'With great pleasure, I am participating in an intensive one week collaborative project at Saye Collective in Istanbul in August 2025.'
    ] },
    { slug: 'eendracht-festival', ext: 'png', title: 'EENDRACHT FESTIVAL', when: '17 July 2025', body: [
      'On 17th of July, 2025, I will be showing "Radical Meditation" at Eendracht festival in Rotterdam. Radical Meditation is an immersive performance that emerged from the Experiential Learning program at Timewindow (Marie Louise), and was first shown in November 2024. The work satirically critiques the commodification of mindfulness, delivered by Radical Mindfulness Corporation, it blends corporate structures with spiritual practices, offering participants a transformative experience that challenges traditional notions of personal growth.'
    ] },
    { slug: 'performance-session-at-dokhuis', ext: 'jpeg', title: 'Performance Session at Dokhuis', when: '9 June 2025, 19:30–21:00', body: [
      'How do we begin a conversation with someone we don\'t know? Can a brief encounter become a space of real connection? In this participatory performance session, Omid Kheirabadi invites you to explore the quality of dialogue through movement, presence, and collective creation. You won\'t be watching from the sidelines, as this is a shared experiment in performing together, with all the openness, awkwardness, and unexpected intimacy that can bring.',
      'Through movement, improvisation, and conversation, we\'ll explore the dynamics of attention, presence, and connection. Omid\'s practice creates temporary spaces where people come together to move, speak, and improvise. These collective actions serve as a way to investigate how we relate to one another with the hope that something meaningful will arise among strangers.'
    ] },
    { slug: 'iv-grant-cbk-2025', ext: 'png', title: 'I&V GRANT CBK 2025', when: 'September–November 2025', body: [
      'I am grateful to receive the "Impulse en Verdieping" grant from CBK Rotterdam for the upcoming video project "Whose street is this? decolonization of an ordinary neighborhood as common space" taking place from September till November 2025.'
    ] },
    { slug: 'art-rotterdam-exhibition', ext: 'png', title: 'ART Rotterdam Exhibition', when: '28–30 March', body: [
      'I will be showing "Carnisse in Flux" at ART Rotterdam from 28th to 30th of March. This show is part of Prospects 2025 group exhibition organized by Mondriaan Fonds.'
    ] },
    { slug: 'the-end-has-no-end-performance-festival', ext: 'jpg', title: 'The End Has No End Performance Festival', when: '7–9 March, TimeWindow', body: [
      'From March 7 – 9, TimeWindow I will be performing at The End Has No End, a ritualistic closing in the shape of a 3-day festival marking the transformation of our community. As we reach the end of our subsidy period, we come together in a powerful moment of collective farewell—grieving what is ending while celebrating all that we have built. Through performances of over 30 artists, as well as shared experiences, and artistic expressions, this festival is an archive of what we cherish. Though this chapter closes, the knowledge, relationships, and creative energy cultivated over the years will continue to shape new futures.'
    ] },
    { slug: 'marie-louise-artist-residency', ext: 'jpg', title: 'Marie-Louise Artist Residency', when: '30 November 2024', body: [
      'After one week of intense residency, I will be showcasing the result of this period on 30th of November 2024. Curated and organized by Marta Wörner Sarabia, in consultation with Aubane Berthommé Martinez and Lieve Fikkers (WEEF Collective), the theme of this residency is Radical Mindfulness. To explore this topic, I was invited to be part of this group of fascinating artists whose practices reflect and interrogate this concept.'
    ] },
    { slug: 'graw-2024', ext: 'jpg', title: 'GRAW 2024', when: '21–22 September, TimeWindow studio', body: [
      'I will be showing some test works for my upcoming exhibition at ART Rotterdam, in my studio space in TimeWindow. Join me and other 12 creatives from our community on the 21st and 22nd of September to experience it all. We are open from 11:00 to 22:15 on Saturday and from 11:00 to 17:00 on Sunday.'
    ] },
    { slug: 'praktijk-bijdrage-grant-cbk-2024', ext: 'png', title: 'Praktijk Bijdrage GRANT CBK 2024', when: '2024', body: [
      'CBK has generously supported my current project "carnisse in Flux" with a one-time contribution of Praktijk Bijdrage. In collaboration with Shardenia Felicia, we are going to explore Rotterdam South, and specially the Carnisse neighborhood and the state of change it is going through due to the ongoing gentrification.'
    ] },
    { slug: 'artist-residency-in-switzerland', ext: 'png', title: 'Artist Residency in Switzerland', when: 'February–March 2024', body: [
      'It\'s an honor to announce that I have been selected for a six-week artist residency at Fondation du Château Mercier in Sierre, Switzerland in February and March 2024.'
    ] },
    { slug: 'performance-at-cafe-theater-festival-2024', ext: 'png', title: 'Performance at Cafe Theater Festival 2024', when: '22–23 March, Café Pret, Rotterdam Zuid', body: [
      'We\'ve been selected to present our new performance at Café Pret in Rotterdam Zuid as part of this year\'s Café Theater Festival. Taking place on March 22 & 23, the work is a collaboration between Isha van der Burg and Omid Kheirabadi—a layered, humorous exploration of two neighbors making a performance about two neighbors. What starts as playful meta-theatre spirals into a surreal investigation featuring Marx, a possibly fictional thinker named Gürt Woldertz (spelled wrong on purpose), and the unresolved mystery of basement defecation. No reservation needed—just drop by and watch it unfold.'
    ] },
    { slug: 'new-resident-of-timewindow', ext: 'gif', title: 'New Resident of TimeWindow', when: 'February 2024', body: [
      'I am honored to announce that as of February 2024, I have become a new member and resident at TimeWindow creative community in Rotterdam.'
    ] },
    { slug: 'artist-residency-at-goethe-institute', ext: 'png', title: 'Artist residency at Goethe Institute', when: '1 September – 20 December 2023', body: [
      'I am glad to announce that my research project "Happening to One Another" has been accepted to be part of the research and artist residency program at Goethe Institute in Rotterdam from the 1st of September until the 20th of December 2023.'
    ] },
    { slug: 'artist-start-grant', ext: 'png', title: 'Artist Start Grant', when: '2023', body: [
      'I am honoured to receive a one-year grant from Mondriaan Fonds starting from 2023. I will be showcasing one project from this period in the Prospects exhibition in March 2025.'
    ] },
    { slug: 'open-call', ext: 'jpg', title: 'Open Call', when: 'September 2023', body: [
      'I am looking for a few performance enthusiasts! For my project "Happening to One Another" I need some people who would like to be part of this artistic research and participate in four improvised performance sessions once a week in September 2023.'
    ] },
    { slug: 'oo-grant-cbk-2023', ext: 'jpg', title: 'O&O Grant CBK 2023', when: '2023', body: [
      'Honored to receive the Research and Deepening Grant from CBK Rotterdam for the research project "Happening to one another: a study of performance art as a form of resistance."'
    ] },
    { slug: 'delft-fringe-festival-2023', ext: 'jpg', title: 'Delft Fringe Festival 2023', when: '2023', body: [
      '\'alive & unborn\' is a dark satirical performance reflecting on the injustices created by years of the racist capitalist system, colonialism and slavery, and the demons of credit and debt. What\'s hope and how much of it is left for us?'
    ] },
    { slug: 'momo-festival-2023', ext: 'jpg', title: 'MOMO festival 2023', when: '2023', body: [
      'Inburgered (Integrated) is a performance about the struggles of outsiders who try to integrate as "Dutch" citizens. Omid turns his focus toward Dutch society from his perspective of living in the Netherlands as an artist, performer, and researcher based in Rotterdam in this performance.'
    ] },
    { slug: 'creative-course-at-dakendagen-festival-2023', ext: 'jpg', title: 'Creative Course at Dakendagen Festival 2023', when: '2023', body: [
      'One day performance workshop based on my two-week residency in Belfast, organized in collaboration with Dakendagen in two different locations in Rotterdam.'
    ] },
    { slug: 'artist-residency-in-belfast', ext: 'png', title: 'Artist Residency in Belfast', when: 'August 2022', body: [
      'I have been accepted to participate in the European Creative Rooftop Networks for exchange between Rotterdam, Belfast, and Nicosia for a two-week artist residency in Northern Ireland, a month of research, and to organize a creative workshop upon my return.'
    ] }
  ];

  function initAnnouncementsModal() {
    var trigger = document.querySelector('[data-announcements-trigger]');
    if (!trigger) return;

    var overlay = document.createElement('div');
    overlay.className = 'announcements-modal-overlay';

    var modal = document.createElement('div');
    modal.className = 'announcements-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'announcementsModalTitle');

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'announcements-modal-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '×';
    modal.appendChild(closeBtn);

    var h2 = document.createElement('h2');
    h2.id = 'announcementsModalTitle';
    h2.textContent = 'announcements';
    modal.appendChild(h2);

    var list = document.createElement('div');
    list.className = 'announcements-modal-list';
    var cards = [];

    // Card per announcement: image with a translucent caption band over
    // its lower edge carrying the title + date, and the body text
    // collapsed behind a "read more" toggle — so each item reads as its
    // own piece instead of blurring into a long run-on list.
    ANNOUNCEMENTS.forEach(function (item, i) {
      var article = document.createElement('article');
      article.className = 'announcement';

      if (item.slug) {
        var figure = document.createElement('div');
        figure.className = 'announcement-figure';
        var img = document.createElement('img');
        img.className = 'announcement-thumb';
        img.src = BASE + 'assets/images/announcements/' + item.slug + '.' + item.ext;
        img.alt = '';
        img.loading = 'lazy';
        figure.appendChild(img);
        article.appendChild(figure);
      }

      var caption = document.createElement('div');
      caption.className = 'announcement-caption';
      // inner wrapper so the whole title block can be slid from the middle
      // of the image to its foot as one piece when the card opens
      var capInner = document.createElement('div');
      capInner.className = 'announcement-caption-inner';
      caption.appendChild(capInner);

      var h3 = document.createElement('h3');
      h3.textContent = item.title;
      capInner.appendChild(h3);

      if (item.when) {
        var when = document.createElement('span');
        when.className = 'when';
        when.textContent = item.when;
        capInner.appendChild(when);
      }

      var bodyId = 'announcementBody' + i;
      var body = document.createElement('div');
      body.className = 'announcement-body';
      body.id = bodyId;
      item.body.forEach(function (para) {
        var p = document.createElement('p');
        p.textContent = para;
        body.appendChild(p);
      });

      var moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'announcement-more';
      moreBtn.textContent = 'Read More';
      moreBtn.setAttribute('aria-expanded', 'false');
      moreBtn.setAttribute('aria-controls', bodyId);
      capInner.appendChild(moreBtn);

      function toggle() {
        var open = article.classList.toggle('open');
        moreBtn.textContent = open ? 'Close' : 'Read More';
        moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      // The whole tile is clickable/tappable, not just the button. The
      // listener sits on the caption (which covers the image) rather than
      // the article, so clicks in the expanded text below don't collapse
      // the card mid-read. The button lives inside the caption, so its
      // clicks bubble here — one handler covers both, no double toggle.
      caption.addEventListener('click', toggle);

      // the caption overlays the bottom of the image (see site.css), so it
      // goes inside the figure when there is one
      if (figure) figure.appendChild(caption);
      else article.appendChild(caption);
      article.appendChild(body);

      cards.push(article);
    });

    // Masonry wall built from real columns (see site.css). Cards go in
    // round-robin — 1st to the left column, 2nd to the middle, 3rd to the
    // right, 4th back to the left — so reading across the top of the wall
    // runs newest to oldest left to right, while each column below still
    // packs tight against the card above it. CSS multi-column would fill
    // one column top-to-bottom first, which runs the order down each
    // column instead.
    function layoutColumns() {
      // a hidden modal measures 0 wide, which would lock the wall to a
      // single column — bail and let the next call (on open) do the work
      var w = list.clientWidth || modal.clientWidth;
      if (!w) return;
      var n = w >= 820 ? 3 : (w >= 520 ? 2 : 1);
      if (list.dataset.cols === String(n)) return;
      list.dataset.cols = String(n);
      list.textContent = '';
      var cols = [];
      for (var c = 0; c < n; c++) {
        var col = document.createElement('div');
        col.className = 'announcement-column';
        list.appendChild(col);
        cols.push(col);
      }
      cards.forEach(function (card, idx) { cols[idx % n].appendChild(card); });
    }

    modal.appendChild(list);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    layoutColumns();

    // Watch the list itself rather than the window: it catches every way
    // the available width can change (window resize, zoom, scrollbar
    // appearing) and fires even when no window resize event is dispatched.
    var relayoutTimer = null;
    function scheduleRelayout() {
      clearTimeout(relayoutTimer);
      relayoutTimer = setTimeout(layoutColumns, 150);
    }
    if (window.ResizeObserver) new ResizeObserver(scheduleRelayout).observe(list);
    else window.addEventListener('resize', scheduleRelayout);

    function openModal() {
      document.querySelectorAll('.ribbon.open').forEach(function (r) { r.classList.remove('open'); });
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      layoutColumns(); // now that the modal has a width, build the wall
    }
    function closeModal() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    trigger.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    populateRibbons();
    document.querySelectorAll('.filmstrip').forEach(loopifyFilmstrip);
    initGalleryLightbox();
    initContactModal();
    initInfoModal();
    initAnnouncementsModal();
  });
})();
