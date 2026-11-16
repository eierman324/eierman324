"""Generate assets/anilist.svg from the public AniList API (stdlib only)."""
import base64
import json
import sys
import urllib.request
from html import escape
from pathlib import Path

USER = "eierman324"
OUT = Path(__file__).resolve().parents[2] / "assets" / "anilist.svg"
MAX_WATCHING = 4

QUERY = """
query ($name: String) {
  User(name: $name) {
    statistics { anime {
      count episodesWatched minutesWatched
      genres(sort: COUNT_DESC, limit: 5) { genre count }
    } }
  }
  MediaListCollection(userName: $name, type: ANIME, status: CURRENT, sort: UPDATED_TIME_DESC) {
    lists { entries {
      progress
      media {
        siteUrl episodes isAdult genres
        title { english romaji }
        coverImage { medium }
        tags { isAdult }
      }
    } }
  }
}
"""

# Tokyo Night, matching the streak card
BG, BORDER, TITLE, TEXT, MUTED, ACCENT, BAR_BG = (
    "#1a1b27", "#2a2e3f", "#70a5fd", "#c0caf5", "#7aa2f7", "#bf91f3", "#24283b")


def post(query, variables):
    req = urllib.request.Request(
        "https://graphql.anilist.co",
        data=json.dumps({"query": query, "variables": variables}).encode(),
        headers={"Content-Type": "application/json", "Accept": "application/json",
                 "User-Agent": "profile-anilist-card"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
    if data.get("errors"):
        sys.exit(f"AniList error: {data['errors']}")
    return data["data"]


def is_nsfw(media):
    return (media["isAdult"]
            or "Ecchi" in media["genres"]
            or any(t["isAdult"] for t in media["tags"]))


def data_uri(url):
    req = urllib.request.Request(url, headers={"User-Agent": "profile-anilist-card"})
    with urllib.request.urlopen(req, timeout=30) as r:
        mime = r.headers.get_content_type()
        return f"data:{mime};base64,{base64.b64encode(r.read()).decode()}"


def clip(text, n):
    return text if len(text) <= n else text[: n - 1].rstrip() + "…"


def main():
    d = post(QUERY, {"name": USER})
    stats = d["User"]["statistics"]["anime"]
    entries = [e for lst in d["MediaListCollection"]["lists"] for e in lst["entries"]]
    watching = [e for e in entries if not is_nsfw(e["media"])][:MAX_WATCHING]

    W, H = 820, 250
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
           "<style>text{font-family:'Segoe UI',Ubuntu,'Helvetica Neue',sans-serif}"
           f".t{{fill:{TITLE};font-size:18px;font-weight:600}}"
           f".n{{fill:{TEXT};font-size:24px;font-weight:700}}"
           f".l{{fill:{MUTED};font-size:12px}}"
           f".g{{fill:{TEXT};font-size:12px}}"
           f".s{{fill:{TEXT};font-size:11px}}</style>",
           f'<rect x="0.5" y="0.5" width="{W-1}" height="{H-1}" rx="8" fill="{BG}" stroke="{BORDER}"/>',
           f'<text x="24" y="38" class="t">AniList · {escape(USER)}</text>']

    # stats
    days = stats["minutesWatched"] / 1440
    for i, (num, label) in enumerate([(stats["count"], "Anime"),
                                      (stats["episodesWatched"], "Episodes"),
                                      (f"{days:.1f}", "Days watched")]):
        x = 24 + i * 120
        out.append(f'<text x="{x}" y="80" class="n">{num}</text>')
        out.append(f'<text x="{x}" y="98" class="l">{label}</text>')

    # genres
    genres = stats["genres"]
    top = max((g["count"] for g in genres), default=1)
    out.append(f'<text x="24" y="130" class="l">Top genres</text>')
    for i, g in enumerate(genres):
        y = 146 + i * 19
        w = 200 * g["count"] / top
        out.append(f'<text x="24" y="{y + 10}" class="g">{escape(g["genre"])}</text>')
        out.append(f'<rect x="130" y="{y}" width="200" height="10" rx="5" fill="{BAR_BG}"/>')
        out.append(f'<rect x="130" y="{y}" width="{w:.1f}" height="10" rx="5" fill="{ACCENT}"/>')
        out.append(f'<text x="338" y="{y + 10}" class="s">{g["count"]}</text>')

    # currently watching
    out.append(f'<line x1="380" y1="24" x2="380" y2="{H-24}" stroke="{BORDER}"/>')
    out.append(f'<text x="404" y="38" class="t">Currently watching</text>')
    cw, ch = 88, 125
    for i, e in enumerate(watching):
        m = e["media"]
        x, y = 404 + i * (cw + 12), 56
        title = m["title"]["english"] or m["title"]["romaji"]
        eps = f'{e["progress"]}/{m["episodes"]}' if m["episodes"] else f'{e["progress"]}'
        out.append(f'<clipPath id="c{i}"><rect x="{x}" y="{y}" width="{cw}" height="{ch}" rx="6"/></clipPath>')
        out.append(f'<image href="{data_uri(m["coverImage"]["medium"])}" x="{x}" y="{y}" '
                   f'width="{cw}" height="{ch}" preserveAspectRatio="xMidYMid slice" clip-path="url(#c{i})"/>')
        out.append(f'<text x="{x}" y="{y + ch + 18}" class="s">{escape(clip(title, 15))}</text>')
        out.append(f'<text x="{x}" y="{y + ch + 33}" class="l">Ep {eps}</text>')
    if not watching:
        out.append(f'<text x="404" y="80" class="l">Nothing right now</text>')

    out.append("</svg>")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(out), encoding="utf-8")
    print(f"wrote {OUT} ({len(watching)} watching, {sum(map(len, out))} bytes)")


if __name__ == "__main__":
    main()
