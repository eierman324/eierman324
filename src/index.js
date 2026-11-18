// Profile Worker for eierman.cc
//
// Fetches name, handle and profile picture live from each platform and serves
// them to the website, so every profile picture on the site goes through here.
//
//   GET /profile?p=tiktok  -> {"platform","name","handle","avatar","own","presence"}
//   GET /profiles          -> the same for every platform at once
//   GET /avatar?p=tiktok   -> the picture itself (falls back to the GitHub one)
//
// Usernames and allowed origins are set under "vars" in wrangler.jsonc.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const PROFILE_TTL = 600;   // seconds a profile stays cached
const AVATAR_TTL = 3600;   // seconds a picture stays cached
const PRESENCE_TTL = 60;   // seconds Discord (with its live status) stays cached
const PLATFORMS = ['github', 'tiktok', 'youtube', 'steam', 'anilist', 'faceit', 'discord', 'soundcloud'];

async function text(url, init = {}) {
  const r = await fetch(url, {
    ...init,
    headers: { 'User-Agent': UA, 'Accept-Language': 'en', Cookie: 'SOCS=CAI; CONSENT=YES+1', ...(init.headers || {}) },
  });
  if (!r.ok) throw new Error(`${new URL(url).hostname} answered ${r.status}`);
  return r.text();
}

const match = (s, re) => {
  const m = s.match(re);
  return m ? m[1] : null;
};

