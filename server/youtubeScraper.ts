export interface ScrapedTrack {
  id: string;
  youtubeId: string;
  audioUrl?: string; // Direct audio stream (100% permission / no restriction)
  source?: 'youtube' | 'audius';
  isUnrestricted?: boolean;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  durationSec?: number;
  type: 'music' | 'video' | 'channel';
  viewCount?: string;
  album?: string;
  channelTitle?: string;
}

export interface ScrapedPlaylist {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  videoCount: string;
  firstVideoId?: string;
}

/**
 * Fast oEmbed verification to screen out restricted YouTube videos (error 101/150)
 * Status 200 = Embed allowed without restriction
 * Status 401/403/404 = Restricted / blocked embedding
 */
export async function isYouTubeEmbeddable(videoId: string): Promise<boolean> {
  if (!videoId) return false;
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { signal: AbortSignal.timeout(1600) }
    );
    return res.status === 200;
  } catch {
    return false;
  }
}

/**
 * Alternative open music provider (Audius API)
 * Fully licensed, decentralized, zero ads, zero embed blocks, 100% playback permission
 */
export async function searchAudiusLive(query: string): Promise<ScrapedTrack[]> {
  const cleanQ = query.trim();
  if (!cleanQ) return [];
  try {
    const url = `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(cleanQ)}&app_name=MiGaTUBE`;
    const res = await fetch(url, { signal: AbortSignal.timeout(2800) });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data?.data)) return [];

    return data.data.slice(0, 10).map((item: any) => {
      const durationSec = typeof item.duration === 'number' ? item.duration : 210;
      const minutes = Math.floor(durationSec / 60);
      const seconds = Math.floor(durationSec % 60);
      const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      const thumb =
        item.artwork?.['480x480'] ||
        item.artwork?.['150x150'] ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

      return {
        id: `aud-${item.id}`,
        youtubeId: '',
        audioUrl: `https://discoveryprovider.audius.co/v1/tracks/${item.id}/stream?app_name=MiGaTUBE`,
        source: 'audius' as const,
        isUnrestricted: true,
        title: item.title || 'Música Aberta',
        artist: item.user?.name || 'Artista Audius',
        channelTitle: 'Audius Hi-Fi Stream',
        thumbnail: thumb,
        duration: durationStr,
        durationSec,
        type: 'music' as const,
        viewCount: item.play_count ? `${item.play_count} plays` : 'Hi-Fi Aberto',
        album: item.genre || 'Música Livre',
      };
    });
  } catch (err) {
    console.warn('Audius open stream search error:', err);
    return [];
  }
}

export async function fetchYouTubeSuggestions(query: string): Promise<string[]> {
  const cleanQ = query.trim();
  if (!cleanQ) return [];

  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(cleanQ)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[1])) {
        return data[1].slice(0, 8);
      }
    }
  } catch (err) {
    console.warn('Failed to fetch YouTube suggestions:', err);
  }
  return [];
}

