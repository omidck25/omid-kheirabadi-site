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
    { attr: 'data-info-link', href: 'info.html' },
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

  // Makes a .filmstrip gallery scroll endlessly in both directions by
  // cloning a buffer of frames on each end and silently wrapping scrollLeft
  // once the buffer is crossed. Also drives a slow automatic drift through
  // the images (paused while the mouse is over it, or briefly after a
  // manual arrow click) and adds prev/next arrow buttons, so browsing the
  // gallery doesn't depend on grabbing the (now hidden) scrollbar thumb.
  function loopifyFilmstrip(strip) {
    var frames = Array.prototype.slice.call(strip.children);
    var n = frames.length;
    if (n < 3) return;

    var bufferCount = Math.min(n, 6);
    var tailSource = frames.slice(-bufferCount); // clone these before the start
    var headSource = frames.slice(0, bufferCount); // clone these after the end

    function makeClone(el) {
      var clone = el.cloneNode(true);
      var img = clone.querySelector('img');
      if (img) img.removeAttribute('loading'); // load buffer clones eagerly for accurate widths
      return clone;
    }

    var tailClones = tailSource.map(makeClone);
    var headClones = headSource.map(makeClone);

    tailClones.forEach(function (c) { strip.insertBefore(c, strip.firstChild); });
    headClones.forEach(function (c) { strip.appendChild(c); });

    function widthOf(nodes) {
      var gap = parseFloat(getComputedStyle(strip).gap) || 0;
      return nodes.reduce(function (sum, el) {
        return sum + el.getBoundingClientRect().width + gap;
      }, 0);
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

    // Autoplay pauses on interaction and resumes after a delay. Touch
    // release specifically waits out a fixed window rather than resuming
    // instantly on pointerup — mobile browsers keep scrolling on their own
    // (momentum/inertia) for a while after the finger lifts, and autoplay
    // resuming immediately fought that momentum, which is what made touch
    // scrolling feel difficult and jittery.
    var hoveringMouse = false;
    var paused = false;
    var resumeTimer = null;
    function pauseFor(ms) {
      paused = true;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () { paused = false; }, ms);
    }

    // step by ~1.5 images per click, not a big page-sized jump — uses the
    // average width of the real (un-cloned) frames since they vary in size
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

    strip.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hoveringMouse = true; });
    strip.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hoveringMouse = false; });
    strip.addEventListener('pointerdown', function () {
      paused = true;
      clearTimeout(resumeTimer);
    });
    strip.addEventListener('pointerup', function (e) {
      if (e.pointerType === 'mouse') { paused = hoveringMouse; return; }
      pauseFor(1200); // let touch momentum scrolling settle first
    });
    strip.addEventListener('pointercancel', function (e) {
      if (e.pointerType === 'mouse') { paused = hoveringMouse; return; }
      pauseFor(1200);
    });

    function init() {
      var leadWidth = widthOf(tailClones);
      var originalWidth = widthOf(frames);
      if (!originalWidth) return;

      strip.scrollLeft = leadWidth;

      strip.addEventListener('scroll', function () {
        if (strip.scrollLeft < leadWidth - originalWidth + 8) {
          strip.scrollLeft += originalWidth;
        } else if (strip.scrollLeft > leadWidth + originalWidth - 8) {
          strip.scrollLeft -= originalWidth;
        }
      });

      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduceMotion) {
        var AUTO_SPEED = 0.35; // px per animation frame — a slow, ambient drift
        (function tick() {
          if (!paused && !hoveringMouse) strip.scrollLeft += AUTO_SPEED;
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

  // Injects the quick "say hello" contact modal (opened from the "contact"
  // ribbon trigger present on every page) and wires it up to Web3Forms —
  // same backend/access key as the full form on info.html, just a faster
  // path to it: To/From/Message stacked, one send action, no page nav.
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

  document.addEventListener('DOMContentLoaded', function () {
    populateRibbons();
    document.querySelectorAll('.filmstrip').forEach(loopifyFilmstrip);
    initContactModal();
  });
})();
