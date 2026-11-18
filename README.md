# eierman324 profile Worker

Cloudflare Worker that serves the profile pictures and names for [eierman.cc](https://eierman.cc). It fetches them live from GitHub, TikTok, YouTube, Steam, AniList, FACEIT and Twitch; platforms without a picture get the GitHub one.

| Request | Answer |
|---|---|
| `/profile?p=tiktok` | `{"platform","name","handle","avatar","own"}` |
| `/profiles` | the same for every platform |
| `/avatar?p=tiktok` | the picture itself |
| `POST /view` | counts the visitor (once per IP address, only from the allowed pages), answers `{"views"}` |
| `/views` | `{"views"}` without counting |

Platforms: `github`, `tiktok`, `youtube`, `steam`, `anilist`, `faceit`, `discord`, `soundcloud`, `twitch`.

Twitch pictures come from [decapi.me](https://decapi.me), because Twitch's own API needs an app key; the name is `TWITCH_USER`.

Discord goes through [Lanyard](https://github.com/Phineas/lanyard), which also gives the live status (`presence.state` online/idle/dnd/offline and `presence.text`). Lanyard only knows you after you join its Discord server once (discord.gg/lanyard); until then the Worker uses `DISCORD_NAME` and the GitHub picture.

Profiles are cached for 10 minutes (Discord for 1 minute, because of the status) and pictures for an hour, so the platforms aren't asked on every page view.

The view counter keeps one row per visitor in a Durable Object (SQLite). It stores a salted SHA-256 hash of the IP address, not the address; the random salt is created once inside the Durable Object and never leaves it.

## Deploy

In Cloudflare: **Workers & Pages → Create → Import a repository**, pick `eierman324/eierman324`, then set the production branch to `profile-worker` (Settings → Build → Branch control). Cloudflare runs `npx wrangler deploy` on every push.

Usernames and the pages allowed to call the Worker are under `vars` in [`wrangler.jsonc`](wrangler.jsonc).

Afterwards put the Worker's address (for example `https://eierman324.<your-subdomain>.workers.dev`) into `PROFILE_API` at the top of `app.js` on the `website` branch.