export async function searchYouTubeLive(
  query: string,
  filter: string = 'TODOS'
): Promise<{
  results: ScrapedTrack[];
  playlists: ScrapedPlaylist[];
  suggestions: string[];
  correctedQuery?: string;
}> {
  const cleanQ = query.trim();
  if (!cleanQ) {
    return { results: [], playlists: [], suggestions: [] };
  }

  // Fetch suggestions and open music sources (Audius) in parallel
  const suggestionsPromise = fetchYouTubeSuggestions(cleanQ);
  const audiusPromise = searchAudiusLive(cleanQ);

  // Determine YouTube search URL and filter
  let searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQ)}`;
  if (filter === 'PLAYLISTS') {
    searchUrl += '&sp=EgIQAw%253D%253D'; // YouTube filter for Playlists
  } else if (filter === 'CANAIS') {
    searchUrl += '&sp=EgIQAg%253D%253D'; // YouTube filter for Channels
  }

  const parseSearchPage = async (url: string) => {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });
    const html = await res.text();
    const match = html.match(/var ytInitialData = ({.+?});<\/script>/);
    if (!match) return { tracks: [], playlists: [] };

    let data: any;
    try {
      data = JSON.parse(match[1]);
    } catch {
      return { tracks: [], playlists: [] };
    }

    const sections =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

    const tracks: ScrapedTrack[] = [];
    const playlists: ScrapedPlaylist[] = [];

    for (const s of sections) {
      const list = s?.itemSectionRenderer?.contents || [];
      for (const item of list) {
        if (item.videoRenderer) {
          const v = item.videoRenderer;
          const videoId = v.videoId;
          if (!videoId) continue;

          const title =
            v.title?.runs?.map((r: any) => r.text).join('') || v.title?.simpleText || 'Música';
          const artist =
            v.ownerText?.runs?.map((r: any) => r.text).join('') ||
            v.shortBylineText?.runs?.map((r: any) => r.text).join('') ||
            'Artista Oficial';
          const duration = v.lengthText?.simpleText || '3:30';
          const thumbnail =
            v.thumbnail?.thumbnails?.pop()?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
          const viewCount = v.viewCountText?.simpleText || '';

          const lowerTitle = title.toLowerCase();
          const isVideo =
            lowerTitle.includes('clip') ||
            lowerTitle.includes('vídeo') ||
            lowerTitle.includes('video oficial') ||
            lowerTitle.includes('clipe');

          tracks.push({
            id: `yt-${videoId}`,
            youtubeId: videoId,
            title,
            artist,
            thumbnail,
            duration,
            type: isVideo ? 'video' : 'music',
            viewCount,
            channelTitle: artist,
          });
        } else if (item.playlistRenderer) {
          const p = item.playlistRenderer;
          const plId = p.playlistId;
          if (!plId) continue;

          const plTitle = p.title?.simpleText || 'Playlist';
          const author = p.shortBylineText?.runs?.map((r: any) => r.text).join('') || 'YouTube';
          const count = p.videoCount || 'Várias faixas';
          const firstId = p.navigationEndpoint?.watchEndpoint?.videoId;
          const thumb =
            p.thumbnails?.[0]?.thumbnails?.pop()?.url ||
            (firstId ? `https://i.ytimg.com/vi/${firstId}/hqdefault.jpg` : '');

          playlists.push({
            id: plId,
            title: plTitle,
            author,
            videoCount: `${count}`,
            firstVideoId: firstId,
            thumbnail: thumb,
          });
        } else if (item.lockupViewModel) {
          const l = item.lockupViewModel;
          const contentType = l.contentType;
          const contentId = l.contentId;
          const plTitle = l.metadata?.lockupMetadataViewModel?.title?.content || 'Playlist';
          const author =
            l.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]
              ?.metadataParts?.[0]?.text?.content || 'YouTube Playlist';
          const thumb =
            l.contentImage?.collectionThumbnailViewModel?.primaryThumbnail?.thumbnailViewModel?.image?.sources?.pop()?.url ||
            l.contentImage?.thumbnailViewModel?.image?.sources?.pop()?.url ||
            '';

          if (contentType === 'LOCKUP_CONTENT_TYPE_PLAYLIST' || contentType === 'LOCKUP_CONTENT_TYPE_ALBUM') {
            playlists.push({
              id: contentId,
              title: plTitle,
              author,
              videoCount: 'Playlist Completa',
              thumbnail: thumb,
            });
          }
        }
      }
    }

    return { tracks, playlists };
  };

  // Perform primary search
  let { tracks, playlists } = await parseSearchPage(searchUrl);
  const suggestions = await suggestionsPromise;

  // If user searched in "TODOS" and playlists are few, fetch dedicated playlists in parallel
  if (filter === 'TODOS' && playlists.length < 3) {
    try {
      const plUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQ)}&sp=EgIQAw%253D%253D`;
      const extraPl = await parseSearchPage(plUrl);
      if (extraPl.playlists.length > 0) {
        // Merge without duplicates
        const existingIds = new Set(playlists.map(p => p.id));
        for (const p of extraPl.playlists) {
          if (!existingIds.has(p.id)) {
            playlists.push(p);
            existingIds.add(p.id);
          }
        }
      }
    } catch (e) {
      console.warn('Extra playlist search failed:', e);
    }
  }

  // If results are low (< 3) and we have an intelligent suggestion (e.g. "bob marleey" -> "bob marley")
  let correctedQuery: string | undefined;
  if (tracks.length < 3 && suggestions.length > 0) {
    const candidate = suggestions[0];
    if (candidate.toLowerCase() !== cleanQ.toLowerCase()) {
      correctedQuery = candidate;
      try {
        const secondary = await parseSearchPage(
          `https://www.youtube.com/results?search_query=${encodeURIComponent(candidate)}`
        );
        if (secondary.tracks.length > 0) {
          tracks = secondary.tracks;
        }
        if (secondary.playlists.length > 0) {
          playlists = secondary.playlists;
        }
      } catch (e) {
        console.warn('Fallback corrected search failed:', e);
      }
    }
  }

  // 1. Screen YouTube candidates to filter out restricted/blocked embeds (e.g. error 101/150)
  const embedChecks = await Promise.all(
    tracks.slice(0, 16).map(async t => {
      const ok = await isYouTubeEmbeddable(t.youtubeId);
      return { ...t, isUnrestricted: ok, source: 'youtube' as const };
    })
  );
  // Keep only tracks verified to have embedding allowed (or fallback to original if screening was inconclusive)
  const verifiedYouTube = embedChecks.filter(t => t.isUnrestricted);
  const candidateYouTube = verifiedYouTube.length > 0 ? verifiedYouTube : embedChecks;

  // 2. Await Audius open tracks (100% unrestricted and open playback)
  let audiusTracks: ScrapedTrack[] = [];
  try {
    audiusTracks = await audiusPromise;
  } catch (err) {
    console.warn('Audius integration warning:', err);
  }

  // 3. Assemble filtered collection based on user intent
  let finalResults: ScrapedTrack[] = [];

  if (filter === 'SEM RESTRIÇÃO') {
    // Both Audius tracks and verified YouTube tracks
    finalResults = [...audiusTracks, ...candidateYouTube];
  } else if (filter === 'VÍDEOS') {
    finalResults = candidateYouTube.filter(t => t.type === 'video');
  } else if (filter === 'MÚSICAS') {
    finalResults = [...candidateYouTube.filter(t => t.type === 'music'), ...audiusTracks];
  } else if (filter === 'CANAIS' || filter === 'PLAYLISTS') {
    finalResults = candidateYouTube;
  } else {
    // 'TODOS': Interleave verified YouTube with high-fidelity Audius tracks
    if (audiusTracks.length > 0) {
      // Put top YouTube, then Audius, then remaining YouTube
      finalResults = [
        ...candidateYouTube.slice(0, 3),
        ...audiusTracks.slice(0, 4),
        ...candidateYouTube.slice(3),
        ...audiusTracks.slice(4),
      ];
    } else {
      finalResults = candidateYouTube;
    }
  }

  return {
    results: finalResults,
    playlists,
    suggestions,
    correctedQuery,
  };
}

