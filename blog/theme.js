// Dark/light toggle, same behaviour as the rest of the site.
(function () {
  var toggle = document.getElementById('theme-toggle');
  var root = document.documentElement;
  function sync() {
    var isDark = root.getAttribute('data-theme') === 'dark';
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  sync();
  toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    sync();
  });
})();
