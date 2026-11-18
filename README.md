# eierman324 profile Worker

Cloudflare Worker that serves the profile pictures and names for [eierman.cc](https://eierman.cc). It fetches them live from GitHub, TikTok, YouTube, Steam, AniList and FACEIT; platforms without a picture get the GitHub one.

| Request | Answer |
|---|---|
| `/profile?p=tiktok` | `{"platform","name","handle","avatar","own"}` |
| `/profiles` | the same for every platform |
| `/avatar?p=tiktok` | the picture itself |

Platforms: `github`, `tiktok`, `youtube`, `steam`, `anilist`, `faceit`, `discord`, `soundcloud`.

Profiles are cached for 10 minutes and pictures for an hour, so the platforms aren't asked on every page view.

## Deploy

In Cloudflare: **Workers & Pages → Create → Import a repository**, pick `eierman324/eierman324`, then set the production branch to `profile-worker` (Settings → Build → Branch control). Cloudflare runs `npx wrangler deploy` on every push.

Usernames and the pages allowed to call the Worker are under `vars` in [`wrangler.jsonc`](wrangler.jsonc).

Afterwards put the Worker's address (for example `https://eierman324.<your-subdomain>.workers.dev`) into `PROFILE_API` at the top of `app.js` on the `website` branch.
