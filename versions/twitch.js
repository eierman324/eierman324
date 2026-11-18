// Twitch version: an offline channel page. Projects are past broadcasts, facts are the
// panels under the stream, and the chat answers commands like !projects or !links.
window.VERSIONS.twitch = {
  render: function (S) {
    var map = {};
    S.groups.forEach(function (g) { map[g.id] = g.label; });

    function vod(p) {
      var rnd = seeded(p.name + 'vod');
      var h = Math.floor(rnd() * 360);
      var len = 1800 + Math.floor(rnd() * 12000);
      var dur = Math.floor(len / 3600) + ':' + ('0' + Math.floor(len / 60) % 60).slice(-2) + ':' + ('0' + len % 60).slice(-2);
      var views = 40 + Math.floor(rnd() * 960);
      return '<li class="tw-vod">' +
        '<a class="tw-thumb" href="' + p.url + '" style="--h:' + h + '" aria-label="Open ' + esc(p.name) + '">' +
          '<span class="tw-thumb-title" aria-hidden="true">' + esc(p.name) + '</span>' +
          '<span class="tw-badge tw-dur">' + dur + '</span>' +
          '<span class="tw-badge tw-views">' + views + ' views</span>' +
          (p.year ? '<span class="tw-badge tw-date">' + p.year + '</span>' : '') +
        '</a>' +
        '<div class="tw-vod-info">' + avatar('twitch', 'tw-mini') +
          '<div><h3><a href="' + p.url + '">' + esc(p.desc || p.name) + '</a></h3>' +
          '<p>' + pname('twitch') + ' · ' + esc(map[p.group] || '') + '</p>' +
          '<p class="tw-chips">' + [p.tech].concat(p.tags.slice(0, 2)).filter(Boolean).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') +
            (p.homepage ? '<a href="' + esc(p.homepage) + '">Website</a>' : '') + '</p></div>' +
        '</div></li>';
    }

    var follow = linkUrl('twitch')
      ? '<a class="tw-follow" href="' + esc(linkUrl('twitch')) + '">♥ Follow</a>'
      : '<button class="tw-follow" type="button" aria-pressed="false">♥ Follow</button>';

    return '<header class="tw-top">' +
        '<span class="tw-logo">eier<em>man</em></span>' +
        '<nav class="tw-nav" aria-label="Sections"><button type="button" data-go="tw-videos">Videos</button><button type="button" data-go="tw-about">About</button></nav>' +
      '</header>' +
      '<div class="tw-layout">' +
        '<aside class="tw-side" aria-label="Categories">' +
          '<h2>Categories</h2><ul>' + S.groups.map(function (g) {
            var n = projectsIn(g.id).length;
            return '<li><button type="button" data-go="tw-g-' + esc(g.id) + '"><span class="tw-dot" aria-hidden="true"></span><span><strong>' + esc(g.label) + '</strong><small>' + n + (n === 1 ? ' video' : ' videos') + '</small></span></button></li>';
          }).join('') + '</ul>' +
          '<h2>Elsewhere</h2><ul>' + S.links.map(function (l) {
            return '<li><a href="' + esc(l.url) + '"><span class="tw-dot tw-off" aria-hidden="true"></span><span><strong>' + esc(l.label) + '</strong><small>Offline</small></span></a></li>';
          }).join('') + '</ul>' +
        '</aside>' +
        '<main class="tw-main">' +
          '<section class="tw-player" aria-label="Stream">' +
            '<div class="tw-offline">' + avatar('twitch', 'tw-off-pfp') +
              '<p><strong>' + pname('twitch') + '</strong> is offline.</p>' +
              '<button type="button" data-go="tw-videos">Watch past videos</button></div>' +
          '</section>' +
          '<div class="tw-channel">' +
            '<span class="tw-ring">' + avatar('twitch', 'tw-pfp') + '</span>' +
            '<div class="tw-ch-text"><h1>' + pname('twitch') + '</h1>' +
              '<p class="tw-title">' + esc(S.tagline) + '</p>' +
              '<p class="tw-tags">' + S.hashtags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</p></div>' +
            follow +
          '</div>' +
          '<section id="tw-videos" class="tw-sec"><h2>Past broadcasts</h2>' +
            S.groups.map(function (g) {
              return '<h3 class="tw-gh" id="tw-g-' + esc(g.id) + '">' + esc(g.label) + '</h3><ul class="tw-vods">' + projectsIn(g.id).map(vod).join('') + '</ul>';
            }).join('') +
          '</section>' +
          '<section id="tw-about" class="tw-sec"><h2>About ' + pname('twitch') + '</h2>' +
            '<div class="tw-about"><p class="tw-count"><strong>' + S.projects.length + '</strong> projects · <strong>' + S.groups.length + '</strong> categories</p><p>' + esc(S.intro) + '</p></div>' +
            '<div class="tw-panels">' +
              S.facts.map(function (f) { return '<div class="tw-panel"><h3>' + esc(f.label) + '</h3><p>' + esc(f.text) + '</p></div>'; }).join('') +
              '<div class="tw-panel"><h3>Links</h3><ul>' + S.links.map(function (l) { return '<li><a href="' + esc(l.url) + '">' + esc(l.label) + '</a></li>'; }).join('') + '</ul></div>' +
              (S.anime.length ? '<div class="tw-panel"><h3>Favourite anime</h3><ul class="tw-covers">' + S.anime.map(function (a) {
                return '<li><a href="' + esc(a.url) + '"><img src="' + esc(a.cover) + '" alt="' + esc(a.title) + '" loading="lazy" width="100" height="142"></a></li>';
              }).join('') + '</ul></div>' : '') +
            '</div>' +
          '</section>' +
        '</main>' +
        '<aside class="tw-chat" aria-label="Chat">' +
          '<h2>Stream chat</h2>' +
          '<div class="tw-log" id="tw-log" aria-live="polite"></div>' +
          '<form class="tw-send" id="tw-send" autocomplete="off">' +
            '<label class="sr-only" for="tw-msg">Send a message</label>' +
            '<input id="tw-msg" maxlength="200" placeholder="Send a message (try !help)">' +
            '<button type="submit">Chat</button>' +
          '</form>' +
        '</aside>' +
      '</div>';
  },
  mount: function (root, S) {
    // Scroll to a section, but never past the end of the Twitch page itself:
    // the versions footer below it only shows when you scroll on by hand.
    var layout = root.querySelector('.tw-layout');
    function stuckHeight() {
      var h = 0;
      [root.querySelector('.tw-top'), root.querySelector('.top-pills')].forEach(function (el) {
        if (el && getComputedStyle(el).position === 'sticky') h += el.offsetHeight;
      });
      return h;
    }
    root.querySelectorAll('[data-go]').forEach(function (b) {
      b.addEventListener('click', function () {
        var el = document.getElementById(b.dataset.go);
        if (!el) return;
        var target = el.getBoundingClientRect().top + window.scrollY - stuckHeight() - 8;
        var end = layout.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
        window.scrollTo({ top: Math.max(0, Math.min(target, end)), behavior: 'smooth' });
      });
    });
    var fb = root.querySelector('button.tw-follow');
    if (fb) fb.addEventListener('click', function () {
      var on = fb.getAttribute('aria-pressed') !== 'true';
      fb.setAttribute('aria-pressed', on);
      fb.textContent = on ? '✓ Following' : '♥ Follow';
    });

    var log = root.querySelector('#tw-log');
    var form = root.querySelector('#tw-send');
    var input = root.querySelector('#tw-msg');
    var colors = ['#ff7f50', '#1e90ff', '#9acd32', '#ff69b4', '#00ced1', '#daa520'];
    var me = colors[Math.floor(Math.random() * colors.length)];

    function say(nick, color, html, cls) {
      log.insertAdjacentHTML('beforeend', '<p class="' + (cls || '') + '"><b style="color:' + color + '">' + esc(nick) + '</b>: ' + html + '</p>');
      log.scrollTop = log.scrollHeight;
    }
    function bot(html) { say('eierbot', '#bf94ff', html, 'tw-bot'); }

    var commands = {
      help: function () { bot('Commands: !projects, !links, !about, !anime, !discord'); },
      projects: function () {
        bot(S.projects.map(function (p) { return '<a href="' + p.url + '">' + esc(p.name) + '</a>'; }).join(', '));
      },
      links: function () {
        bot(S.links.map(function (l) { return '<a href="' + esc(l.url) + '">' + esc(l.label) + '</a>'; }).join(' · '));
      },
      about: function () { bot(esc(S.intro)); },
      anime: function () {
        bot(S.anime.map(function (a) { return '<a href="' + esc(a.url) + '">' + esc(a.title) + '</a>'; }).join(', '));
      },
      discord: function () {
        bot(linkUrl('discord') ? 'Write me on ' + linkTo('discord', 'Discord') + ", I don't bite." : 'No Discord link yet.');
      }
    };
    commands.socials = commands.links;
    commands.commands = commands.help;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      say('you', me, esc(text));
      var m = /^!(\w+)/.exec(text);
      setTimeout(function () {
        if (m && commands[m[1].toLowerCase()]) commands[m[1].toLowerCase()]();
        else if (m) bot('Unknown command. Try !help');
        else if (Math.random() < 0.5) bot(esc(S.status || 'eierman is offline') + '. Try !help');
      }, 400);
    });

    bot('Welcome! ' + esc(S.name) + ' is offline right now. Type !help for commands.');
    if (S.status) say(S.name, '#9147ff', esc(S.status), 'tw-own');
  }
};
