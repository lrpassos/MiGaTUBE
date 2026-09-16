export type ContentType = 'music' | 'video' | 'channel';

export type MusicSource = 'all' | 'youtube' | 'jamendo' | 'soundcloud';

export interface Track {
  id: string;
  youtubeId: string;
  audioUrl?: string; // Direct audio stream (100% permission / no restriction)
  sourceUrl?: string; // Source resolution URL (e.g. progressive stream endpoint)
  source?: 'youtube' | 'jamendo' | 'soundcloud' | 'audius';
  isUnrestricted?: boolean; // Verified embeddable or free open playback
  title: string;
  artist: string;
  channelTitle?: string;
  thumbnail: string;
  duration?: string;
  durationSec?: number;
  type: ContentType;
  album?: string;
  genre?: string;
  viewCount?: string;
  publishedAt?: string;
}

export interface ArtistInfo {
  id: string;
  name: string;
  thumbnail: string;
  banner?: string;
  genre?: string;
  bio?: string;
  subscribers?: string;
  topTracks: Track[];
  topVideos: Track[];
  relatedArtists?: { name: string; thumbnail: string; genre: string }[];
}

export interface AlbumInfo {
  id: string;
  title: string;
  artist: string;
  year?: string;
  thumbnail: string;
  genre?: string;
  tracks: Track[];
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
  isSystem?: boolean;
}

export type NavigationTab = 
  | 'home' 
  | 'search' 
  | 'favorites' 
  | 'playlists' 
  | 'history' 
  | 'artist' 
  | 'album' 
  | 'settings';

export type SearchFilter = 'TODOS' | 'SEM RESTRIÇÃO' | 'MÚSICAS' | 'VÍDEOS' | 'PLAYLISTS' | 'CANAIS';

export interface YouTubePlaylist {
  id: string;
  title: string;
  videoCount?: string;
  author?: string;
  thumbnail?: string;
  firstVideoId?: string;
}

export interface SearchResponse {
  results: Track[];
  playlists?: YouTubePlaylist[];
  suggestions?: string[];
  correctedQuery?: string;
  query: string;
  total: number;
  source?: string;
  countsBySource?: {
    all: number;
    youtube: number;
    jamendo: number;
    soundcloud: number;
  };
}

export interface AppSettings {
  vinylAnimation: boolean;
  vuMeterEnabled: boolean;
  autoplay: boolean;
  quality: 'auto' | 'high' | 'medium';
  hifiAudioBoost: boolean;
}
