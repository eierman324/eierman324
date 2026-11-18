// YouTube version: a channel page with tabs, projects as video tiles.
window.VERSIONS.youtube = {
  render: function (S) {
    function thumb(p) {
      var rnd = seeded(p.name);
      var h = Math.floor(rnd() * 360);
      return '<div class="yt-thumb" style="--h:' + h + '">' +
        '<span class="yt-thumb-title">' + esc(p.name) + '</span>' +
        '<span class="yt-badge">' + esc(p.tech) + '</span></div>';
    }
    function card(p) {
      return '<li class="yt-card"><a href="' + p.url + '">' + thumb(p) +
        '<div class="yt-info">' + avatar('youtube', 'yt-avatar sm') + '<div>' +
        '<h3>' + esc(p.name) + '</h3><p>' + pname('youtube') + '</p><p>' + p.year + ', ' + esc(p.tech) + '</p>' +
        '</div></div></a></li>';
    }
    var featured = S.projects[0];

    return '<header class="yt-top"><span class="yt-logo">eier<span>man</span></span></header>' +
      '<main class="yt-main">' +
      '<div class="yt-banner"><span>' + esc(S.tagline) + '</span></div>' +
      '<section class="yt-channel">' +
        avatar('youtube', 'yt-avatar') +
        '<div><h1>' + pname('youtube') + '</h1>' +
        '<p class="yt-sub">' + phandle('youtube') + ', ' + S.projects.length + ' projects</p>' +
        '<p class="yt-about-line">' + esc(S.intro) + '</p>' +
        (S.youtube ? '<a class="yt-subscribe" href="' + esc(S.youtube.replace(/\/+$/, '') + '?sub_confirmation=1') + '">Subscribe</a>' : '') + '</div>' +
      '</section>' +
      '<div class="yt-tabs" role="tablist">' +
        '<button role="tab" aria-selected="true" data-tab="home">Home</button>' +
        '<button role="tab" aria-selected="false" data-tab="projects">Projects</button>' +
        '<button role="tab" aria-selected="false" data-tab="about">About</button>' +
      '</div>' +
      '<section class="yt-panel" data-panel="home">' +
        '<div class="yt-featured"><a href="' + featured.url + '">' + thumb(featured) + '</a>' +
        '<div><h2>' + esc(featured.name) + '</h2><p class="yt-sub">' + featured.year + ', ' + esc(featured.tech) + '</p><p>' + esc(featured.desc) + '</p></div></div>' +
        S.groups.map(function (g) {
          return '<h2 class="yt-shelf">' + esc(g.label) + '</h2><ul class="yt-grid">' + projectsIn(g.id).map(card).join('') + '</ul>';
        }).join('') +
        (S.anime.length ? '<h2 class="yt-shelf">Favourite anime</h2><ul class="yt-anime">' + S.anime.map(function (a) {
          return '<li><a href="' + esc(a.url) + '"><img src="' + esc(a.cover) + '" alt="" loading="lazy" width="100" height="142"><span>' + esc(a.title) + '</span></a></li>';
        }).join('') + '</ul><p class="yt-sub">Full list on ' + linkTo('anilist', 'AniList') + '</p>' : '') +
      '</section>' +
      '<section class="yt-panel" data-panel="projects" hidden>' +
        '<ul class="yt-list">' + S.projects.map(function (p) {
          return '<li><a href="' + p.url + '">' + thumb(p) + '</a><div><h3><a href="' + p.url + '">' + esc(p.name) + '</a></h3><p class="yt-sub">' + p.year + ', ' + esc(p.tech) + '</p><p>' + esc(p.desc) + '</p>' +
            (p.tags.length || p.homepage ? '<p class="yt-tags">' + (p.homepage ? '<a href="' + esc(p.homepage) + '">Website</a>' : '') + p.tags.map(function (t) { return '<span>#' + esc(t) + '</span>'; }).join('') + '</p>' : '') +
            '</div></li>';
        }).join('') + '</ul>' +
      '</section>' +
      '<section class="yt-panel" data-panel="about" hidden>' +
        '<div class="yt-about"><div><h2>Description</h2><p>' + esc(S.intro) + '</p>' +
        S.facts.map(function (f) { return '<p><strong>' + esc(f.label) + '.</strong> ' + esc(f.text) + '</p>'; }).join('') +
        '</div><div><h2>Links</h2><ul>' + S.links.map(function (l) { return '<li><a href="' + l.url + '">' + esc(l.label) + '</a></li>'; }).join('') + '</ul></div></div>' +
      '</section>' +
      '</main>';
  },
  mount: function (root) {
    var tabs = root.querySelectorAll('.yt-tabs [role=tab]');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === t)); });
        root.querySelectorAll('.yt-panel').forEach(function (p) { p.hidden = p.dataset.panel !== t.dataset.tab; });
      });
    });
  }
};
