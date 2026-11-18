// AniList version: a list profile. Projects are entries with a status and format, plus real favourites.
window.VERSIONS.anilist = {
  render: function (S) {
    function status(p) { return p.external ? 'Contributing' : 'Released'; }
    function poster(p) {
      var h = Math.floor(seeded(p.name)() * 360);
      return '<span class="al-poster" style="--h:' + h + '"><span>' + esc(p.name) + '</span></span>';
    }
    var counts = {};
    S.projects.forEach(function (p) { if (p.tech) counts[p.tech] = (counts[p.tech] || 0) + 1; });
    var techs = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });

    return '<header class="al-banner" style="--covers:' + S.anime.length + '">' +
        '<div class="al-covers" aria-hidden="true">' + S.anime.map(function (a) { return '<img src="' + a.cover + '" alt="">'; }).join('') + '</div>' +
        '<div class="al-head">' + avatar('anilist', 'al-avatar') + '<h1>' + pname('anilist') + '</h1></div>' +
      '</header>' +
      '<nav class="al-tabs" aria-label="Sections"><a href="#al-list">Project list</a><a href="#al-favs">Favourites</a><a href="#al-about">About</a></nav>' +
      '<main class="al-main">' +
        '<aside class="al-side">' +
          '<section class="al-box" id="al-about"><p>' + esc(S.intro) + '</p>' +
            (S.facts.length ? '<dl class="al-facts">' + S.facts.map(function (f) { return '<dt>' + esc(f.label) + '</dt><dd>' + esc(f.text) + '</dd>'; }).join('') + '</dl>' : '') +
          '</section>' +
          '<section class="al-box"><h2>Stats</h2><dl class="al-stats">' +
            '<div><dt>Projects</dt><dd>' + S.projects.length + '</dd></div>' +
            '<div><dt>Languages</dt><dd>' + techs.length + '</dd></div>' +
            '<div><dt>Favourites</dt><dd>' + S.anime.length + '</dd></div></dl>' +
            '<div class="al-dist" aria-label="Projects by technology">' + techs.map(function (t) {
              var hh = Math.floor(seeded(t)() * 360);
              return '<span style="flex:' + counts[t] + ';--h:' + hh + '" title="' + esc(t) + ': ' + counts[t] + '"></span>';
            }).join('') + '</div>' +
            '<ul class="al-legend">' + techs.map(function (t) {
              var hh = Math.floor(seeded(t)() * 360);
              return '<li style="--h:' + hh + '">' + esc(t) + ' <span>' + counts[t] + '</span></li>';
            }).join('') + '</ul></section>' +
          '<section class="al-box"><h2>Elsewhere</h2><ul class="al-links">' + S.links.map(function (l) { return '<li><a href="' + l.url + '">' + esc(l.label) + '</a></li>'; }).join('') + '</ul></section>' +
        '</aside>' +
        '<div class="al-content">' +
          '<section id="al-favs"><h2 class="al-title">Favourite anime</h2><ul class="al-favs">' + S.anime.map(function (a) {
            return '<li><a href="' + a.url + '"><img src="' + a.cover + '" alt="" loading="lazy" width="100" height="142"><span>' + esc(a.title) + '</span></a></li>';
          }).join('') + '</ul><p class="al-more">' + linkTo('anilist', 'Full list on AniList') + '</p></section>' +
          '<section id="al-list">' + S.groups.map(function (g) {
            return '<h2 class="al-title">' + esc(g.label) + '</h2><div class="al-table" role="table">' +
              '<div class="al-row al-th" role="row"><span role="columnheader">Title</span><span role="columnheader">Status</span><span role="columnheader">Format</span><span role="columnheader">Year</span></div>' +
              projectsIn(g.id).map(function (p) {
                return '<div class="al-row" role="row"><span role="cell" class="al-name">' + poster(p) + '<span><a href="' + p.url + '">' + esc(p.name) + '</a><small>' + esc(p.desc) + '</small>' +
                  (p.tags.length || p.homepage ? '<small class="al-extra">' + (p.homepage ? '<a href="' + esc(p.homepage) + '">Website</a>' : '') + p.tags.map(function (t) { return '<span class="al-tag">' + esc(t) + '</span>'; }).join('') + '</small>' : '') +
                  '</span></span>' +
                  '<span role="cell" class="al-status ' + (p.external ? 'is-wip' : '') + '">' + status(p) + '</span>' +
                  '<span role="cell">' + esc(p.tech) + '</span><span role="cell">' + p.year + '</span></div>';
              }).join('') + '</div>';
          }).join('') + '</section>' +
        '</div>' +
      '</main>';
  }
};
