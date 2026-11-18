// FACEIT edition: an esports player page. Projects are the match history, the stack is the loadout.
window.EDITIONS.faceit = {
  render: function (S) {
    var techs = [];
    S.projects.forEach(function (p) { if (techs.indexOf(p.tech) === -1) techs.push(p.tech); });
    var shipped = S.projects.filter(function (p) { return !p.external; }).length;
    var map = {};
    S.groups.forEach(function (g) { map[g.id] = g.label.split(' ')[0]; });

    return '<header class="fc-hero">' +
        '<div class="fc-wrap fc-player">' +
          avatar('faceit', 'fc-avatar') +
          '<div><p class="fc-country">Germany</p><h1>' + pname('faceit') + '</h1><p class="fc-tag">' + esc(S.tagline) + '</p></div>' +
        '</div>' +
      '</header>' +
      '<main class="fc-wrap">' +
        '<dl class="fc-stats">' +
          '<div><dd>' + S.projects.length + '</dd><dt>Projects</dt></div>' +
          '<div><dd>' + shipped + '</dd><dt>Shipped</dt></div>' +
          '<div><dd>' + techs.length + '</dd><dt>Stacks</dt></div>' +
          '<div><dd>' + S.groups.length + '</dd><dt>Categories</dt></div>' +
        '</dl>' +
        '<div class="fc-cols">' +
          '<section><h2>Match history</h2>' +
            '<div class="fc-matches" role="table">' +
              '<div class="fc-m fc-mh" role="row"><span role="columnheader">Result</span><span role="columnheader">Project</span><span role="columnheader">Map</span><span role="columnheader">Stack</span><span role="columnheader">Year</span></div>' +
              S.projects.map(function (p) {
                var win = !p.external;
                return '<div class="fc-m ' + (win ? 'is-win' : 'is-live') + '" role="row">' +
                  '<span role="cell" class="fc-res">' + (win ? 'Shipped' : 'Contrib') + '</span>' +
                  '<span role="cell" class="fc-proj"><a href="' + p.url + '">' + esc(p.name) + '</a><small>' + esc(p.desc) + '</small></span>' +
                  '<span role="cell">' + esc(map[p.group] || '') + '</span>' +
                  '<span role="cell">' + esc(p.tech) + '</span>' +
                  '<span role="cell">' + p.year + '</span></div>';
              }).join('') +
            '</div></section>' +
          '<aside>' +
            '<section class="fc-box"><h2>Games</h2><ul class="fc-games">' +
              '<li><strong>Fortnite</strong><span>Main game right now</span></li>' +
              '<li><strong>Valorant</strong><span>Shooter of choice</span></li>' +
              '<li><strong>Counter-Strike</strong><span>Used to play here on <a href="' + S.links[6].url + '">FACEIT</a></span></li>' +
              '<li><strong>Minecraft</strong><span>SMPs with friends</span></li>' +
            '</ul></section>' +
            '<section class="fc-box"><h2>Loadout</h2><ul class="fc-loadout">' + techs.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></section>' +
            '<section class="fc-box"><h2>Socials</h2><ul class="fc-socials">' + S.links.map(function (l) { return '<li><a href="' + l.url + '">' + esc(l.label) + '</a></li>'; }).join('') + '</ul></section>' +
          '</aside>' +
        '</div>' +
      '</main>';
  }
};
