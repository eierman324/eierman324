// Picks an edition from #hash (or the referrer) and renders it.
// Without an edition the static home page in index.html stays as it is.
(function () {
  var S = window.SITE;
  var ids = S.editions.map(function (e) { return e.id; });
  window.EDITIONS = window.EDITIONS || {};

  window.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  // Deterministic pseudo-random numbers from a string, for waveforms, stats and so on.
  window.seeded = function (str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {
      h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
      return ((h >>> 0) % 10000) / 10000;
    };
  };

  window.projectsIn = function (group) {
    return S.projects.filter(function (p) { return p.group === group; });
  };

  window.editionsBar = function (current) {
    var items = [{ id: '', label: 'Default' }].concat(S.editions).map(function (e) {
      var href = e.id ? '#' + e.id : location.pathname;
      var cur = e.id === current ? ' aria-current="page"' : '';
      return '<a href="' + href + '"' + cur + '>' + esc(e.label) + '</a>';
    }).join('');
    return '<nav class="editions" aria-label="Other editions of this page"><p>This page has an edition for every place you might come from.</p><div>' + items + '</div></nav>';
  };

  function fromReferrer() {
    var host = '';
    try { host = new URL(document.referrer).hostname.replace(/^www\./, ''); } catch (e) { return null; }
    for (var i = 0; i < S.editions.length; i++) {
      var e = S.editions[i];
      for (var j = 0; j < e.hosts.length; j++) {
        if (host === e.hosts[j] || host.slice(-e.hosts[j].length - 1) === '.' + e.hosts[j]) return e.id;
      }
    }
    return null;
  }

  function current() {
    var h = location.hash.slice(1).toLowerCase();
    if (ids.indexOf(h) !== -1) return h;
    if (h === '') return fromReferrer();
    return null;
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  var shown = null;

  function show(id) {
    if (!id) {
      if (shown) location.reload();
      document.documentElement.classList.remove('edition-loading');
      return;
    }
    if (id === shown) return;
    var root = document.documentElement;
    root.classList.add('edition-loading');
    var ready = window.EDITIONS[id] ? Promise.resolve() : loadScript('editions/' + id + '.js');
    var css = document.getElementById('edition-css');
    if (!css) {
      css = document.createElement('link');
      css.rel = 'stylesheet'; css.id = 'edition-css';
      document.head.appendChild(css);
    }
    var cssReady = new Promise(function (resolve) { css.onload = resolve; css.onerror = resolve; });
    css.href = 'editions/' + id + '.css';
    var base = document.getElementById('home-css');
    if (base) base.disabled = true;

    Promise.all([ready, cssReady]).then(function () {
      // Drop the home palette so edition styles start clean.
      ['bg', 'surface', 'text', 'muted', 'accent', 'line'].forEach(function (k) { root.style.removeProperty('--' + k); });
      root.style.colorScheme = '';
      root.dataset.edition = id;
      document.title = S.name + ' (' + S.editions[ids.indexOf(id)].label + ' edition)';
      document.body.className = 'ed-' + id;
      document.body.innerHTML = window.EDITIONS[id].render(S) + editionsBar(id);
      if (window.EDITIONS[id].mount) window.EDITIONS[id].mount(document.body, S);
      window.scrollTo(0, 0);
      shown = id;
      root.classList.remove('edition-loading');
    }).catch(function () {
      root.classList.remove('edition-loading');
    });
  }

  window.addEventListener('hashchange', function () {
    var h = location.hash.slice(1).toLowerCase();
    // In-page anchors like #al-list are not editions; leave the page alone.
    if (h && ids.indexOf(h) === -1) return;
    show(current());
  });

  var first = current();
  if (first) {
    show(first);
  } else {
    document.documentElement.classList.remove('edition-loading');
    var slot = document.getElementById('editions-slot');
    if (slot) slot.innerHTML = editionsBar('');
  }
})();
