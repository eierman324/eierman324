// TikTok edition: a vertical full-screen feed, one project per screen.
window.EDITIONS.tiktok = {
  render: function (S) {
    function slide(inner, hue, extraClass) {
      return '<section class="tt-slide ' + (extraClass || '') + '" style="--h:' + hue + '">' + inner + '</section>';
    }
    var intro = slide(
      '<div class="tt-body">' +
        '<p class="tt-user">' + phandle('tiktok') + '</p>' +
        '<h1 class="tt-glitch">' + pname('tiktok') + '</h1>' +
        '<p class="tt-desc">' + esc(S.intro) + '</p>' +
        '<p class="tt-tags">#it #escooter #gaming #anime</p>' +
        '<p class="tt-hint">Swipe up for projects</p>' +
      '</div>' +
      '<div class="tt-rail">' + avatar('tiktok', 'tt-avatar') +
        S.links.map(function (l) { return '<a href="' + l.url + '">' + esc(l.label) + '</a>'; }).join('') +
      '</div>', 330, 'tt-first');

    var projects = S.projects.map(function (p, i) {
      var rnd = seeded(p.name);
      var hue = Math.floor(rnd() * 360);
      var group = S.groups.filter(function (g) { return g.id === p.group; })[0];
      return slide(
        '<div class="tt-body">' +
          '<p class="tt-user">' + phandle('tiktok') + ' <span>' + (i + 1) + ' / ' + S.projects.length + '</span></p>' +
          '<h2 class="tt-glitch" data-text="' + esc(p.name) + '">' + esc(p.name) + '</h2>' +
          '<p class="tt-desc">' + esc(p.desc) + '</p>' +
          '<p class="tt-tags">' + (p.tags.length ? p.tags.slice(0, 5) : [p.tech, group.label.split(' ')[0]]).filter(Boolean).map(function (t) { return '#' + esc(t.replace(/[^a-z0-9#]/gi, '').toLowerCase()); }).join(' ') + '</p>' +
        '</div>' +
        '<div class="tt-rail">' + avatar('tiktok', 'tt-avatar') +
          '<a href="' + p.url + '">Open</a>' +
          '<span class="tt-meta">' + esc(p.tech) + '</span>' +
          '<span class="tt-meta">' + p.year + '</span>' +
        '</div>', hue);
    }).join('');

    var outro = slide(
      '<div class="tt-body">' +
        '<h2 class="tt-glitch" data-text="That\'s it">That\'s it</h2>' +
        S.facts.map(function (f) { return '<p class="tt-desc"><strong>' + esc(f.label) + ':</strong> ' + esc(f.text) + '</p>'; }).join('') +
        '<p class="tt-desc">Follow along on ' + linkTo('tiktok', 'TikTok') + ' or write me on ' + linkTo('discord', 'Discord') + '.</p>' +
      '</div>', 190, 'tt-last');

    return '<main class="tt-feed">' + intro + projects + outro + '</main>';
  },
  mount: function (root) {
    // Make every title as big as possible while its longest word still fits on one line.
    function fit() {
      root.querySelectorAll('.tt-glitch').forEach(function (el) {
        var size = 96;
        el.style.fontSize = size + 'px';
        while (el.scrollWidth > el.clientWidth + 1 && size > 24) {
          size -= 2;
          el.style.fontSize = size + 'px';
        }
      });
    }
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fit, 150); });
  }
};
