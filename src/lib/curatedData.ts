import { Track, Playlist, ArtistInfo, AlbumInfo } from '../types';

export const FEATURED_TRACKS: Track[] = [
  {
    id: 'bm-1',
    youtubeId: 'NOyRsPDPfMM',
    title: 'Three Little Birds',
    artist: 'Bob Marley & The Wailers',
    channelTitle: 'Bob Marley Official',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    duration: '3:00',
    durationSec: 180,
    type: 'music',
    album: 'Exodus',
    genre: 'Reggae',
    viewCount: '240M visualizações',
    isUnrestricted: true,
    source: 'youtube',
  },
  {
    id: 'bm-2',
    youtubeId: 'co2FK0WbXX0',
    title: 'Is This Love',
    artist: 'Bob Marley & The Wailers',
    channelTitle: 'Bob Marley Official',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    duration: '3:52',
    durationSec: 232,
    type: 'music',
    album: 'Kaya',
    genre: 'Reggae',
    viewCount: '310M visualizações',
    isUnrestricted: true,
    source: 'youtube',
  },
  {
    id: 'bm-3',
    youtubeId: 'cUS8MA5vptA',
    title: 'One Love / People Get Ready',
    artist: 'Bob Marley & The Wailers',
    channelTitle: 'Bob Marley Official',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    duration: '2:52',
    durationSec: 172,
    type: 'music',
    album: 'Exodus',
    genre: 'Reggae',
    viewCount: '190M visualizações',
    isUnrestricted: true,
    source: 'youtube',
  },
  {
    id: 'bm-4',
    youtubeId: 'kOFu6b3w6c0',
    title: 'Redemption Song',
    artist: 'Bob Marley & The Wailers',
    channelTitle: 'Bob Marley Official',
    thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    duration: '3:47',
    durationSec: 227,
    type: 'music',
    album: 'Uprising',
    genre: 'Reggae',
    viewCount: '175M visualizações',
    isUnrestricted: true,
    source: 'youtube',
  },
  {
    id: 'bm-5',
    youtubeId: 'pHlSE9j5FGY',
    title: 'No Woman No Cry (Original)',
    artist: 'Bob Marley & The Wailers',
    channelTitle: 'Bob Marley Official',
    thumbnail: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&auto=format&fit=crop&q=80',
    duration: '4:06',
    durationSec: 246,
    type: 'music',
    album: 'Natty Dread',
    genre: 'Reggae',
    viewCount: '120M visualizações',
    isUnrestricted: true,
    source: 'youtube',
  },
  // Michael Jackson
  {
    id: 'mj-1',
    youtubeId: 'Zi_XLOBDo_Y',
    title: 'Billie Jean (Official Video)',
    artist: 'Michael Jackson',
    channelTitle: 'Michael Jackson',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    duration: '4:56',
    durationSec: 296,
    type: 'video',
    album: 'Thriller',
    genre: 'Pop',
    viewCount: '1.4B visualizações',
    isUnrestricted: true,
    source: 'youtube',
  },
  {
    id: 'mj-2',
    youtubeId: 'sOnqjkJTMaA',
    title: 'Thriller (Official 4K Video)',
    artist: 'Michael Jackson',
    channelTitle: 'Michael Jackson',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    duration: '13:42',
    durationSec: 822,
    type: 'video',
    album: 'Thriller',
    genre: 'Pop',
    viewCount: '1.0B visualizações',
    isUnrestricted: true,
    source: 'youtube',
  },
  {
    id: 'mj-3',
    youtubeId: 'oRdxUFDoQe0',
    title: 'Beat It',
    artist: 'Michael Jackson',
    channelTitle: 'Michael Jackson',
    thumbnail: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=600&auto=format&fit=crop&q=80',
    duration: '4:59',
    durationSec: 299,
    type: 'music',
    album: 'Thriller',
    genre: 'Pop',
    viewCount: '950M visualizações',
    isUnrestricted: true,
    source: 'youtube',
  },
  // Queen & Rock
  {
    id: 'qn-1',
    youtubeId: 'fJ9rUzIMcZQ',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    channelTitle: 'Queen Official',
    thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
    duration: '5:55',
    durationSec: 355,
    type: 'video',
    album: 'A Night at the Opera',
    genre: 'Rock',
    viewCount: '1.6B visualizações',
    isUnrestricted: true,
    source: 'youtube',
  },
  {
    id: 'cp-1',
    youtubeId: '1G4isv_Fylg',
    title: 'Paradise',
    artist: 'Coldplay',
    channelTitle: 'Coldplay',
    thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80',
    duration: '4:20',
    durationSec: 260,
    type: 'video',
    album: 'Mylo Xyloto',
    genre: 'Rock',
    viewCount: '1.8B visualizações',
    isUnrestricted: true,
    source: 'youtube',
  },
  // MPB & Samba (Verified Unrestricted IDs)
  {
    id: 'mpb-1',
    youtubeId: '8mcsaEqrbfU',
    title: 'Garota de Ipanema',
    artist: 'Tom Jobim & Vinicius de Moraes',
    channelTitle: 'Bossa Nova Brasil',
    thumbnail: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=80',
    duration: '3:15',
    durationSec: 195,
    type: 'music',
    album: 'The Composer of Desafinado, Plays',
    genre: 'MPB',
    viewCount: '45M visualizações',
    isUnrestricted: true,
    source: 'youtube',
  },
  {
    id: 'mpb-2',
    youtubeId: 'k1-TrAvp_xs',
    title: 'Águas de Março',
    artist: 'Elis Regina & Tom Jobim',
    channelTitle: 'Elis Regina',
    thumbnail: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80',
    duration: '3:32',
    durationSec: 212,
    type: 'music',
    album: 'Elis & Tom',
    genre: 'MPB',
    viewCount: '80M visualizações',
    isUnrestricted: true,
    source: 'youtube',
  },
  {
    id: 'jz-1',
    youtubeId: 'vmDDOFXSgAs',
    title: 'Take Five',
    artist: 'Dave Brubeck Quartet',
    channelTitle: 'Jazz Classics',
    thumbnail: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=600&auto=format&fit=crop&q=80',
    duration: '5:24',
    durationSec: 324,
    type: 'music',
    album: 'Time Out',
    genre: 'Jazz',
    viewCount: '85M visualizações',
    isUnrestricted: true,
    source: 'youtube',
  },
  {
    id: 'smb-1',
    youtubeId: '6d6fIM54Vkk',
    title: 'Não Deixe o Samba Morrer',
    artist: 'Alcione',
    channelTitle: 'Alcione Oficial',
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    duration: '4:18',
    durationSec: 258,
    type: 'music',
    album: 'A Voz do Samba',
    genre: 'Samba',
    viewCount: '52M visualizações',
    isUnrestricted: true,
    source: 'youtube',
  },
  // Audius Open Music source (100% libre de restrição)
  {
    id: 'aud-bm-open',
    youtubeId: '',
    audioUrl: 'https://discoveryprovider.audius.co/v1/tracks/5xwv3gY/stream?app_name=MiGaTUBE',
    title: 'Wanna Love (feat. Bob Marley Vibe)',
    artist: 'EIME & Open Reggae Collective',
    channelTitle: 'Audius Hi-Fi Stream',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    duration: '3:45',
    durationSec: 225,
    type: 'music',
    album: 'Roads to the Sun',
    genre: 'Reggae',
    viewCount: 'Livre de Restrição • Audius',
    isUnrestricted: true,
    source: 'audius',
  }
];

