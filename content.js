// Shared content for every edition of the site. Edit projects and links here.
window.SITE = {
  name: 'eierman',
  realName: 'Felix',
  handle: 'eierman324',
  tagline: 'IT, e-scooter tuning and breaking game mechanics for fun.',
  intro: "Hi, I'm Felix. I work in IT, tune e-scooters past their limits and like finding the spot where a game stops working as intended. Whatever bugs me along the way turns into a small tool.",

  links: [
    { id: 'github',     label: 'GitHub',     url: 'https://github.com/eierman324' },
    { id: 'discord',    label: 'Discord',    url: 'https://discord.com/users/1253218430396403714' },
    { id: 'tiktok',     label: 'TikTok',     url: 'https://www.tiktok.com/@eierman.cc' },
    { id: 'youtube',    label: 'YouTube',    url: 'https://www.youtube.com/@eierman324' },
    { id: 'steam',      label: 'Steam',      url: 'https://steamcommunity.com/id/eierman324/' },
    { id: 'anilist',    label: 'AniList',    url: 'https://anilist.co/user/eierman324/animelist' },
    { id: 'faceit',     label: 'FACEIT',     url: 'https://www.faceit.com/de/players/eierman324' }
  ],

  groups: [
    { id: 'games', label: 'Games and Minecraft' },
    { id: 'tools', label: 'Tools and userscripts' },
    { id: 'scooters', label: 'Scooters' },
    { id: 'contrib', label: 'Contributions' }
  ],

  projects: [
    { name: 'StormReport', group: 'games', tech: 'C#', year: 2026, url: 'https://github.com/eierman324/StormReport',
      desc: 'Counts the chests you open in Fortnite, match after match, from your replays, with an in-game overlay.' },
    { name: 'FabisOSC', group: 'games', tech: 'Java', year: 2026, url: 'https://github.com/eierman324/FabisOSC',
      desc: 'An orbital strike cannon for Minecraft, as a Paper plugin and a Fabric mod.' },
    { name: 'DomainGate', group: 'games', tech: 'Java', year: 2026, url: 'https://github.com/eierman324/DomainGate',
      desc: 'Minecraft server plugin that blocks, redirects or shows a custom MOTD depending on the domain players connect with.' },
    { name: 'All-Basis-Items', group: 'games', tech: 'Python', year: 2026, url: 'https://github.com/eierman324/All-Basis-Items',
      desc: "Exports every Minecraft item and recipe from the server's data generator." },
    { name: 'anidl-renamer', group: 'tools', tech: 'Userscript', year: 2026, url: 'https://github.com/eierman324/anidl-renamer',
      desc: 'Renames episodes downloaded with the AniWorld Downloader web UI to their real titles, with undo.' },
    { name: 'fakecrime-music-import', group: 'tools', tech: 'Userscript', year: 2026, url: 'https://github.com/eierman324/fakecrime-music-import',
      desc: 'Adds songs to your fakecrime.bio music player from a SoundCloud or YouTube link, with cover and title filled in.' },
    { name: 'horimiya-manga-order', group: 'tools', tech: 'Python', year: 2026, url: 'https://github.com/eierman324/horimiya-manga-order',
      desc: 'Recuts Horimiya and The Missing Pieces into manga order, one file per volume.' },
    { name: 'RecordPlayer', group: 'tools', tech: 'C# / WPF', year: 2026, url: 'https://github.com/eierman324/RecordPlayer',
      desc: 'Windows tray app that plays an audio input live, for record players and anything else on line-in.' },
    { name: 'G2MApp', group: 'scooters', tech: 'Web Bluetooth', year: 2025, url: 'https://eierman324.github.io/G2MApp/',
      desc: 'Web app that talks to the KuKirin G2 Master over Bluetooth: gears, lights, lock, cruise control and live stats.' },
    { name: 'AniWorld Downloader: Mediathek', group: 'contrib', tech: 'Python', year: 2026, url: 'https://github.com/eierman324/AniWorld-Downloader',
      desc: "Adds downloads from the public broadcasters' media libraries (ARD, ZDF, Arte, 3sat, ORF, SRF and more) via MediathekView. Pull request to the original project is open." }
  ],

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
