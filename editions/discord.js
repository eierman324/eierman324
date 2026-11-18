// Discord edition: a chat server. Channels switch what eierman has posted.
window.EDITIONS.discord = {
  render: function (S) {
    var channels = [
      { id: 'welcome', topic: 'Start here' },
      { id: 'projects', topic: 'Everything I built' },
      { id: 'about', topic: 'Who is this' },
      { id: 'anime', topic: 'Shows that made me cry' },
      { id: 'links', topic: 'Find me elsewhere' }
    ];
    return '<div class="dc-app">' +
      '<nav class="dc-servers" aria-label="Servers">' + avatar('discord', 'dc-srv is-on') + '<span class="dc-srv" aria-hidden="true">⛏</span><span class="dc-srv" aria-hidden="true">🛴</span></nav>' +
      '<aside class="dc-side">' +
        '<p class="dc-server-name">eierman\'s server</p>' +
        '<p class="dc-cat">Text channels</p>' +
        '<ul class="dc-channels">' + channels.map(function (c, i) {
          return '<li><button type="button" data-ch="' + c.id + '" data-topic="' + esc(c.topic) + '"' + (i === 0 ? ' aria-current="true"' : '') + '><span aria-hidden="true">#</span>' + c.id + '</button></li>';
        }).join('') + '</ul>' +
        '<div class="dc-me">' + avatar('discord', 'dc-av sm').replace('</span>', '<i></i></span>') + '<div><strong>' + pname('discord') + '</strong><small>Online</small></div></div>' +
      '</aside>' +
      '<main class="dc-chat">' +
        '<header class="dc-head"><span aria-hidden="true">#</span><h1 id="dc-title">welcome</h1><p id="dc-topic">Start here</p></header>' +
        '<div class="dc-msgs" id="dc-msgs" aria-live="polite"></div>' +
        '<div class="dc-compose"><a href="' + S.links[1].url + '">Message @' + pname('discord') + ' on Discord</a></div>' +
      '</main>' +
      '<aside class="dc-members" aria-label="Members"><p class="dc-cat">Online, 1</p><div class="dc-member">' + avatar('discord', 'dc-av sm').replace('</span>', '<i></i></span>') + '<div><strong>' + pname('discord') + '</strong><small>Probably tuning a scooter</small></div></div></aside>' +
      '</div>';
  },
  mount: function (root, S) {
    var msgs = root.querySelector('#dc-msgs');
    var title = root.querySelector('#dc-title');
    var topic = root.querySelector('#dc-topic');
    var buttons = root.querySelectorAll('.dc-channels button');

    function msg(body, time) {
      return '<article class="dc-msg">' + avatar('discord', 'dc-av') + '<div><p class="dc-meta"><strong>' + pname('discord') + '</strong><span>Today at ' + time + '</span></p>' + body + '</div></article>';
    }
    function cont(body) { return '<article class="dc-msg dc-cont"><div>' + body + '</div></article>'; }
    function embed(p) {
      var h = Math.floor(seeded(p.name)() * 360);
      return '<div class="dc-embed" style="--h:' + h + '"><a class="dc-etitle" href="' + p.url + '">' + esc(p.name) + '</a><p>' + esc(p.desc) + '</p>' +
        '<dl><div><dt>Built with</dt><dd>' + esc(p.tech) + '</dd></div><div><dt>Year</dt><dd>' + p.year + '</dd></div>' + (p.tags.length ? '<div><dt>Tags</dt><dd>' + p.tags.map(esc).join(', ') + '</dd></div>' : '') + '</dl></div>';
    }

    var content = {
      welcome: function () {
        return '<div class="dc-start"><span class="dc-hash" aria-hidden="true">#</span><h2>Welcome to #welcome!</h2><p>This is the start of the #welcome channel.</p></div>' +
          msg('<p>' + esc(S.intro) + '</p>', '09:41') +
          cont('<p>Look around the channels on the left. <button type="button" class="dc-mention" data-go="projects">#projects</button> has everything I built.</p>');
      },
      projects: function () {
        return S.groups.map(function (g, i) {
          return msg('<p><strong>' + esc(g.label) + '</strong></p>' + projectsIn(g.id).map(embed).join(''), (10 + i) + ':0' + (i * 2));
        }).join('');
      },
      about: function () {
        return msg(S.facts.map(function (f) { return '<p><strong>' + esc(f.label) + ':</strong> ' + esc(f.text) + '</p>'; }).join(''), '18:20');
      },
      anime: function () {
        return msg('<p>Some of my 10/10s. Full list on <a href="' + S.links[5].url + '">AniList</a>.</p><ul class="dc-covers">' + S.anime.map(function (a) {
          return '<li><a href="' + a.url + '"><img src="' + a.cover + '" alt="' + esc(a.title) + '" loading="lazy" width="100" height="142"></a></li>';
        }).join('') + '</ul>', '22:07');
      },
      links: function () {
        return msg('<ul class="dc-links">' + S.links.map(function (l) { return '<li><a href="' + l.url + '">' + esc(l.label) + '</a></li>'; }).join('') + '</ul>', '12:00');
      }
    };

    function open(id) {
      var b = root.querySelector('[data-ch="' + id + '"]');
      buttons.forEach(function (x) { x.toggleAttribute('aria-current', x === b); });
      title.textContent = id;
      topic.textContent = b.dataset.topic;
      msgs.innerHTML = content[id]();
      msgs.scrollTop = 0;
      window.hydrateProfiles(msgs);
      msgs.querySelectorAll('[data-go]').forEach(function (m) { m.addEventListener('click', function () { open(m.dataset.go); }); });
    }
    buttons.forEach(function (b) { b.addEventListener('click', function () { open(b.dataset.ch); }); });
    open('welcome');
  }
};
