// Tag filter for blog.html: builds chips from each post's data-tags, supports ?tag=… links.
(function () {
  var list = document.getElementById('post-list');
  var bar = document.getElementById('tag-filter');
  var empty = document.getElementById('no-posts');
  if (!list || !bar) return;
  var posts = Array.prototype.slice.call(list.querySelectorAll('.post-item'));
  function tagsOf(p) {
    return (p.getAttribute('data-tags') || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean);
  }
  var counts = {};
  posts.forEach(function (p) { tagsOf(p).forEach(function (t) { counts[t] = (counts[t] || 0) + 1; }); });
  var tags = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); });
  if (!tags.length) return;

  var chips = [];
  function makeChip(label, value) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'tag-chip'; b.textContent = label;
    b.dataset.value = value;
    b.addEventListener('click', function () { apply(value, true); });
    bar.appendChild(b); chips.push(b);
  }
  makeChip('All', '');
  tags.forEach(function (t) { makeChip(t, t); });
  bar.hidden = false;

  function apply(tag, push) {
    if (tag && !counts[tag]) tag = '';
    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.value === tag)); });
    var shown = 0;
    posts.forEach(function (p) {
      var show = !tag || tagsOf(p).indexOf(tag) !== -1;
      p.hidden = !show; if (show) shown++;
    });
    if (empty) empty.hidden = shown > 0;
    if (push) {
      var url = tag ? '?tag=' + encodeURIComponent(tag) : location.pathname;
      history.replaceState(null, '', url);
    }
  }
  // Tag links inside the list filter in place instead of reloading.
  list.addEventListener('click', function (e) {
    var a = e.target.closest('a.tag');
    if (!a) return;
    var t = new URL(a.href).searchParams.get('tag');
    if (t) { e.preventDefault(); apply(t, true); }
  });
  apply(new URLSearchParams(location.search).get('tag') || '', false);
})();