export const GENRE_CATEGORIES = [
  { name: 'Reggae', query: 'REGGAE', icon: 'Sun', color: 'from-emerald-900 to-green-950', count: '5.2k faixas' },
  { name: 'Rock', query: 'ROCK', icon: 'Flame', color: 'from-zinc-900 to-emerald-950', count: '12k faixas' },
  { name: 'MPB', query: 'MPB', icon: 'Compass', color: 'from-teal-950 to-green-900', count: '4.8k faixas' },
  { name: 'Samba', query: 'SAMBA', icon: 'Sparkles', color: 'from-green-950 to-emerald-900', count: '3.9k faixas' },
  { name: 'Pop', query: 'POP', icon: 'Music', color: 'from-zinc-900 to-teal-950', count: '20k faixas' },
  { name: 'Jazz', query: 'JAZZ', icon: 'Radio', color: 'from-emerald-950 to-black', count: '2.5k faixas' },
];

export const SUGGESTED_SEARCHES = [
  'BOB MARLEY',
  'MICHAEL JACKSON',
  'REGGAE',
  'ROCK',
  'MPB',
  'SAMBA',
  'POP',
  'JAZZ',
  'QUEEN',
  'COLDPLAY',
  'TIM MAIA',
  'JORGE BEN JOR'
];

