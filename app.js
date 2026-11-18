// Picks an edition from #hash (or the referrer) and renders it.
// Without an edition the static home page in index.html stays as it is.
(function () {
  // Bump this after changing files in editions/, so browsers fetch the new versions.
  var VERSION = '16';
  var S = window.SITE;
  var ids = S.editions.map(function (e) { return e.id; });
  window.EDITIONS = window.EDITIONS || {};

  // URL of a link from content.js by its id, or '' if it isn't in the list.
  window.linkUrl = function (id) {
    var l = S.links.filter(function (x) { return x.id === id; })[0];
    return l ? l.url : '';
  };
  // A link to that entry, or just the text when the link isn't in the list.
  window.linkTo = function (id, text) {
    var url = window.linkUrl(id);
    return url ? '<a href="' + esc(url) + '">' + text + '</a>' : text;
  };

  // Links to other sites open in a new tab. Checked on click, so it also covers
  // content rendered later (Discord channels, the GitHub terminal, ...).
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (!/^https?:$/.test(url.protocol) || url.origin === location.origin) return;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }, true);

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
  // Put its address here once it runs. Until then those platforms show the
  // fallback names from profiles.js (written by tools/update-profiles.py) and the
  // GitHub picture. Pictures are never stored in the repo.
  var PROFILE_API = '';

  var GITHUB_USER = 'eierman324';
  var ANILIST_USER = 'eierman324';

  function snapshot(id) {
    var p = (window.PROFILES || {})[id] || {};
    return { name: p.name || null, handle: p.handle || null, avatar: null };
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
        // Try the platform's picture, then GitHub's; if neither loads, the "e" stays.
        var tryOwn = p.avatar ? preload(p.avatar).then(function () { return p.avatar; }) : Promise.reject();
        tryOwn.catch(function () {
          if (id === 'github') throw new Error('no picture');
          return window.loadProfile('github').then(function (g) {
            if (!g.avatar || g.avatar === p.avatar) throw new Error('no picture');
            return preload(g.avatar).then(function () { return g.avatar; });
          });
        }).then(function (src) {
          root.querySelectorAll('[data-pfp="' + id + '"]').forEach(function (slot) {
            if (slot.querySelector('img')) return;
            var img = document.createElement('img');
            img.src = src; img.alt = '';
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

  // ---- Projects: projects.json, filled in from GitHub ---------------------------
  var GH_FIELDS = ['name', 'description', 'tags', 'tech', 'year', 'url', 'homepage'];

  function cached(key, maxAgeMs, load) {
    try {
      var hit = JSON.parse(localStorage.getItem(key) || 'null');
      if (hit && Date.now() - hit.t < maxAgeMs) return Promise.resolve(hit.v);
    } catch (e) {}
    return load().then(function (v) {
      try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: v })); } catch (e) {}
      return v;
    });
  }

  function slim(r) {
    return {
      full: r.full_name.toLowerCase(),
      owner: r.owner && r.owner.login,
      name: r.name,
      description: r.description || '',
      tags: r.topics || [],
      tech: r.language || '',
      year: r.created_at ? +r.created_at.slice(0, 4) : '',
      url: r.html_url,
      homepage: r.homepage || ''
    };
  }

  function withTimeout(promise, ms) {
    return Promise.race([promise, new Promise(function (_, reject) { setTimeout(function () { reject(new Error('timeout')); }, ms); })]);
  }

  // One request per owner covers all their repos; anything missing is fetched on its own.
  function githubRepos(fullNames) {
    var owners = {};
    fullNames.forEach(function (f) { owners[f.split('/')[0].toLowerCase()] = true; });
    var hour = 3600 * 1000;
    return Promise.all(Object.keys(owners).map(function (owner) {
      return cached('eierman-repos-' + owner, hour, function () {
        return fetchJSON('https://api.github.com/users/' + owner + '/repos?per_page=100&sort=pushed')
          .then(function (list) { return list.map(slim); });
      }).catch(function () { return []; });
    })).then(function (lists) {
      var byName = {};
      lists.forEach(function (l) { l.forEach(function (r) { byName[r.full] = r; }); });
      var missing = fullNames.filter(function (f) { return !byName[f.toLowerCase()]; });
      return Promise.all(missing.map(function (f) {
        return cached('eierman-repo-' + f.toLowerCase(), hour, function () {
          return fetchJSON('https://api.github.com/repos/' + f).then(slim);
        }).then(function (r) { byName[r.full] = r; }).catch(function () {});
      })).then(function () { return byName; });
    });
  }

  function loadProjects() {
    return fetchJSON('projects.json?v=' + VERSION).then(function (cfg) {
      var entries = cfg.projects || [];
      var repos = entries.filter(function (e) { return e.repo; }).map(function (e) { return e.repo; });
      return withTimeout(githubRepos(repos), 5000).catch(function () { return {}; }).then(function (byName) {
        var groups = cfg.groups || [];
        var known = groups.map(function (g) { return g.id; });
        S.projects = entries.map(function (e) {
          var gh = e.repo ? byName[e.repo.toLowerCase()] : null;
          var base = gh || (e.repo ? { name: e.repo.split('/')[1], url: 'https://github.com/' + e.repo } : {});
          var p = {};
          GH_FIELDS.forEach(function (k) { p[k] = k in e ? e[k] : base[k]; });
          // Repos that belong to someone else are shown as "owner/name".
          var owner = e.repo ? (gh && gh.owner) || e.repo.split('/')[0] : '';
          var external = !!owner && owner.toLowerCase() !== GITHUB_USER.toLowerCase();
          return {
            name: (external ? owner + '/' : '') + (p.name || ''),
            owner: owner,
            external: external,
            desc: p.description || '',
            tags: Array.isArray(p.tags) ? p.tags : [],
            tech: p.tech || '',
            year: p.year || '',
            url: p.url || (e.repo ? 'https://github.com/' + e.repo : '#'),
            homepage: p.homepage || '',
            group: known.indexOf(e.group) !== -1 ? e.group : 'other'
          };
        });
        // Unknown groups end up under "Other"; groups without projects are hidden.
        if (S.projects.some(function (p) { return p.group === 'other'; }) && known.indexOf('other') === -1) {
          groups = groups.concat([{ id: 'other', label: 'Other' }]);
        }
        S.groups = groups.filter(function (g) {
          return S.projects.some(function (p) { return p.group === g.id; });
        });
      });
    }).catch(function () {
      S.groups = S.groups || [];
      S.projects = S.projects || [];
    });
  }

  // The default page's project list.
  function renderHomeProjects() {
    var box = document.getElementById('project-groups');
    if (!box) return;
    if (!S.projects.length) { box.innerHTML = '<p class="empty">Projects could not be loaded. They are all on <a href="https://github.com/eierman324">GitHub</a>.</p>'; return; }
    box.innerHTML = S.groups.map(function (g) {
      var items = projectsIn(g.id);
      if (!items.length) return '';
      return '<div class="group"><h3>' + esc(g.label) + '</h3><ul class="projects">' + items.map(function (p) {
        return '<li><a class="name" href="' + esc(p.url) + '">' + esc(p.name) + '</a>' +
          '<p>' + esc(p.desc) + '</p>' +
          (p.tags.length || p.homepage ? '<p class="meta">' +
            (p.homepage ? '<a href="' + esc(p.homepage) + '">Website</a>' : '') +
            p.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</p>' : '') +
          '<span class="tech">' + esc(p.tech) + '</span></li>';
      }).join('') + '</ul></div>';
    }).join('');
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

    Promise.all([ready, cssReady, projectsReady]).then(function () {
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

  var projectsReady = loadProjects();

  var first = current();
  if (first) {
    show(first);
  } else {
    document.documentElement.classList.remove('edition-loading');
    var slot = document.getElementById('editions-slot');
    if (slot) slot.innerHTML = editionsBar('');
    window.hydrateProfiles(document.body);
    projectsReady.then(renderHomeProjects);
  }
})();
