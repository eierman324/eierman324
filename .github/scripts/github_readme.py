"""Builds README.md and assets/terminal.svg from the GitHub version of eierman.cc.

The content comes from the website itself (content.json, projects.json and the
GitHub data the site loads), so the profile README always matches eierman.cc/#github.
The terminal is a picture; clicking it, a command or a version opens the real
page on eierman.cc, where the command is typed right away.

Usage: SITE_DIR=<checkout of the website branch> python .github/scripts/github_readme.py
"""
import base64
import json
import os
import pathlib
import textwrap
import urllib.request
from xml.sax.saxutils import escape

ROOT = pathlib.Path(__file__).resolve().parents[2]
SITE = pathlib.Path(os.environ.get("SITE_DIR", "site")).resolve()
SITE_URL = "https://eierman.cc"
GITHUB_USER = "eierman324"
TOKEN = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")

# ---- Data, the same way app.js loads it -------------------------------------

def get(url, raw=False):
    req = urllib.request.Request(url, headers={"User-Agent": "profile-readme", "Accept": "application/vnd.github+json"})
    if TOKEN and "api.github.com" in url:
        req.add_header("Authorization", "Bearer " + TOKEN)
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
        return (data, r.headers.get("Content-Type", "image/png")) if raw else json.loads(data)


def load(name):
    return json.loads((SITE / name).read_text(encoding="utf-8"))


def slim(r):
    return {
        "full": r["full_name"].lower(),
        "owner": (r.get("owner") or {}).get("login", ""),
        "name": r["name"],
        "description": r.get("description") or "",
        "tags": r.get("topics") or [],
        "tech": r.get("language") or "",
        "year": int(r["created_at"][:4]) if r.get("created_at") else "",
        "url": r["html_url"],
        "homepage": r.get("homepage") or "",
    }


def projects():
    cfg = load("projects.json")
    entries = cfg.get("projects", [])
    wanted = [e["repo"] for e in entries if e.get("repo")]
    by_name = {}
    for owner in sorted({w.split("/")[0].lower() for w in wanted}):
        try:
            for r in get(f"https://api.github.com/users/{owner}/repos?per_page=100&sort=pushed"):
                by_name[r["full_name"].lower()] = slim(r)
        except Exception as e:  # noqa: BLE001
            print("repos of", owner, "failed:", e)
    for w in wanted:
        if w.lower() not in by_name:
            try:
                by_name[w.lower()] = slim(get(f"https://api.github.com/repos/{w}"))
            except Exception as e:  # noqa: BLE001
                print("repo", w, "failed:", e)

    groups = cfg.get("groups", [])
    known = [g["id"] for g in groups]
    out = []
    for e in entries:
        gh = by_name.get(e["repo"].lower()) if e.get("repo") else None
        base = gh or ({"name": e["repo"].split("/")[1], "url": "https://github.com/" + e["repo"]} if e.get("repo") else {})
        p = {k: e[k] if k in e else base.get(k) for k in ["name", "description", "tags", "tech", "year", "url", "homepage"]}
        owner = ((gh or {}).get("owner") or e["repo"].split("/")[0]) if e.get("repo") else ""
        external = bool(owner) and owner.lower() != GITHUB_USER.lower()
        out.append({
            "name": (owner + "/" if external else "") + (p["name"] or ""),
            "desc": p["description"] or "",
            "tags": p["tags"] if isinstance(p["tags"], list) else [],
            "tech": p["tech"] or "",
            "year": p["year"] or "",
            "url": p["url"] or ("https://github.com/" + e["repo"] if e.get("repo") else "#"),
            "homepage": p["homepage"] or "",
            "group": e.get("group") if e.get("group") in known else "other",
        })
    if any(p["group"] == "other" for p in out) and "other" not in known:
        groups = groups + [{"id": "other", "label": "Other"}]
    groups = [g for g in groups if any(p["group"] == g["id"] for p in out)]
    return groups, out


# ---- Terminal picture (looks like versions/github.css) ----------------------

