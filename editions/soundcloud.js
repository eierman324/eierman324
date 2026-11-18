// SoundCloud edition: projects as tracks with waveforms. "Play" scrubs through the waveform.
window.EDITIONS.soundcloud = {
  render: function (S) {
    function wave(name) {
      var rnd = seeded(name + 'wave');
      var bars = '';
      var n = 90;
      for (var i = 0; i < n; i++) {
        var env = 0.35 + 0.65 * Math.sin(Math.PI * (i / n));
        var hgt = Math.max(4, Math.round((0.25 + rnd() * 0.75) * env * 48));
        bars += '<rect x="' + (i * 4) + '" y="' + (50 - hgt) + '" width="3" height="' + hgt + '" />';
        bars += '<rect class="sc-reflect" x="' + (i * 4) + '" y="51" width="3" height="' + Math.round(hgt * 0.35) + '" />';
      }
      return '<svg class="sc-wave" viewBox="0 0 360 68" preserveAspectRatio="none" aria-hidden="true">' +
        '<defs><clipPath id="clip-' + name.replace(/\W/g, '') + '"><rect class="sc-progress" x="0" y="0" width="0" height="68" /></clipPath></defs>' +
        '<g class="sc-bars">' + bars + '</g>' +
        '<g class="sc-bars sc-played" clip-path="url(#clip-' + name.replace(/\W/g, '') + ')">' + bars + '</g></svg>';
    }
    function track(p, i) {
      var h = Math.floor(seeded(p.name)() * 360);
      var len = 60 + Math.floor(seeded(p.name + 'len')() * 180);
      var mm = Math.floor(len / 60), ss = ('0' + (len % 60)).slice(-2);
      return '<li class="sc-track" data-len="' + len + '">' +
        '<a class="sc-art" href="' + p.url + '" style="--h:' + h + '" aria-label="Open ' + esc(p.name) + '"><span>' + esc(p.name.charAt(0)) + '</span></a>' +
        '<div class="sc-main">' +
          '<div class="sc-head"><button class="sc-play" type="button" aria-label="Play ' + esc(p.name) + '"><span aria-hidden="true"></span></button>' +
          '<div><p class="sc-artist">' + pname('soundcloud') + '</p><h3><a href="' + p.url + '">' + esc(p.name) + '</a></h3></div>' +
          (p.tags.length ? p.tags.slice(0, 2) : [p.tech]).filter(Boolean).map(function (t) { return '<span class="sc-tag">#' + esc(t) + '</span>'; }).join('') + '</div>' +
          wave(p.name) +
          '<div class="sc-foot"><p>' + esc(p.desc) + '</p><span class="sc-time">' + mm + ':' + ss + '</span></div>' +
          '<p class="sc-meta">' + esc([p.tech, p.year].filter(Boolean).join(', ')) + (p.homepage ? ' <a href="' + esc(p.homepage) + '">Website</a>' : '') + '</p>' +
        '</div></li>';
    }
    return '<header class="sc-top"><span class="sc-logo">eier<em>man</em></span></header>' +
      '<div class="sc-banner"><div class="sc-who">' + avatar('soundcloud', 'sc-avatar') + '<div>' +
        '<h1>' + pname('soundcloud') + '</h1><p>' + esc([S.realName, S.location].filter(Boolean).join(', ')) + '</p></div></div></div>' +
      '<main class="sc-main-wrap">' +
        '<div class="sc-cols"><section>' + S.groups.map(function (g) {
          return '<h2>' + esc(g.label) + '</h2><ol class="sc-list">' + projectsIn(g.id).map(track).join('') + '</ol>';
        }).join('') + '</section>' +
        '<aside class="sc-side"><h2>Bio</h2><p>' + esc(S.intro) + '</p>' +
          S.facts.map(function (f) { return '<p><strong>' + esc(f.label) + '.</strong> ' + esc(f.text) + '</p>'; }).join('') +
          '<h2>Links</h2><ul>' + S.links.map(function (l) { return '<li><a href="' + l.url + '">' + esc(l.label) + '</a></li>'; }).join('') + '</ul>' +
          (S.anime.length ? '<h2>Favourite anime</h2><ul class="sc-covers">' + S.anime.map(function (a) {
            return '<li><a href="' + esc(a.url) + '"><img src="' + esc(a.cover) + '" alt="' + esc(a.title) + '" loading="lazy" width="100" height="142"></a></li>';
          }).join('') + '</ul>' : '') +
        '</aside></div>' +
      '</main>';
  },
  mount: function (root) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var active = null, raf = null;
    function stop() {
      if (!active) return;
      active.el.classList.remove('playing');
      active.btn.setAttribute('aria-label', active.btn.getAttribute('aria-label').replace('Pause', 'Play'));
      cancelAnimationFrame(raf);
      active = null;
    }
    root.querySelectorAll('.sc-track').forEach(function (el) {
      var btn = el.querySelector('.sc-play');
      var prog = el.querySelector('.sc-progress');
      var time = el.querySelector('.sc-time');
      var len = +el.dataset.len;
      var label = time.textContent;
      btn.addEventListener('click', function () {
        if (active && active.el === el) { stop(); return; }
        stop();
        active = { el: el, btn: btn, start: performance.now() - (el._pos || 0) * 1000 };
        el.classList.add('playing');
        btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Play', 'Pause'));
        var speed = 12; // run through a track in a few seconds
        if (reduce) {
          prog.setAttribute('width', '360');
          time.textContent = label + ' / ' + label;
          el._pos = 0;
          return;
        }
        (function tick(now) {
          if (!active || active.el !== el) return;
          var pos = Math.max(0, Math.min(len, ((now - active.start) / 1000) * speed));
          el._pos = pos / speed;
          prog.setAttribute('width', String(360 * pos / len));
          var s = Math.floor(pos);
          time.textContent = Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2) + ' / ' + label;
          if (pos >= len) { el._pos = 0; stop(); return; }
          raf = requestAnimationFrame(tick);
        })(performance.now());
      });
    });
  }
};
