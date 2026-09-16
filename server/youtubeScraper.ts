export interface ScrapedTrack {
  id: string;
  youtubeId: string;
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

  // Fetch suggestions in parallel for typo detection
  const suggestionsPromise = fetchYouTubeSuggestions(cleanQ);

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

  return {
    results: tracks,
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
