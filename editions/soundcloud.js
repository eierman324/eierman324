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
          '<div><p class="sc-artist">' + esc(S.name) + '</p><h3><a href="' + p.url + '">' + esc(p.name) + '</a></h3></div>' +
          '<span class="sc-tag">#' + esc(p.tech) + '</span></div>' +
          wave(p.name) +
          '<div class="sc-foot"><p>' + esc(p.desc) + '</p><span class="sc-time">' + mm + ':' + ss + '</span></div>' +
        '</div></li>';
    }
    return '<header class="sc-top"><span class="sc-logo">eierman<em>sound</em></span></header>' +
      '<div class="sc-banner"><div class="sc-who"><span class="sc-avatar" aria-hidden="true">e</span><div>' +
        '<h1>' + esc(S.name) + '</h1><p>' + esc(S.realName) + ', Germany</p></div></div></div>' +
      '<main class="sc-main-wrap">' +
        '<div class="sc-cols"><section><h2>Tracks</h2><ol class="sc-list">' + S.projects.map(track).join('') + '</ol></section>' +
        '<aside class="sc-side"><h2>Bio</h2><p>' + esc(S.intro) + '</p>' +
          S.facts.map(function (f) { return '<p><strong>' + esc(f.label) + '.</strong> ' + esc(f.text) + '</p>'; }).join('') +
          '<h2>Links</h2><ul>' + S.links.map(function (l) { return '<li><a href="' + l.url + '">' + esc(l.label) + '</a></li>'; }).join('') + '</ul></aside></div>' +
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
