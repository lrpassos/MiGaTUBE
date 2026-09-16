import {
  searchYouTubeLive,
  fetchPlaylistTracksLive,
  fetchYouTubeSuggestions,
} from '../server/youtubeScraper';

function formatDuration(isoDuration: string): string {
  if (!isoDuration) return '3:30';
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '3:30';
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default async function handler(req: any, res: any) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (pathname.includes('/api/health')) {
    return res.status(200).json({
      status: 'ok',
      hasYouTubeApiKey: Boolean(process.env.YOUTUBE_API_KEY),
      environment: 'vercel_serverless',
    });
  }

  // Suggestions endpoint
  if (pathname.includes('/api/youtube/suggestions')) {
    const q = url.searchParams.get('q')?.trim() || '';
    if (!q) return res.status(200).json({ suggestions: [] });
    const suggestions = await fetchYouTubeSuggestions(q);
    return res.status(200).json({ suggestions });
  }

  // Playlist endpoint
  if (pathname.includes('/api/youtube/playlist')) {
    const id = url.searchParams.get('id')?.trim() || '';
    if (!id) return res.status(200).json({ tracks: [] });
    const tracks = await fetchPlaylistTracksLive(id);
    return res.status(200).json({ tracks, playlistId: id, total: tracks.length });
  }

  if (pathname.includes('/api/youtube/search')) {
    const query = url.searchParams.get('q')?.trim() || '';
    const filter = (url.searchParams.get('filter') || 'TODOS').toUpperCase();
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!query) {
      return res.status(200).json({ results: [], playlists: [], suggestions: [], query: '', total: 0 });
    }

    if (apiKey) {
      try {
        const typeParam = filter === 'CANAIS' ? 'channel' : filter === 'PLAYLISTS' ? 'playlist' : 'video';
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${encodeURIComponent(query)}&type=${typeParam}&key=${apiKey}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchRes.ok && searchData.items && searchData.items.length > 0) {
          const videoIds = searchData.items
            .filter((item: any) => item.id.kind === 'youtube#video')
            .map((item: any) => item.id.videoId)
            .join(',');

          let videoDetailsMap: Record<string, any> = {};
          if (videoIds) {
            const detailUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${videoIds}&key=${apiKey}`;
            const detailRes = await fetch(detailUrl);
            const detailData = await detailRes.json();
            if (detailData.items) {
              for (const v of detailData.items) {
                videoDetailsMap[v.id] = v;
              }
            }
          }

          const formatted = searchData.items.map((item: any) => {
            const isChannel = item.id.kind === 'youtube#channel';
            const isPlaylist = item.id.kind === 'youtube#playlist';
            const videoId = isChannel ? item.id.channelId : isPlaylist ? item.id.playlistId : item.id.videoId;
            const detail = videoDetailsMap[videoId];
            const durationStr = detail ? formatDuration(detail.contentDetails?.duration) : '3:30';
            const title = item.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
            const channelTitle = item.snippet.channelTitle;

            return {
              id: `yt-${videoId}`,
              youtubeId: videoId,
              title,
              artist: channelTitle || 'Artista Oficial',
              channelTitle,
              thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
              duration: durationStr,
              type: isChannel ? 'channel' : 'music',
              viewCount: detail?.statistics?.viewCount ? `${(parseInt(detail.statistics.viewCount) / 1000000).toFixed(1)}M visualizações` : undefined,
              publishedAt: item.snippet.publishedAt,
            };
          });

          return res.status(200).json({
            source: 'youtube_data_api_v3',
            results: formatted,
            query,
            total: formatted.length,
          });
        }
      } catch (e) {
        console.warn('Vercel serverless YouTube API error', e);
      }
    }

    // High performance live YouTube search engine
    try {
      const live = await searchYouTubeLive(query, filter);
      return res.status(200).json({
        source: 'youtube_live_engine',
        results: live.results,
        playlists: live.playlists,
        suggestions: live.suggestions,
        correctedQuery: live.correctedQuery,
        query,
        total: live.results.length,
      });
    } catch (e) {
      console.warn('Live search in serverless failed:', e);
    }

    return res.status(200).json({
      source: 'migatube_catalog_fallback',
      results: [],
      playlists: [],
      suggestions: [query],
      query,
      message: 'Busca processada.',
    });
  }

  return res.status(200).json({ message: 'MiGaTUBE API handler' });
}