export const ARTISTS_DATABASE: Record<string, ArtistInfo> = {
  'bob marley': {
    id: 'artist-bob-marley',
    name: 'Bob Marley',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
    genre: 'Reggae / Roots Rock',
    bio: 'Ícone supremo do reggae e embaixador mundial da paz e união através da música. Líder do The Wailers com clássicos imortais que ecoam globalmente.',
    subscribers: '14.8M inscritos',
    topTracks: FEATURED_TRACKS.filter(t => t.artist.toLowerCase().includes('marley')),
    topVideos: [
      {
        id: 'bm-v1',
        youtubeId: 'IT8XvxBLJKs',
        title: 'Bob Marley - No Woman No Cry (Live at The Lyceum)',
        artist: 'Bob Marley & The Wailers',
        thumbnail: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&auto=format&fit=crop&q=80',
        duration: '7:09',
        type: 'video',
        viewCount: '98M visualizações',
      },
      {
        id: 'bm-v2',
        youtubeId: 'mGVGIbflG_M',
        title: 'Bob Marley - Three Little Birds (Official Music Video)',
        artist: 'Bob Marley & The Wailers',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        duration: '3:00',
        type: 'video',
        viewCount: '240M visualizações',
      },
      {
        id: 'bm-v3',
        youtubeId: '69RdQFDuYlo',
        title: 'Bob Marley - Is This Love (Official Video)',
        artist: 'Bob Marley & The Wailers',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        duration: '3:52',
        type: 'video',
        viewCount: '310M visualizações',
      }
    ],
    relatedArtists: [
      { name: 'Peter Tosh', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80', genre: 'Reggae' },
      { name: 'Jimmy Cliff', thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&auto=format&fit=crop&q=80', genre: 'Reggae' },
      { name: 'Ziggy Marley', thumbnail: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=300&auto=format&fit=crop&q=80', genre: 'Roots Reggae' },
    ]
  },
  'michael jackson': {
    id: 'artist-michael-jackson',
    name: 'Michael Jackson',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&auto=format&fit=crop&q=80',
    genre: 'Pop / Dance / R&B',
    bio: 'Rei do Pop, cantor, dançarino e compositor lendário. Autor dos álbuns mais vendidos da história fonográfica mundial com performances inesquecíveis.',
    subscribers: '31.2M inscritos',
    topTracks: FEATURED_TRACKS.filter(t => t.artist.toLowerCase().includes('michael jackson')),
    topVideos: [
      {
        id: 'mj-v1',
        youtubeId: 'Zi_XLOBDo_Y',
        title: 'Michael Jackson - Billie Jean (Short Film)',
        artist: 'Michael Jackson',
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
        duration: '4:56',
        type: 'video',
        viewCount: '1.4B visualizações'
      },
      {
        id: 'mj-v2',
        youtubeId: 'sOnqjkJTMaA',
        title: 'Michael Jackson - Thriller (Official Video)',
        artist: 'Michael Jackson',
        thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
        duration: '13:42',
        type: 'video',
        viewCount: '1.0B visualizações'
      }
    ],
    relatedArtists: [
      { name: 'Prince', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80', genre: 'Pop / Funk' },
      { name: 'Stevie Wonder', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80', genre: 'Soul' },
      { name: 'Janet Jackson', thumbnail: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=300&auto=format&fit=crop&q=80', genre: 'Pop / R&B' }
    ]
  }
};

export const FEATURED_ALBUMS: AlbumInfo[] = [
  {
    id: 'album-exodus',
    title: 'Exodus',
    artist: 'Bob Marley & The Wailers',
    year: '1977',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    genre: 'Reggae',
    tracks: [
      FEATURED_TRACKS[0], // Three Little Birds
      FEATURED_TRACKS[2], // One Love
      FEATURED_TRACKS[3], // Redemption Song
    ]
  },
  {
    id: 'album-thriller',
    title: 'Thriller',
    artist: 'Michael Jackson',
    year: '1982',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    genre: 'Pop / Rock / Funk',
    tracks: [
      FEATURED_TRACKS[5], // Billie Jean
      FEATURED_TRACKS[6], // Thriller
      FEATURED_TRACKS[7], // Beat It
    ]
  },
  {
    id: 'album-elis-tom',
    title: 'Elis & Tom',
    artist: 'Elis Regina & Tom Jobim',
    year: '1974',
    thumbnail: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80',
    genre: 'MPB / Bossa Nova',
    tracks: [
      FEATURED_TRACKS[10], // Garota de Ipanema
      FEATURED_TRACKS[11], // Águas de Março
    ]
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-reggae-classics',
    name: 'Reggae Classics',
    description: 'Vibrações positivas e o melhor do reggae mundial.',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    tracks: [
      FEATURED_TRACKS[0],
      FEATURED_TRACKS[1],
      FEATURED_TRACKS[2],
      FEATURED_TRACKS[3],
      FEATURED_TRACKS[4],
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSystem: true,
  },
  {
    id: 'playlist-rock-essentials',
    name: 'Rock Essentials',
    description: 'Grandes hinos do rock para aumentar o volume.',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
    tracks: [
      FEATURED_TRACKS[8],
      FEATURED_TRACKS[9],
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSystem: true,
  },
  {
    id: 'playlist-favoritas',
    name: 'Minhas Favoritas',
    description: 'Faixas selecionadas a dedo para ouvir a qualquer hora.',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    tracks: [
      FEATURED_TRACKS[0],
      FEATURED_TRACKS[5],
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSystem: false,
  },
  {
    id: 'playlist-viagem',
    name: 'Para Viajar',
    description: 'Trilha sonora ideal para pegar a estrada e relaxar.',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    tracks: [
      FEATURED_TRACKS[1],
      FEATURED_TRACKS[2],
      FEATURED_TRACKS[10],
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSystem: false,
  },
  {
    id: 'playlist-trabalho',
    name: 'Músicas para Trabalhar',
    description: 'Foco, ritmo suave e atmosfera criativa.',
    coverUrl: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=600&auto=format&fit=crop&q=80',
    tracks: [
      FEATURED_TRACKS[12],
      FEATURED_TRACKS[11],
      FEATURED_TRACKS[0],
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSystem: false,
  }
];

export interface FeaturedArtist {
  id: string;
  name: string;
  genre: string;
  avatarUrl: string;
  coverUrl?: string;
  bio?: string;
  subscribers?: string;
}

export const FEATURED_ARTISTS: FeaturedArtist[] = [
  {
    id: 'art-mm',
    name: 'Marília Mendonça',
    genre: 'Sertanejo',
    avatarUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
    bio: 'A eterna Rainha da Sofrência e maior voz feminina do sertanejo contemporâneo.',
    subscribers: '26.5M inscritos',
  },
  {
    id: 'art-bm',
    name: 'Bob Marley',
    genre: 'Reggae',
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
    bio: 'Ícone supremo do reggae mundial, espalhando amor, união e espiritualidade em cada vinil.',
    subscribers: '14.8M inscritos',
  },
  {
    id: 'art-cp',
    name: 'Coldplay',
    genre: 'Rock / Pop',
    avatarUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    bio: 'Banda britânica aclamada mundialmente por shows épicos e melodias inesquecíveis.',
    subscribers: '25.0M inscritos',
  },
  {
    id: 'art-alok',
    name: 'Alok',
    genre: 'Eletrônica',
    avatarUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&auto=format&fit=crop&q=80',
    bio: 'Maior DJ brasileiro de alcance global, presença constante nos maiores festivais do planeta.',
    subscribers: '16.0M inscritos',
  },
  {
    id: 'art-qn',
    name: 'Queen',
    genre: 'Rock Clássico',
    avatarUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&auto=format&fit=crop&q=80',
    bio: 'Lendas do rock britânico com hinos eternos liderados por Freddie Mercury.',
    subscribers: '17.5M inscritos',
  },
  {
    id: 'art-adele',
    name: 'Adele',
    genre: 'Pop / Soul',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200&auto=format&fit=crop&q=80',
    bio: 'Uma das vozes mais poderosas e aclamadas do século, recordista de prêmios Grammy.',
    subscribers: '30.1M inscritos',
  },
  {
    id: 'art-lud',
    name: 'Ludmilla',
    genre: 'Pop / Pagode',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
    bio: 'Vencedora do Grammy Latino e fenômeno brasileiro do Numanice e funk/pop.',
    subscribers: '9.2M inscritos',
  },
  {
    id: 'art-mj',
    name: 'Michael Jackson',
    genre: 'Pop',
    avatarUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&auto=format&fit=crop&q=80',
    bio: 'O Rei do Pop, revolucionou a indústria fonográfica e os videoclipes musicais.',
    subscribers: '28.2M inscritos',
  },
  {
    id: 'art-tm',
    name: 'Tom Jobim',
    genre: 'MPB / Bossa',
    avatarUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200&auto=format&fit=crop&q=80',
    bio: 'Um dos maiores compositores do século XX e arquiteto supremo da Bossa Nova.',
    subscribers: '3.1M inscritos',
  },
];

export interface GenreItem {
  name: string;
  coverUrl: string;
}

export const GENRES: GenreItem[] = [
  { name: 'Reggae', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80' },
  { name: 'Rock', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80' },
  { name: 'MPB', coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80' },
  { name: 'Pop', coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80' },
  { name: 'Jazz', coverUrl: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=600&auto=format&fit=crop&q=80' },
  { name: 'Samba', coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80' },
];

