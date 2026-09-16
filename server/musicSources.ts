import type { Track, YouTubePlaylist } from '../src/types.ts';

const JAMENDO_CLIENT_ID = '49daa4f5';
const SOUNDCLOUD_CLIENT_ID = 'Pb72ranhoyt6gw7hM7TkzUItXlMWSNSo';

// Utility: format seconds into MM:SS or HH:MM:SS
export function formatSecondsToTime(totalSec: number): string {
  if (!totalSec || isNaN(totalSec) || totalSec <= 0) return '3:30';
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = Math.floor(totalSec % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function decodeEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// ----------------------------------------------------
// 1. JAMENDO SEARCH ENGINE
// ----------------------------------------------------
export async function searchJamendo(query: string, limit: number = 20): Promise<Track[]> {
  try {
    const cleanQ = query.trim();
    if (!cleanQ) return [];

    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&namesearch=${encodeURIComponent(cleanQ)}&include=musicinfo&audioformat=mp31`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'MiGaTUBE/2.0 (Audio/Web)',
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (data.headers?.status !== 'success' || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item: any) => {
      const durSec = parseInt(item.duration, 10) || 200;
      const formattedDur = formatSecondsToTime(durSec);
      const thumbnail =
        item.image ||
        item.album_image ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

      return {
        id: `jam-${item.id}`,
        youtubeId: '',
        audioUrl: item.audio,
        source: 'jamendo',
        isUnrestricted: true,
        title: decodeEntities(item.name || 'Música Jamendo'),
        artist: decodeEntities(item.artist_name || 'Artista Independente'),
        channelTitle: `${decodeEntities(item.artist_name)} (Jamendo Music)`,
        thumbnail,
        duration: formattedDur,
        durationSec: durSec,
        type: 'music',
        album: decodeEntities(item.album_name || 'Jamendo Music'),
        genre: item.musicinfo?.tags?.genres?.[0] || 'Indie / CC',
        viewCount: 'Jamendo 100% Livre',
        publishedAt: item.releasedate,
      } as Track;
    });
  } catch (err) {
    console.warn('Jamendo search error:', err);
    return [];
  }
}

// ----------------------------------------------------
// 2. SOUNDCLOUD SEARCH ENGINE
// ----------------------------------------------------
export async function searchSoundCloud(query: string, limit: number = 20): Promise<Track[]> {
  try {
    const cleanQ = query.trim();
    if (!cleanQ) return [];

    const url = `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(cleanQ)}&client_id=${SOUNDCLOUD_CLIENT_ID}&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const collection = Array.isArray(data.collection) ? data.collection : [];

    // Map tracks and batch-resolve stream URLs for progressive MP3s
    const tracks: Track[] = [];

    for (const item of collection) {
      if (!item || !item.id) continue;

      const durSec = Math.round((item.duration || 0) / 1000) || 210;
      const formattedDur = formatSecondsToTime(durSec);

      // Find progressive MP3 transcoding or fallback transcoding
      const transcodings = item.media?.transcodings || [];
      const progressiveTranscoding = transcodings.find(
        (t: any) => t.format?.protocol === 'progressive'
      );
      const hlsTranscoding = transcodings.find(
        (t: any) => t.format?.protocol === 'hls' && t.format?.mime_type?.includes('mpeg')
      );
      const chosenTranscoding = progressiveTranscoding || hlsTranscoding || transcodings[0];

      let thumbnail =
        item.artwork_url ||
        item.user?.avatar_url ||
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80';

      // Use larger SoundCloud artwork when available
      if (thumbnail.includes('large.jpg')) {
        thumbnail = thumbnail.replace('large.jpg', 't500x500.jpg');
      }

      let playbackText: string | undefined;
      if (item.playback_count) {
        if (item.playback_count >= 1000000) {
          playbackText = `${(item.playback_count / 1000000).toFixed(1)}M plays`;
        } else if (item.playback_count >= 1000) {
          playbackText = `${Math.round(item.playback_count / 1000)}k plays`;
        } else {
          playbackText = `${item.playback_count} plays`;
        }
      }

      tracks.push({
        id: `sc-${item.id}`,
        youtubeId: '',
        audioUrl: '', // Will be resolved dynamically or pre-resolved
        sourceUrl: chosenTranscoding?.url ? `${chosenTranscoding.url}?client_id=${SOUNDCLOUD_CLIENT_ID}` : undefined,
        source: 'soundcloud',
        isUnrestricted: true,
        title: decodeEntities(item.title || 'SoundCloud Track'),
        artist: decodeEntities(item.user?.username || 'SoundCloud Artist'),
        channelTitle: decodeEntities(item.user?.username || ''),
        thumbnail,
        duration: formattedDur,
        durationSec: durSec,
        type: 'music',
        album: decodeEntities(item.genre || 'SoundCloud Stream'),
        genre: item.genre || 'Eletrônica / Pop',
        viewCount: playbackText,
        publishedAt: item.created_at,
      } as Track);
    }

    // Pre-resolve the top 5 progressive stream URLs in parallel to provide instant 0ms latency playback
    const topTracks = tracks.slice(0, 5);
    await Promise.all(
      topTracks.map(async (t) => {
        if (t.sourceUrl) {
          try {
            const streamRes = await fetch(t.sourceUrl);
            if (streamRes.ok) {
              const streamData = await streamRes.json();
              if (streamData?.url) {
                t.audioUrl = streamData.url;
              }
            }
          } catch {}
        }
      })
    );

    return tracks;
  } catch (err) {
    console.warn('SoundCloud search error:', err);
    return [];
  }
}

// ----------------------------------------------------
// 3. SOUNDCLOUD RESOLVER
// ----------------------------------------------------
export async function resolveSoundCloudStream(sourceUrl: string): Promise<string | null> {
  try {
    if (!sourceUrl) return null;
    const finalUrl = sourceUrl.includes('client_id=')
      ? sourceUrl
      : `${sourceUrl}${sourceUrl.includes('?') ? '&' : '?'}client_id=${SOUNDCLOUD_CLIENT_ID}`;

    const res = await fetch(finalUrl);
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  } catch (err) {
    console.warn('Failed to resolve SoundCloud stream URL:', err);
    return null;
  }
}
