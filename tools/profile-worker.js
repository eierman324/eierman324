// Cloudflare Worker that fetches name, handle and picture live from the
// platforms that browsers can't read directly (TikTok, YouTube, Steam, FACEIT).
//
// Deploy it (Workers > Create > paste this file), then put its URL into
// PROFILE_API at the top of app.js. Request: GET <worker>?p=tiktok
// Answer:   {"name": "...", "handle": "...", "avatar": "https://..." | null}

const USERS = {
  tiktok: 'eierman.cc',
  youtube: 'eierman324',
  steam: 'eierman324',
  faceit: 'eierman324',
};

// Only pages on these sites may use the worker.
const ALLOWED_ORIGINS = ['https://eierman.cc', 'https://eierman324.github.io', 'http://localhost:8731'];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const CACHE_SECONDS = 600;

async function page(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en', Cookie: 'SOCS=CAI; CONSENT=YES+1' } });
  if (!r.ok) throw new Error(`${url} answered ${r.status}`);
  return r.text();
}

function match(text, re) {
  const m = text.match(re);
  return m ? m[1] : null;
}

const SOURCES = {
  async tiktok(user) {
    const html = await page(`https://www.tiktok.com/@${user}`);
    const field = (k) => {
      const v = match(html, new RegExp(`"${k}":"([^"]*)"`));
      return v ? JSON.parse(`"${v}"`) : null;
    };
    return { name: field('nickname'), handle: '@' + user, avatar: field('avatarLarger') };
  },
  async youtube(user) {
    const html = await page(`https://www.youtube.com/@${user}`);
    const avatar = match(html, /<meta property="og:image" content="([^"]*)"/);
    return {
      name: match(html, /<meta property="og:title" content="([^"]*)"/),
      handle: '@' + user,
      avatar: avatar && avatar.replace(/=s\d+/, '=s400'),
    };
  },
  async steam(user) {
    const xml = await page(`https://steamcommunity.com/id/${user}/?xml=1`);
    return {
      name: match(xml, /<steamID><!\[CDATA\[(.*?)\]\]>/),
      handle: user,
      avatar: match(xml, /<avatarFull><!\[CDATA\[(.*?)\]\]>/),
    };
  },
  async faceit(user) {
    const d = JSON.parse(await page(`https://www.faceit.com/api/users/v1/nicknames/${user}`)).payload;
    return { name: d.nickname, handle: d.nickname, avatar: d.avatar || null };
  },
};

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET',
      Vary: 'Origin',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    const platform = new URL(request.url).searchParams.get('p');
    if (!SOURCES[platform]) {
      return Response.json({ error: 'unknown platform' }, { status: 400, headers: cors });
    }

    const cache = caches.default;
    const key = new Request(`https://profile-cache/${platform}`);
    let res = await cache.match(key);
    if (!res) {
      try {
        const data = await SOURCES[platform](USERS[platform]);
        res = Response.json(data, { headers: { 'Cache-Control': `public, max-age=${CACHE_SECONDS}` } });
        ctx.waitUntil(cache.put(key, res.clone()));
      } catch (e) {
        return Response.json({ error: String(e) }, { status: 502, headers: cors });
      }
    }
    const out = new Response(res.body, res);
    Object.entries(cors).forEach(([k, v]) => out.headers.set(k, v));
    return out;
  },
};