// Each source returns {name, handle, avatar} where avatar is the platform's own
// picture URL, or null when the platform has none.
const SOURCES = {
  async github(env) {
    const d = JSON.parse(await text(`https://api.github.com/users/${env.GITHUB_USER}`, { headers: { Accept: 'application/vnd.github+json' } }));
    return { name: d.name || d.login, handle: d.login, avatar: `${d.avatar_url}${d.avatar_url.includes('?') ? '&' : '?'}s=400` };
  },
  async tiktok(env) {
    const html = await text(`https://www.tiktok.com/@${env.TIKTOK_USER}`);
    const field = (k) => {
      const v = match(html, new RegExp(`"${k}":"([^"]*)"`));
      return v ? JSON.parse(`"${v}"`) : null;
    };
    return { name: field('nickname'), handle: '@' + env.TIKTOK_USER, avatar: field('avatarLarger') };
  },
  async youtube(env) {
    const html = await text(`https://www.youtube.com/@${env.YOUTUBE_HANDLE}`);
    const avatar = match(html, /<meta property="og:image" content="([^"]*)"/);
    return {
      name: match(html, /<meta property="og:title" content="([^"]*)"/),
      handle: '@' + env.YOUTUBE_HANDLE,
      avatar: avatar && avatar.replace(/=s\d+/, '=s400'),
    };
  },
  async steam(env) {
    const xml = await text(`https://steamcommunity.com/id/${env.STEAM_ID}/?xml=1`);
    return {
      name: match(xml, /<steamID><!\[CDATA\[(.*?)\]\]>/),
      handle: env.STEAM_ID,
      avatar: match(xml, /<avatarFull><!\[CDATA\[(.*?)\]\]>/),
    };
  },
  async anilist(env) {
    const body = JSON.stringify({ query: `{User(name:${JSON.stringify(env.ANILIST_USER)}){name avatar{large}}}` });
    const u = JSON.parse(await text('https://graphql.anilist.co', {
      method: 'POST', body, headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    })).data.User;
    const a = u.avatar && u.avatar.large;
    return { name: u.name, handle: u.name, avatar: a && !/\/default\.png$/.test(a) ? a : null };
  },
  async faceit(env) {
    const d = JSON.parse(await text(`https://www.faceit.com/api/users/v1/nicknames/${env.FACEIT_NICK}`)).payload;
    return { name: d.nickname, handle: d.nickname, avatar: d.avatar || null };
  },
  async discord(env) {
    // Discord itself has no public profile lookup, so this goes through Lanyard
    // (https://github.com/Phineas/lanyard). It only works after joining the
    // Lanyard Discord server; until then the name from DISCORD_NAME is used.
    const fallback = { name: env.DISCORD_NAME, handle: env.DISCORD_NAME, avatar: null, presence: null };
    if (!env.DISCORD_ID) return fallback;
    const res = JSON.parse(await text(`https://api.lanyard.rest/v1/users/${env.DISCORD_ID}`).catch(() => '{}'));
    if (!res.success || !res.data) return fallback;
    const d = res.data, u = d.discord_user || {};
    const avatar = u.avatar
      ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${u.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`
      : null;
    return {
      name: u.global_name || u.display_name || u.username || env.DISCORD_NAME,
      handle: u.username || env.DISCORD_NAME,
      avatar,
      presence: { state: d.discord_status || 'offline', text: activityText(d) },
    };
  },
  async soundcloud() {
    return { name: null, handle: null, avatar: null };
  },
};

// One line describing what you're doing on Discord, like the client shows it.
function activityText(d) {
  const acts = d.activities || [];
  const custom = acts.find((a) => a.type === 4);
  if (custom && (custom.state || (custom.emoji && custom.emoji.name))) {
    return [custom.emoji && !custom.emoji.id ? custom.emoji.name : '', custom.state || ''].filter(Boolean).join(' ');
  }
  if (d.listening_to_spotify && d.spotify) return `Listening to ${d.spotify.song} by ${d.spotify.artist}`;
  const a = acts.find((x) => x.type !== 4);
  if (!a) return null;
  const verb = { 0: 'Playing', 1: 'Streaming', 2: 'Listening to', 3: 'Watching', 5: 'Competing in' }[a.type] || 'Playing';
  return `${verb} ${a.name}`;
}

const ttl = (platform) => (platform === 'discord' ? PRESENCE_TTL : PROFILE_TTL);

// Raw profile data, cached so the platforms aren't asked on every page view.
async function rawProfile(platform, env, ctx) {
  const key = new Request(`https://profile-cache.internal/raw/${platform}`);
  const hit = await caches.default.match(key);
  if (hit) return hit.json();
  const data = await SOURCES[platform](env);
  ctx.waitUntil(caches.default.put(key, Response.json(data, { headers: { 'Cache-Control': `public, max-age=${ttl(platform)}` } })));
  return data;
}

async function profile(platform, env, ctx, origin) {
  const data = await rawProfile(platform, env, ctx).catch(() => ({ name: null, handle: null, avatar: null }));
  return {
    platform,
    name: data.name,
    handle: data.handle,
    // Always a picture: the platform's own one, otherwise the GitHub one.
    avatar: `${origin}/avatar?p=${platform}`,
    own: !!data.avatar,
    presence: data.presence || null,
  };
}

async function avatar(platform, env, ctx) {
  const key = new Request(`https://profile-cache.internal/avatar/${platform}`);
  const hit = await caches.default.match(key);
  if (hit) return hit;

  let url = null;
  try { url = (await rawProfile(platform, env, ctx)).avatar; } catch (e) { /* fall back below */ }
  if (!url && platform !== 'github') {
    try { url = (await rawProfile('github', env, ctx)).avatar; } catch (e) { /* no picture */ }
  }
  if (!url) return new Response('no picture', { status: 404 });

  const img = await fetch(url, { headers: { 'User-Agent': UA } });
  const type = img.headers.get('Content-Type') || '';
  if (!img.ok || !type.startsWith('image/')) return new Response('no picture', { status: 502 });

  const res = new Response(img.body, {
    headers: { 'Content-Type': type, 'Cache-Control': `public, max-age=${AVATAR_TTL}` },
  });
  ctx.waitUntil(caches.default.put(key, res.clone()));
  return res;
}

function corsHeaders(request, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const origin = request.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0] || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    Vary: 'Origin',
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'GET') return new Response('method not allowed', { status: 405, headers: cors });

    const platform = (url.searchParams.get('p') || '').toLowerCase();
    const json = (data, status = 200, maxAge = PROFILE_TTL) => Response.json(data, {
      status, headers: { ...cors, 'Cache-Control': `public, max-age=${maxAge}` },
    });

    if (url.pathname === '/profiles') {
      return json(Object.fromEntries(await Promise.all(
        PLATFORMS.map(async (p) => [p, await profile(p, env, ctx, url.origin)]))), 200, PRESENCE_TTL);
    }
    if (!PLATFORMS.includes(platform)) {
      return json({ error: 'unknown platform', platforms: PLATFORMS }, 400);
    }
    if (url.pathname === '/avatar') {
      const res = await avatar(platform, env, ctx);
      const out = new Response(res.body, res);
      Object.entries(cors).forEach(([k, v]) => out.headers.set(k, v));
      return out;
    }
    if (url.pathname === '/profile' || url.pathname === '/') {
      return json(await profile(platform, env, ctx, url.origin), 200, ttl(platform));
    }
    return new Response('not found', { status: 404, headers: cors });
  },
};
