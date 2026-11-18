// Picks an edition from #hash (or the referrer) and renders it.
// Without an edition the static home page in index.html stays as it is.
(function () {
  // Bump this after changing files in editions/, so browsers fetch the new versions.
  var VERSION = '4';
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

  // ---- Profiles: name, handle and picture per platform ----------------------
  // Every avatar starts as the letter "e"; the picture is swapped in once it has
  // loaded live. Platforms without a picture use the GitHub one.
  //
  // GitHub and AniList are fetched live from the browser. The other platforms
  // block that, so they need a small server in between (see tools/profile-worker.js).
  // Put its address here once it runs; until then they use profiles.js, which
  // tools/update-profiles.py writes.
  var PROFILE_API = '';

  var GITHUB_USER = 'eierman324';
  var ANILIST_USER = 'eierman324';

  function snapshot(id) {
    var p = (window.PROFILES || {})[id] || {};
    return { name: p.name || null, handle: p.handle || null, avatar: p.avatar ? p.avatar + '?v=' + VERSION : null };
  }

  window.who = function (id) {
    var p = snapshot(id), g = snapshot('github');
    return { name: p.name || g.name || S.name, handle: p.handle || g.handle || S.handle };
  };

  window.avatar = function (id, cls) {
    return '<span class="' + cls + ' pfp-slot" data-pfp="' + id + '" aria-hidden="true">e</span>';
  };
  window.pname = function (id) { return '<span data-pname="' + id + '">' + esc(window.who(id).name) + '</span>'; };
  window.phandle = function (id) { return '<span data-phandle="' + id + '">' + esc(window.who(id).handle) + '</span>'; };

  var cache = {};

  function fetchJSON(url, opts) {
    return fetch(url, opts).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }

  function live(id) {
    if (id === 'github') {
      return fetchJSON('https://api.github.com/users/' + GITHUB_USER)
        .then(function (d) { return { name: d.name || d.login, handle: d.login, avatar: d.avatar_url + '&s=400' }; })
        .catch(function () { return { avatar: 'https://avatars.githubusercontent.com/' + GITHUB_USER + '?s=400' }; });
    }
    if (id === 'anilist') {
      return fetchJSON('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query: '{User(name:"' + ANILIST_USER + '"){name avatar{large}}}' })
      }).then(function (d) {
        var u = d.data.User, a = u.avatar && u.avatar.large;
        return { name: u.name, handle: u.name, avatar: a && !/\/default\.png$/.test(a) ? a : null };
      });
    }
    if (PROFILE_API) {
      return fetchJSON(PROFILE_API + '?p=' + encodeURIComponent(id));
    }
    return Promise.resolve(snapshot(id));
  }

  window.loadProfile = function (id) {
    if (!cache[id]) {
      cache[id] = live(id).catch(function () { return snapshot(id); }).then(function (p) {
        p = p || {};
        if (p.avatar || id === 'github') return p;
        // No picture on this platform: borrow the GitHub one.
        return window.loadProfile('github').then(function (g) { p.avatar = g.avatar; return p; });
      });
    }
    return cache[id];
  };

  function preload(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }

  window.hydrateProfiles = function (root) {
    var ids = {};
    root.querySelectorAll('[data-pfp],[data-pname],[data-phandle]').forEach(function (el) {
      ids[el.dataset.pfp || el.dataset.pname || el.dataset.phandle] = true;
    });
    Object.keys(ids).forEach(function (id) {
      window.loadProfile(id).then(function (p) {
        if (p.name) root.querySelectorAll('[data-pname="' + id + '"]').forEach(function (el) { el.textContent = p.name; });
        if (p.handle) root.querySelectorAll('[data-phandle="' + id + '"]').forEach(function (el) { el.textContent = p.handle; });
        if (!p.avatar) return;
        preload(p.avatar).then(function () {
          root.querySelectorAll('[data-pfp="' + id + '"]').forEach(function (slot) {
            if (slot.querySelector('img')) return;
            var img = document.createElement('img');
            img.src = p.avatar; img.alt = '';
            slot.insertBefore(img, slot.firstChild);
            slot.classList.add('has-pfp');
          });
        }).catch(function () { /* keep the "e" */ });
      });
    });
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
    var ready = window.EDITIONS[id] ? Promise.resolve() : loadScript('editions/' + id + '.js?v=' + VERSION);
    var css = document.getElementById('edition-css');
    if (!css) {
      css = document.createElement('link');
      css.rel = 'stylesheet'; css.id = 'edition-css';
      document.head.appendChild(css);
    }
    var cssReady = new Promise(function (resolve) { css.onload = resolve; css.onerror = resolve; });
    css.href = 'editions/' + id + '.css?v=' + VERSION;
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
      window.hydrateProfiles(document.body);
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
    window.hydrateProfiles(document.body);
  }
})();