W = 900            # picture width
PAD = 16           # inner padding, like .gh-out
FS = 14            # font size
LH = 22.4          # line height (1.6)
CW = FS * 0.6      # width of one monospace character
COLS = int((W - 2 * PAD) / (CW * 1.03))  # a little slack for wider fonts

STYLE = """
  .bg { fill: #161b22; stroke: #30363d; }
  .sep { stroke: #30363d; }
  .pfp { fill: #0d1117; stroke: #30363d; }
  text { font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; font-size: 14px; fill: #e6edf3; white-space: pre; }
  .title { font-size: 13px; }
  .dim, .tree, .comment, .title, .e { fill: #8b949e; }
  .comment { font-style: italic; }
  .user { fill: #3fb950; font-weight: 700; }
  .path, .dir { fill: #58a6ff; font-weight: 700; }
  .link { fill: #58a6ff; }
  .bold { font-weight: 700; }
  .key { fill: #d2a8ff; }
  .caret { fill: #3fb950; }
  @media (prefers-color-scheme: light) {
    .bg { fill: #ffffff; stroke: #d0d7de; }
    .sep, .pfp { stroke: #d0d7de; }
    .pfp { fill: #f6f8fa; }
    text { fill: #1f2328; }
    .dim, .tree, .comment, .title, .e { fill: #59636e; }
    .user { fill: #1a7f37; }
    .path, .dir, .link { fill: #0969da; }
    .key { fill: #8250df; }
    .caret { fill: #1a7f37; }
  }
"""


def wrap(spans, first_indent=0):
    """Splits a list of (text, class) into lines of at most COLS characters (like pre-wrap)."""
    words = []
    for text, cls in spans:
        for part in textwrap.wrap(text, width=10**6, drop_whitespace=False, break_on_hyphens=False) or [text]:
            for i, w in enumerate(part.split(" ")):
                words.append(((" " if i else "") + w, cls))
    lines, cur, n = [], [], first_indent
    for w, cls in words:
        if n + len(w) > COLS and cur:
            lines.append(cur)
            cur, n = [], 0
            w = w.lstrip(" ")
        cur.append((w, cls))
        n += len(w)
    if cur:
        lines.append(cur)
    return lines


def tspans(spans):
    out = []
    for text, cls in spans:
        if not text:
            continue
        c = f' class="{cls}"' if cls else ""
        out.append(f"<tspan{c}>{escape(text)}</tspan>")
    return "".join(out)


def prompt(cmd):
    return [("eierman", "user"), (":", ""), ("~", "path"), ("$ " + cmd, "")]


def avatar_data():
    try:
        user = get(f"https://api.github.com/users/{GITHUB_USER}")
        data, ctype = get(user["avatar_url"] + ("&" if "?" in user["avatar_url"] else "?") + "s=112", raw=True)
        return user, f"data:{ctype.split(';')[0]};base64," + base64.b64encode(data).decode()
    except Exception as e:  # noqa: BLE001
        print("avatar failed:", e)
        return {}, None


