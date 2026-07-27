// Shared sidebar nav, built the same way on every page.
// Each page sets `window.SITE_BASE` before including this script:
//   '' for pages at the site root, '../' for pages one folder deep (e.g. /projects/*.html).
(function () {
  var BASE = window.SITE_BASE || '';

  var SECTIONS = {
    projects: [
      { title: "it's fine really, silly me!", href: "projects/its-fine-really-silly-me.html", year: "2025" },
      { title: "radical meditation", href: "projects/radical-meditation.html", year: "2024" },
      { title: "carnisse in flux", href: "projects/carnisse-in-flux.html", year: "2024" },
      { title: "bingo machine", href: "projects/bingo-machine.html", year: "2024" },
      { title: "happening to one another", href: "projects/happening-to-one-another.html", year: "2023" },
      { title: "belfast, oppressed", href: "projects/belfast-oppressed.html", year: "2023" },
      { title: "inburgered", href: "projects/inburgered-integrated.html", year: "2023" },
      { title: "alive & unborn", href: "projects/alive-and-unborn.html", year: "2023" },
      { title: "you only exist on paper", href: "projects/you-only-exist-on-paper.html", year: "2021" },
      { title: "one day is too short...", href: "projects/one-day-is-too-short.html", year: "2022" },
      { title: "making art", href: "projects/making-art.html", year: "2020" },
      { title: "i'm free as a bird", href: "projects/i-am-free-as-a-bird.html", year: "2020" },
      { title: "spend the night with me", href: "projects/spend-the-night-with-me.html", year: "2020" },
      { title: "a tough soldier", href: "projects/a-tough-soldier.html", year: "2019" },
    ],
    happenings: [
      { title: "carnisse in flux", href: "projects/carnisse-in-flux.html", year: "2024" },
      { title: "it's fine really, silly me!", href: "projects/its-fine-really-silly-me.html", year: "2025" },
      { title: "bingo machine", href: "projects/bingo-machine.html", year: "2024" },
      { title: "happening to one another", href: "projects/happening-to-one-another.html", year: "2023" },
      { title: "belfast, oppressed", href: "projects/belfast-oppressed.html", year: "2023" },
      { title: "spend the night with me", href: "projects/spend-the-night-with-me.html", year: "2020" },
    ],
  };

  // plain (non-dropdown) links that just need their href set relative to
  // the current page's depth, plus a "current" highlight when active
  var PLAIN_LINKS = [
    { attr: 'data-announcements-link', href: 'announcements.html' },
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

    // "announcements" lives inside the "more" dropdown now (alongside
    // info/contact) rather than as its own ribbon item — if it's current,
    // reflect that on the "more" trigger too so it stays upright/highlighted
    // the same way any other current-page ribbon trigger does.
    var announcementsLink = document.querySelector('[data-announcements-link]');
    if (announcementsLink && announcementsLink.classList.contains('current')) {
      var moreTrigger = document.querySelector('[data-section="more"]');
      if (moreTrigger) moreTrigger.classList.add('current');
    }

    // Some pages are both a "project" and one of the curated "happenings"
    // (they share the same underlying project page — happenings is just a
    // subset of projects). Both the left (projects) and right (happenings)
    // ribbon triggers used to light up together on those pages. Happening
    // status now takes precedence: only the happenings trigger reacts,
    // projects stays black/unreacted, even though the page is technically
    // in both lists. (List-item highlighting inside each dropdown is left
    // alone — the page's title still shows as current in both lists, this
    // only changes which top-level trigger button gets the color.)
    var isHappening = SECTIONS.happenings.some(function (entry) {
      return entry.href.split('#')[0].split('/').pop() === currentFile;
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
      if (hasCurrent && !(key === 'projects' && isHappening)) {
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
        '<p>Omid Kheirabadi (b. 1992, Tehran) is a Rotterdam-based interdisciplinary performance artist and interior architect whose work critically examines societal structures, power dynamics, and collective agency within late-capitalist frameworks. His art challenges conventional narratives by exposing the oppressive mechanisms of global economic disparities, labor, legal systems, and Western hegemony while proposing alternative possibilities for coexistence and liberation. Omid\'s practice spans experimental performance, participatory workshops, and multimedia installations, all fostering dialogue and critical reflection. Over the past three years, he has developed performance sessions, inspired by Augusto Boal\'s Theatre of the Oppressed and the concept of arte útil. These participatory sessions break traditional performance boundaries by transforming audience members into collaborators, creating fluid spaces where hierarchies, power structures, and perceptions of space shift through collective action.</p>' +
        '<p>Projects such as Inburgered (MOMO Festival), Alive &amp; Unborn (Delft Fringe, 2023), Bingo Machine (B32, Maastricht, 2024), and Carnisse in Flux (2024) reflect his different approach to performance as a collaborative and transformative practice. During a four-month residency at the Goethe-Institut, Omid further refined his performance sessions, blending improvisation, collective creation, and critical dialogue into dynamic, site-specific works. Omid\'s dual expertise in interior architecture and artistic research informs his unique approach to space and performance, allowing him to craft experiences that challenge traditional spatial perceptions and roles. His academic background includes an MFA in Artistic Research from the Royal Academy of Art in The Hague (2022) and an MA in Interior Architecture from the Maastricht Academy of Architecture (2019).</p>' +
        '<p>His work has been showcased across Europe in exhibitions, festivals, and residencies, including Amsterdam, The Hague, Leuven, Utrecht, Belfast, Maastricht, and Rotterdam. In Zurich, at ZHdK\'s "Performative Interventions" program, he further explored the intersection of resistance against global capitalism and performance art, in an intensive artistic research seminar. Currently based at <a href="https://timewindow.nl/" target="_blank" rel="noopener">TimeWindow</a> in Rotterdam, Omid continues to push the boundaries of interdisciplinary practice, blending performance, spatial design, and participatory art to foster collective creativity and reimagine societal possibilities.</p>' +
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

  document.addEventListener('DOMContentLoaded', function () {
    populateRibbons();
    document.querySelectorAll('.filmstrip').forEach(loopifyFilmstrip);
    initContactModal();
    initInfoModal();
  });
})();
