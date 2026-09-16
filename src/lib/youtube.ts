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
  source: MusicSource = 'all',
  pageToken?: string
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

  const params = new URLSearchParams({
    q: cleanQ,
    filter,
    source,
  });
  if (pageToken) {
    params.set('pageToken', pageToken);
  }

  const res = await fetch(`/api/music/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Não foi possível realizar a pesquisa. Verifique a conexão ou a configuração da API.');
  }

  const data = await res.json();
  if (!data || (!Array.isArray(data.results) && !Array.isArray(data.playlists))) {
    return {
      results: [],
      playlists: [],
      suggestions: [],
      query: cleanQ,
      total: 0,
      countsBySource: { all: 0, youtube: 0, jamendo: 0, soundcloud: 0 },
    };
  }

  return {
    results: Array.isArray(data.results) ? data.results : [],
    playlists: Array.isArray(data.playlists) ? data.playlists : [],
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    correctedQuery: data.correctedQuery,
    nextPageToken: data.nextPageToken,
    query: cleanQ,
    total: data.total || (data.results?.length || 0) + (data.playlists?.length || 0),
    source: data.source,
    countsBySource: data.countsBySource || {
      all: (data.results?.length || 0) + (data.playlists?.length || 0),
      youtube: (data.results || []).filter((r: Track) => r.source === 'youtube').length,
      jamendo: (data.results || []).filter((r: Track) => r.source === 'jamendo').length,
      soundcloud: (data.results || []).filter((r: Track) => r.source === 'soundcloud').length,
    },
  };
}

export const searchYouTube = searchMusic;
