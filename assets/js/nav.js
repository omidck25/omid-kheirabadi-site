// Shared sidebar nav, built the same way on every page.
// Each page sets `window.SITE_BASE` before including this script:
//   '' for pages at the site root, '../' for pages one folder deep (e.g. /projects/*.html).
(function () {
  var BASE = window.SITE_BASE || '';

  var SECTIONS = {
    projects: [
      { title: "it's fine really, silly me!", href: "projects/its-fine-really-silly-me.html", year: "2025" },
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
    announcements: [
      { title: "Summer Residency in Istanbul", href: "announcements.html#summer-residency-in-istanbul" },
      { title: "EENDRACHT FESTIVAL", href: "announcements.html#eendracht-festival" },
      { title: "Performance Session at Dokhuis", href: "announcements.html#performance-session-at-dokhuis" },
      { title: "I&V GRANT CBK 2025", href: "announcements.html#iv-grant-cbk-2025" },
      { title: "ART Rotterdam Exhibition", href: "announcements.html#art-rotterdam-exhibition" },
      { title: "The End Has No End Performance Festival", href: "announcements.html#the-end-has-no-end-performance-festival" },
      { title: "Marie-Louise Artist Residency", href: "announcements.html#marie-louise-artist-residency" },
      { title: "GRAW 2024", href: "announcements.html#graw-2024" },
      { title: "Praktijk Bijdrage GRANT CBK 2024", href: "announcements.html#praktijk-bijdrage-grant-cbk-2024" },
      { title: "Artist Residency in Switzerland", href: "announcements.html#artist-residency-in-switzerland" },
      { title: "Performance at Cafe Theater Festival 2024", href: "announcements.html#performance-at-cafe-theater-festival-2024" },
      { title: "New Resident of TimeWindow", href: "announcements.html#new-resident-of-timewindow" },
      { title: "Artist residency at Goethe Institute", href: "announcements.html#artist-residency-at-goethe-institute" },
      { title: "Artist Start Grant", href: "announcements.html#artist-start-grant" },
      { title: "Open Call", href: "announcements.html#open-call" },
      { title: "O&O Grant CBK 2023", href: "announcements.html#oo-grant-cbk-2023" },
      { title: "Delft Fringe Festival 2023", href: "announcements.html#delft-fringe-festival-2023" },
      { title: "MOMO festival 2023", href: "announcements.html#momo-festival-2023" },
      { title: "Creative Course at Dakendagen Festival 2023", href: "announcements.html#creative-course-at-dakendagen-festival-2023" },
      { title: "Artist Residency in Belfast", href: "announcements.html#artist-residency-in-belfast" },
    ],
  };

  // plain (non-dropdown) links that just need their href set relative to
  // the current page's depth, plus a "current" highlight when active
  var PLAIN_LINKS = [
    { attr: 'data-info-link', href: 'info.html' },
    { attr: 'data-store-link', href: 'store.html' },
    { attr: 'data-blog-link', href: 'blog.html' },
  ];

  function populateRibbons() {
    var currentFile = location.pathname.split('/').pop() || 'index.html';

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
  // once the buffer is crossed.
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

  document.addEventListener('DOMContentLoaded', function () {
    populateRibbons();
    document.querySelectorAll('.filmstrip').forEach(loopifyFilmstrip);
  });
})();
