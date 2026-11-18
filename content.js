// Shared content for every edition of the site: intro, links, facts, anime. Projects are in projects.json.
window.SITE = {
  name: 'eierman',
  realName: 'Felix',
  handle: 'eierman324',
  tagline: 'IT, e-scooter tuning and breaking game mechanics for fun.',
  intro: "Hi, I'm Felix. I work in IT, tune e-scooters past their limits and like finding the spot where a game stops working as intended. Whatever bugs me along the way turns into a small tool.",

  // The links shown on every edition, in this order.
  // "icon" names an icon from ICONS below (used where an edition shows icons).
  links: [
    { id: 'fakecrime', label: 'fakecrime', url: 'https://fakecrime.bio/eierman', icon: 'link' },
    { id: 'discord',   label: 'Discord',   url: 'https://discord.com/users/1253218430396403714', icon: 'discord' },
    { id: 'tiktok',    label: 'TikTok',    url: 'https://www.tiktok.com/@eierman.cc', icon: 'tiktok' },
    { id: 'anilist',   label: 'AniList',   url: 'https://anilist.co/user/eierman324/animelist', icon: 'anilist' }
  ],

  // Single-colour icons (24x24, drawn in currentColor). Brand shapes from Simple Icons (CC0),
  // "link" from Lucide (ISC).
  ICONS: {
    discord: '<path fill="currentColor" d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>',
    tiktok: '<path fill="currentColor" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>',
    anilist: '<path fill="currentColor" d="M24 17.53v2.421c0 .71-.391 1.101-1.1 1.101h-5l-.057-.165L11.84 3.736c.106-.502.46-.788 1.053-.788h2.422c.71 0 1.1.391 1.1 1.1v12.38H22.9c.71 0 1.1.392 1.1 1.101zM11.034 2.947l6.337 18.104h-4.918l-1.052-3.131H6.019l-1.077 3.131H0L6.361 2.948h4.673zm-.66 10.96-1.69-5.014-1.666 5.015h3.357z"/>',
    link: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></g>'
  },

  // Groups and projects live in projects.json.

  facts: [
    { label: 'Scooters', text: 'Modding them and making them faster than intended. Only SHU so far, VESC is next.' },
    { label: 'Games', text: 'Fortnite right now, Valorant for shooters, Minecraft SMPs with friends, and Roblox on my second channel.' },
    { label: 'Homelab', text: 'A NAS with Docker running Jellyfin, Immich, Nextcloud and friends, reachable through Pangolin and Cloudflare.' },
    { label: 'Anime', text: "Romance, drama and slice of life. If it makes me cry, it's good." }
  ],

  anime: [
    { title: 'Your lie in April', url: 'https://anilist.co/anime/20665', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20665-TLgkL8T8IRFd.png' },
    { title: 'Rascal Does Not Dream of Bunny Girl Senpai', url: 'https://anilist.co/anime/101291', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx101291-wfEdgPqtfU0l.jpg' },
    { title: 'Call of the Night', url: 'https://anilist.co/anime/141391', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx141391-M3ZgUKTPENUk.jpg' },
    { title: 'Charlotte', url: 'https://anilist.co/anime/20997', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20997-axVYrsIfjtYJ.jpg' },
    { title: 'DARLING in the FRANXX', url: 'https://anilist.co/anime/99423', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/nx99423-8MBxtwCeHf8B.png' },
    { title: 'Cyberpunk: Edgerunners', url: 'https://anilist.co/anime/120377', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx120377-ayZPoxiWt4Li.jpg' }
  ],

  // Edition id -> label and the hosts that count as coming from there.
  editions: [
    { id: 'tiktok',     label: 'TikTok',     hosts: ['tiktok.com'] },
    { id: 'youtube',    label: 'YouTube',    hosts: ['youtube.com', 'youtu.be'] },
    { id: 'github',     label: 'GitHub',     hosts: ['github.com'] },
    { id: 'steam',      label: 'Steam',      hosts: ['steamcommunity.com', 'steampowered.com'] },
    { id: 'soundcloud', label: 'SoundCloud', hosts: ['soundcloud.com'] },
    { id: 'anilist',    label: 'AniList',    hosts: ['anilist.co'] },
    { id: 'faceit',     label: 'FACEIT',     hosts: ['faceit.com'] },
    { id: 'discord',    label: 'Discord',    hosts: ['discord.com', 'discord.gg', 'discordapp.com'] }
  ]
};
