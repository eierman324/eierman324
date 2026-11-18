// Shared content for every edition of the site: intro, links, facts, anime. Projects are in projects.json.
window.SITE = {
  name: 'eierman',
  realName: 'Felix',
  handle: 'eierman324',
  tagline: 'IT, e-scooter tuning and breaking game mechanics for fun.',
  intro: "Hi, I'm Felix. I work in IT, tune e-scooters past their limits and like finding the spot where a game stops working as intended. Whatever bugs me along the way turns into a small tool.",

  // The links shown on every edition, in this order.
  links: [
    { id: 'fakecrime', label: 'fakecrime', url: 'https://fakecrime.bio/eierman' },
    { id: 'discord',   label: 'Discord',   url: 'https://discord.com/users/1253218430396403714' },
    { id: 'tiktok',    label: 'TikTok',    url: 'https://www.tiktok.com/@eierman.cc' },
    { id: 'anilist',   label: 'AniList',   url: 'https://anilist.co/user/eierman324/animelist' }
  ],

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
