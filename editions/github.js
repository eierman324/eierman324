// GitHub edition: a terminal you can type into.
window.EDITIONS.github = {
  render: function (S) {
    return '<main class="gh-wrap">' +
      '<div class="gh-term" role="region" aria-label="Terminal">' +
        '<div class="gh-bar"><span></span><span></span><span></span><p>eierman@github: ~</p></div>' +
        '<div class="gh-out" id="gh-out" aria-live="polite"></div>' +
        '<form class="gh-input" id="gh-form" autocomplete="off">' +
          '<label for="gh-cmd"><span class="gh-user">eierman</span>:<span class="gh-path">~</span>$</label>' +
          '<input id="gh-cmd" spellcheck="false" autocapitalize="off" placeholder="type help">' +
        '</form>' +
      '</div>' +
      '<p class="gh-note">Commands: <button data-cmd="ls">ls</button> <button data-cmd="about">about</button> <button data-cmd="links">links</button> <button data-cmd="anime">anime</button> <button data-cmd="help">help</button> <button data-cmd="clear">clear</button></p>' +
      '</main>';
  },
  mount: function (root, S) {
    var out = root.querySelector('#gh-out');
    var form = root.querySelector('#gh-form');
    var input = root.querySelector('#gh-cmd');
    var history = [], hi = 0;

    function print(html) { out.insertAdjacentHTML('beforeend', html); out.scrollTop = out.scrollHeight; }
    function prompt(cmd) { print('<p><span class="gh-user">eierman</span>:<span class="gh-path">~</span>$ ' + esc(cmd) + '</p>'); }

    var commands = {
      help: function () {
        print('<p class="gh-dim">ls              list projects<br>open &lt;name&gt;     open a project<br>about           who I am<br>links           where to find me<br>anime           favourite shows<br>clear           clear the screen</p>');
      },
      whoami: function () { print('<p>' + esc(S.realName) + ' aka ' + esc(S.name) + '</p>'); },
      about: function () {
        print('<p>' + esc(S.intro) + '</p>' + S.facts.map(function (f) {
          return '<p><span class="gh-key">' + esc(f.label.toLowerCase()) + '</span>: ' + esc(f.text) + '</p>';
        }).join(''));
      },
      ls: function () {
        S.groups.forEach(function (g) {
          print('<p class="gh-dir">' + esc(g.id) + '/</p>');
          projectsIn(g.id).forEach(function (p, i, arr) {
            var branch = i === arr.length - 1 ? '└── ' : '├── ';
            print('<p class="gh-tree">' + branch + '<a href="' + p.url + '">' + esc(p.name) + '</a> <span class="gh-dim">' + esc(p.tech) + '</span><br><span class="gh-comment">' + (i === arr.length - 1 ? '    ' : '│   ') + '# ' + esc(p.desc) + '</span></p>');
          });
        });
      },
      links: function () {
        print(S.links.map(function (l) { return '<p><span class="gh-key">' + esc(l.label.toLowerCase()) + '</span> <a href="' + l.url + '">' + esc(l.url.replace(/^https:\/\/(www\.)?/, '')) + '</a></p>'; }).join(''));
      },
      anime: function () {
        print(S.anime.map(function (a) { return '<p>★ <a href="' + a.url + '">' + esc(a.title) + '</a></p>'; }).join(''));
      },
      open: function (arg) {
        var q = (arg || '').toLowerCase();
        var p = S.projects.filter(function (x) { return x.name.toLowerCase().indexOf(q) === 0; })[0];
        if (!q || !p) { print('<p class="gh-err">open: no project called "' + esc(arg || '') + '". Try ls.</p>'); return; }
        print('<p class="gh-dim">Opening ' + esc(p.name) + '…</p>');
        window.open(p.url, '_blank', 'noopener');
      },
      clear: function () { out.innerHTML = ''; }
    };
    commands.cat = commands.about;
    commands.dir = commands.ls;

    function run(line) {
      var parts = line.trim().split(/\s+/);
      var cmd = (parts.shift() || '').toLowerCase();
      if (!cmd) return;
      prompt(line);
      history.push(line); hi = history.length;
      if (commands[cmd]) commands[cmd](parts.join(' '));
      else print('<p class="gh-err">' + esc(cmd) + ': command not found. Type help.</p>');
    }

    form.addEventListener('submit', function (e) { e.preventDefault(); run(input.value); input.value = ''; });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp' && hi > 0) { hi--; input.value = history[hi]; e.preventDefault(); }
      if (e.key === 'ArrowDown') { hi = Math.min(history.length, hi + 1); input.value = history[hi] || ''; e.preventDefault(); }
    });
    root.querySelectorAll('[data-cmd]').forEach(function (b) {
      b.addEventListener('click', function () { run(b.dataset.cmd); input.focus(); });
    });

    print('<p class="gh-dim">Last login: from github.com</p>');
    ['whoami', 'about', 'ls'].forEach(run);
    out.scrollTop = 0;
  }
};