def terminal_svg(S, groups, projs):
    user, pic = avatar_data()
    name = user.get("name") or user.get("login") or S.get("name", "eierman")
    handle = user.get("login") or S.get("handle", "")

    body = []           # svg elements
    y = 41 + 14         # below the title bar, like .gh-out padding

    def line(spans, gap=0):
        nonlocal y
        y += gap
        for l in wrap(spans):
            body.append(f'<text x="{PAD}" y="{y + FS:.1f}" xml:space="preserve">{tspans(l)}</text>')
            y += LH
        y += 2  # p margin-bottom

    line([("Last login: from github.com", "dim")])

    # whoami
    line(prompt("whoami"))
    y += 4
    cx, cy = PAD + 28, y + 28
    body.append(f'<circle class="pfp" cx="{cx}" cy="{cy}" r="27.5"/>')
    if pic:
        body.append(f'<clipPath id="pfp"><circle cx="{cx}" cy="{cy}" r="27"/></clipPath>'
                    f'<image href="{pic}" x="{cx - 28}" y="{cy - 28}" width="56" height="56" clip-path="url(#pfp)" preserveAspectRatio="xMidYMid slice"/>')
    else:
        body.append(f'<text class="e bold" x="{cx}" y="{cy + 8}" text-anchor="middle" style="font-size:24px">e</text>')
    tx = PAD + 56 + 12
    body.append(f'<text x="{tx}" y="{cy - LH / 2 + 5:.1f}" xml:space="preserve">{tspans([(name, ""), (" (" + handle + ")", "dim")])}</text>')
    body.append(f'<text x="{tx}" y="{cy + LH / 2 + 5:.1f}" xml:space="preserve">{tspans([(S.get("realName", ""), "")])}</text>')
    y += 56 + 8

    # about
    line(prompt("about"))
    line([(S.get("intro", ""), "")])
    for f in S.get("facts", []):
        line([(f["label"].lower(), "key"), (": " + f["text"], "")])

    # ls
    line(prompt("ls"))
    for g in groups:
        line([(g["id"] + "/ ", "dir"), ("# " + g["label"], "comment")], gap=8)
        items = [p for p in projs if p["group"] == g["id"]]
        for i, p in enumerate(items):
            last = i == len(items) - 1
            spans = [("└── " if last else "├── ", "tree"), (p["name"], "link bold")]
            meta = " ".join(str(x) for x in [p["tech"], p["year"]] if x)
            if meta:
                spans.append((" " + meta, "dim"))
            if p["homepage"]:
                spans.append((" ↗ website", "link"))
            if p["tags"]:
                spans.append((" [" + ", ".join(p["tags"]) + "]", "key"))
            for l in wrap(spans):
                body.append(f'<text x="{PAD}" y="{y + FS:.1f}" xml:space="preserve">{tspans(l)}</text>')
                y += LH
            indent = "    " if last else "│   "
            for l in wrap([(indent, "tree"), ("# " + p["desc"], "comment")]):
                body.append(f'<text x="{PAD}" y="{y + FS:.1f}" xml:space="preserve">{tspans(l)}</text>')
                y += LH
            y += 2

    # the prompt you can type into (on the website)
    y += 4 + 8
    px = PAD + len("eierman:~$ ") * CW
    body.append(f'<text x="{PAD}" y="{y + FS:.1f}" xml:space="preserve">{tspans(prompt(""))}</text>')
    body.append(f'<rect class="caret" x="{px:.1f}" y="{y + 2:.1f}" width="2" height="{FS + 3}">'
                '<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite"/></rect>')
    body.append(f'<text class="dim" x="{px + 6:.1f}" y="{y + FS:.1f}">type help</text>')
    y += LH + 14

    h = round(y)
    bar = (f'<circle cx="20" cy="20.5" r="6" fill="#ff5f57"/><circle cx="40" cy="20.5" r="6" fill="#febc2e"/>'
           f'<circle cx="60" cy="20.5" r="6" fill="#28c840"/>'
           f'<text class="title" x="80" y="25">eierman@github: ~</text>'
           f'<line class="sep" x1="0" y1="41" x2="{W}" y2="41"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{h}" viewBox="0 0 {W} {h}" role="img" '
            f'aria-label="Terminal: whoami, about and ls of eierman">'
            f"<style>{STYLE}</style>"
            f'<rect class="bg" x="0.5" y="0.5" width="{W - 1}" height="{h - 1}" rx="10"/>'
            f"{bar}{''.join(body)}</svg>\n")


# ---- README ----------------------------------------------------------------

# Markdown can't style the parts below the terminal, so every piece is a small
# picture too: the command buttons (.gh-note) and the versions bar (.versions).
PIECE_STYLE = """
  text { font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; font-size: 14px; fill: #e6edf3; }
  .dim { fill: #8b949e; } .link { fill: #58a6ff; } .cur { fill: #3fb950; }
  .btn { fill: #161b22; stroke: #30363d; } .ul { stroke: #58a6ff; }
  @media (prefers-color-scheme: light) {
    text { fill: #1f2328; } .dim { fill: #59636e; } .link { fill: #0969da; } .cur { fill: #1a7f37; }
    .btn { fill: #ffffff; stroke: #d0d7de; } .ul { stroke: #0969da; }
  }
"""


