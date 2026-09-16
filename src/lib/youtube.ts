import { Track, SearchFilter, SearchResponse, YouTubePlaylist, MusicSource } from '../types';
import { FEATURED_TRACKS } from './curatedData';

export type { SearchResponse, YouTubePlaylist };

export async function fetchSuggestions(query: string): Promise<string[]> {
  const cleanQ = query.trim();
  if (!cleanQ) return [];

  try {
    const res = await fetch(`/api/youtube/suggestions?q=${encodeURIComponent(cleanQ)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.suggestions)) {
        return data.suggestions;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch suggestions from server', e);
  }
  return [];
}

export async function fetchPlaylistTracks(playlistId: string): Promise<Track[]> {
  if (!playlistId) return [];

  try {
    const res = await fetch(`/api/youtube/playlist?id=${encodeURIComponent(playlistId)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.tracks) && data.tracks.length > 0) {
        return data.tracks;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch playlist tracks from server', e);
  }
  return [];
}

export async function resolveStreamUrl(sourceUrl: string): Promise<string | null> {
  if (!sourceUrl) return null;
  try {
    const res = await fetch(`/api/music/resolve?url=${encodeURIComponent(sourceUrl)}`);
    if (res.ok) {
      const data = await res.json();
      return data.streamUrl || null;
    }
  } catch (e) {
    console.warn('Failed to resolve stream URL', e);
  }
  return null;
}

export async function searchMusic(
  query: string,
  filter: SearchFilter = 'TODOS',
  source: MusicSource = 'all'
): Promise<SearchResponse> {
  const cleanQ = query.trim();
  if (!cleanQ) {
    return {
      results: [],
      playlists: [],
      suggestions: [],
      query: '',
      total: 0,
      countsBySource: { all: 0, youtube: 0, jamendo: 0, soundcloud: 0 },
    };
  }

  try {
    const res = await fetch(
      `/api/music/search?q=${encodeURIComponent(cleanQ)}&filter=${encodeURIComponent(filter)}&source=${encodeURIComponent(source)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data && (Array.isArray(data.results) || Array.isArray(data.playlists))) {
        return {
          results: Array.isArray(data.results) ? data.results : [],
          playlists: Array.isArray(data.playlists) ? data.playlists : [],
          suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
          correctedQuery: data.correctedQuery,
          query: cleanQ,
          total: (data.results?.length || 0) + (data.playlists?.length || 0),
          source: data.source,
          countsBySource: data.countsBySource || {
            all: data.results?.length || 0,
            youtube: (data.results || []).filter((r: Track) => r.source === 'youtube').length,
            jamendo: (data.results || []).filter((r: Track) => r.source === 'jamendo').length,
            soundcloud: (data.results || []).filter((r: Track) => r.source === 'soundcloud').length,
          },
        };
      }
    }
  } catch (err) {
    console.warn('Network request to /api/music/search failed, using client fallback', err);
  }

  // Client-side fallback matching
  const lower = cleanQ.toLowerCase();
  let matched = FEATURED_TRACKS.filter(t => {
    return (
      t.title.toLowerCase().includes(lower) ||
      t.artist.toLowerCase().includes(lower) ||
      (t.genre && t.genre.toLowerCase().includes(lower)) ||
      (t.album && t.album.toLowerCase().includes(lower))
    );
  });

  if (filter === 'MÚSICAS') {
    matched = matched.filter(t => t.type === 'music');
  } else if (filter === 'VÍDEOS') {
    matched = matched.filter(t => t.type === 'video');
  }

  return {
    results: matched,
    playlists: [],
    suggestions: [cleanQ, `${cleanQ} Greatest Hits`, `${cleanQ} Playlist`],
    query: cleanQ,
    total: matched.length,
    source: 'client_curated_fallback',
    countsBySource: { all: matched.length, youtube: matched.length, jamendo: 0, soundcloud: 0 },
  };
}

export const searchYouTube = searchMusic;
