// Steam edition: a game library. Pick a project on the left, see it on the right.
window.EDITIONS.steam = {
  render: function (S) {
    var list = S.groups.map(function (g) {
      var items = projectsIn(g.id);
      return '<li class="st-cat"><p>' + esc(g.label) + ' <span>(' + items.length + ')</span></p><ul>' +
        items.map(function (p) {
          var i = S.projects.indexOf(p);
          var h = Math.floor(seeded(p.name)() * 360);
          return '<li><button type="button" data-i="' + i + '" style="--h:' + h + '"><span class="st-icon" aria-hidden="true">' + esc(p.name.charAt(0)) + '</span>' + esc(p.name) + '</button></li>';
        }).join('') + '</ul></li>';
    }).join('');

    return '<header class="st-top">' +
        '<nav class="st-nav"><span class="st-brand">' + pname('steam') + '</span><span aria-current="page">Library</span><a href="#st-profile">Profile</a></nav>' +
      '</header>' +
      '<div class="st-shell">' +
        '<aside class="st-side" aria-label="Projects"><p class="st-side-head">Projects</p><ul>' + list + '</ul></aside>' +
        '<main class="st-detail" id="st-detail" aria-live="polite"></main>' +
      '</div>' +
      '<section class="st-profile" id="st-profile">' +
        '<div class="st-pcard">' + avatar('steam', 'st-pavatar') + '<div><h2>' + pname('steam') + '</h2><p class="st-online">Online</p><p>' + esc(S.intro) + '</p></div></div>' +
        (S.facts.length ? '<div class="st-showcase"><h3>About me</h3><dl class="st-facts">' + S.facts.map(function (f) {
          return '<div><dt>' + esc(f.label) + '</dt><dd>' + esc(f.text) + '</dd></div>';
        }).join('') + '</dl></div>' : '') +
        '<div class="st-showcase"><h3>Favourite anime</h3><ul>' + S.anime.map(function (a) {
          return '<li><a href="' + a.url + '"><img src="' + a.cover + '" alt="' + esc(a.title) + '" loading="lazy" width="100" height="142"></a></li>';
        }).join('') + '</ul></div>' +
        '<div class="st-links">' + S.links.map(function (l) { return '<a href="' + l.url + '">' + esc(l.label) + '</a>'; }).join('') + '</div>' +
      '</section>';
  },
  mount: function (root, S) {
    var detail = root.querySelector('#st-detail');
    var buttons = root.querySelectorAll('.st-side button');
    function show(i) {
      var p = S.projects[i];
      var group = S.groups.filter(function (g) { return g.id === p.group; })[0];
      var h = Math.floor(seeded(p.name)() * 360);
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.i === i)); });
      detail.innerHTML =
        '<div class="st-hero" style="--h:' + h + '"><h1>' + esc(p.name) + '</h1></div>' +
        '<div class="st-playbar"><a class="st-play" href="' + esc(p.url) + '">Open</a>' + (p.homepage ? '<a class="st-site" href="' + esc(p.homepage) + '">Website</a>' : '') +
        '<dl><div><dt>Built with</dt><dd>' + esc(p.tech) + '</dd></div><div><dt>Released</dt><dd>' + p.year + '</dd></div><div><dt>Category</dt><dd>' + esc(group.label) + '</dd></div></dl></div>' +
        '<div class="st-about"><h2>About this project</h2><p>' + esc(p.desc) + '</p>' + (p.tags.length ? '<ul class="st-tags">' + p.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        show(+b.dataset.i);
        if (window.matchMedia('(max-width: 720px)').matches) detail.scrollIntoView({ block: 'start' });
      });
    });
    show(0);
  }
};