def piece(name, width, height, inner, label):
    """Writes assets/readme/<name>.svg and returns its <img> tag."""
    width = round(width)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" '
           f'role="img" aria-label="{escape(label)}"><style>{PIECE_STYLE}</style>{inner}</svg>\n')
    (ROOT / "assets" / "readme" / f"{name}.svg").write_text(svg, encoding="utf-8")
    return f'<img src="./assets/readme/{name}.svg" height="{height}" alt="{escape(label)}">'


def text_el(x, y, s, cls="", anchor="start"):
    # textLength keeps every font at the width the layout was made for.
    c = f' class="{cls}"' if cls else ""
    return (f'<text{c} x="{x:.1f}" y="{y}" text-anchor="{anchor}" textLength="{len(s) * CW:.1f}" '
            f'lengthAdjust="spacingAndGlyphs" xml:space="preserve">{escape(s)}</text>')


def readme(S):
    (ROOT / "assets" / "readme").mkdir(parents=True, exist_ok=True)
    for old in (ROOT / "assets" / "readme").glob("*.svg"):
        old.unlink()
    link = lambda href, img: f'<a href="{href}">{img}</a>'  # noqa: E731

    # Commands: [ls] [about] ...   (buttons: 2px margin, 8px padding, 6px radius)
    H = 30
    note = [link(f"{SITE_URL}/#github/", piece("commands", len("Commands: ") * CW, H, text_el(0, 20, "Commands:", "dim"), "Commands:"))]
    for c in ["ls", "about", "links", "anime", "help", "clear"]:
        w = len(c) * CW + 16
        inner = (f'<rect class="btn" x="2.5" y="2.5" width="{w + 1:.1f}" height="{H - 5}" rx="6"/>'
                 + text_el(2.5 + (w + 1) / 2, 20, c, "", "middle"))
        note.append(link(f"{SITE_URL}/#github/{c}", piece("cmd-" + c, w + 6, H, inner, c)))

    # # This page has a version for every place you might come from.
    intro = "# This page has a version for every place you might come from."
    vers_title = link(f"{SITE_URL}/#github", piece("versions", len(intro) * CW, 24, text_el(0, 17, intro, "dim"), intro))

    # Default  TikTok  YouTube  * GitHub ...   (14px gap, links underlined, current one green)
    vers = []
    for v in [{"id": "", "label": "Default"}] + load_versions():
        cur = v["id"] == "github"
        label = ("* " if cur else "") + v["label"]
        w = len(label) * CW
        inner = text_el(0, 17, label, "cur" if cur else "link")
        if not cur:
            inner += f'<line class="ul" x1="0" y1="20.5" x2="{w:.1f}" y2="20.5" stroke-width="1"/>'
        href = f"{SITE_URL}/#{v['id']}" if v["id"] else f"{SITE_URL}/"
        vers.append(link(href, piece("v-" + (v["id"] or "default"), w + 14, 24, inner, label)))

    return f"""<!-- Generated by .github/scripts/github_readme.py from eierman.cc/#github. Edit the website, not this file. -->

<a href="{SITE_URL}/#github/"><img src="./assets/terminal.svg" width="100%" alt="Terminal on eierman.cc: whoami, about and ls. Click to type your own commands."></a>

<p>{"".join(note)}</p>

<p>{vers_title}<br>{"".join(vers)}</p>
"""


def load_versions():
    # versions live in site.js as a JS array; pull out id and label.
    import re
    js = (SITE / "site.js").read_text(encoding="utf-8")
    return [{"id": m[0], "label": m[1]} for m in re.findall(r"\{\s*id:\s*'([^']+)',\s*label:\s*'([^']+)'", js)]


def main():
    S = load("content.json")
    groups, projs = projects()
    (ROOT / "assets").mkdir(exist_ok=True)
    (ROOT / "assets" / "terminal.svg").write_text(terminal_svg(S, groups, projs), encoding="utf-8")
    (ROOT / "README.md").write_text(readme(S), encoding="utf-8")
    print("wrote README.md and assets/terminal.svg:", len(projs), "projects in", len(groups), "groups")


if __name__ == "__main__":
    main()
