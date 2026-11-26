// Shared behaviour for every page. Each feature is a no-op when its markup is absent.
(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Dark / light toggle ──
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    var sync = function () {
      var isDark = root.getAttribute('data-theme') === 'dark';
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    };
    sync();
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      sync();
    });
  }

  // ── Fade sections in as they scroll into view ──
  var revealEls = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ── "Show more" lists: <button data-expand="listId" data-visible="4"> ──
  document.querySelectorAll('[data-expand]').forEach(function (btn) {
    var list = document.getElementById(btn.getAttribute('data-expand'));
    if (!list) return;
    var visible = parseInt(btn.getAttribute('data-visible'), 10) || 4;
    var items = Array.prototype.slice.call(list.children);
    var extra = items.slice(visible);
    if (!extra.length) { btn.hidden = true; return; }
    var label = btn.querySelector('.btn-label');
    var moreText = 'Show ' + extra.length + ' more';
    var setState = function (open) {
      extra.forEach(function (li) { li.hidden = !open; });
      btn.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Show less' : moreText;
    };
    btn.hidden = false;
    setState(false);
    btn.addEventListener('click', function () {
      setState(btn.getAttribute('aria-expanded') !== 'true');
    });
  });

  // ── Filter chips: <button class="chip" data-filter="tag">, items carry data-tags="a b" ──
  var chips = document.querySelectorAll('.chip[data-filter]');
  if (chips.length) {
    var filterable = document.querySelectorAll('[data-tags]');
    var groups = document.querySelectorAll('[data-filter-group]');
    var applyFilter = function (tag) {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-filter') === tag)); });
      filterable.forEach(function (el) {
        var tags = el.getAttribute('data-tags').split(' ');
        el.hidden = !(tag === 'all' || tags.indexOf(tag) !== -1);
      });
      // Hide a group heading when none of its items match.
      groups.forEach(function (g) {
        var any = g.querySelector('[data-tags]:not([hidden])');
        g.hidden = !any;
      });
      var empty = document.getElementById('filter-empty');
      if (empty) empty.hidden = !!document.querySelector('[data-tags]:not([hidden])');
    };
    chips.forEach(function (c) {
      c.addEventListener('click', function () { applyFilter(c.getAttribute('data-filter')); });
    });
  }

  // ── Lightbox for images / videos: <button data-lightbox="src" data-caption="..."> ──
  var triggers = document.querySelectorAll('[data-lightbox]');
  if (triggers.length && typeof HTMLDialogElement === 'function') {
    var dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', 'Image viewer');
    dlg.innerHTML = '<div class="lightbox-inner"><button class="lightbox-close" type="button" aria-label="Close">×</button><div class="lightbox-media"></div><p class="lightbox-cap"></p></div>';
    document.body.appendChild(dlg);
    var media = dlg.querySelector('.lightbox-media');
    var cap = dlg.querySelector('.lightbox-cap');
    dlg.querySelector('.lightbox-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { media.innerHTML = ''; });
    triggers.forEach(function (t) {
      t.addEventListener('click', function () {
        var src = t.getAttribute('data-lightbox');
        var caption = t.getAttribute('data-caption') || '';
        var el;
        if (/\.mp4$/i.test(src)) {
          el = document.createElement('video');
          el.src = src; el.controls = true; el.playsInline = true; el.autoplay = true;
        } else {
          el = document.createElement('img');
          el.src = src; el.alt = caption;
        }
        media.appendChild(el);
        cap.textContent = caption;
        cap.hidden = !caption;
        dlg.showModal();
      });
    });
  }

  // ── Autoplaying thumbnail videos respect reduced motion ──
  if (reduceMotion) {
    document.querySelectorAll('video[autoplay]').forEach(function (v) { v.pause(); v.removeAttribute('autoplay'); });
  }
})();