export async function fetchPlaylistTracksLive(playlistId: string): Promise<ScrapedTrack[]> {
  if (!playlistId) return [];

  try {
    const url = `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });
    const html = await res.text();
    const match = html.match(/var ytInitialData = ({.+?});<\/script>/);
    if (!match) return [];

    const data = JSON.parse(match[1]);
    const contents =
      data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer
        ?.contents?.[0]?.itemSectionRenderer?.contents || [];

    const tracks: ScrapedTrack[] = [];

    for (const item of contents) {
      if (item.playlistVideoRenderer) {
        const v = item.playlistVideoRenderer;
        const videoId = v.videoId;
        if (!videoId) continue;

        const title = v.title?.runs?.map((r: any) => r.text).join('') || v.title?.simpleText || 'Faixa';
        const artist =
          v.shortBylineText?.runs?.map((r: any) => r.text).join('') || 'Artista Oficial';
        const duration = v.lengthText?.simpleText || '3:30';
        const thumbnail =
          v.thumbnail?.thumbnails?.pop()?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        tracks.push({
          id: `yt-${videoId}`,
          youtubeId: videoId,
          title,
          artist,
          thumbnail,
          duration,
          type: 'music',
        });
      } else if (item.lockupViewModel) {
        const l = item.lockupViewModel;
        const videoId = l.contentId;
        if (!videoId) continue;

        const title = l.metadata?.lockupMetadataViewModel?.title?.content || 'Faixa';
        const metaRows =
          l.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows || [];
        let artist = 'Artista Oficial';
        let duration = '3:30';

        if (metaRows[0]?.metadataParts?.[0]?.text?.content) {
          artist = metaRows[0].metadataParts[0].text.content;
        }
        if (metaRows[1]?.metadataParts?.[0]?.text?.content) {
          const part = metaRows[1].metadataParts[0].text.content;
          if (part.includes(':')) duration = part;
        }

        const thumbnail =
          l.contentImage?.thumbnailViewModel?.image?.sources?.pop()?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        tracks.push({
          id: `yt-${videoId}`,
          youtubeId: videoId,
          title,
          artist,
          thumbnail,
          duration,
          type: 'music',
        });
      }
    }

    return tracks;
  } catch (err) {
    console.warn('Failed to fetch playlist tracks:', err);
    return [];
  }
}
