import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  searchYouTubeLive,
  fetchPlaylistTracksLive,
  fetchYouTubeSuggestions,
} from './server/youtubeScraper';
import {
  searchJamendo,
  searchSoundCloud,
  resolveSoundCloudStream,
} from './server/musicSources';

dotenv.config({ path: '.env.local' });
dotenv.config();

// Ensure HMR is disabled in AI Studio container environment to prevent websocket connection errors
process.env.DISABLE_HMR = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// ISO 8601 duration parser (e.g. PT4M13S -> 4:13)
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

function parseDurationSec(formatted: string): number {
  const parts = formatted.split(':').map(p => parseInt(p, 10));
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 210;
}

// Health Check API
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'MiGaTUBE API',
    hasYouTubeApiKey: Boolean(process.env.YOUTUBE_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Live YouTube Suggestions endpoint
app.get('/api/youtube/suggestions', async (req: Request, res: Response) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!query) return res.json({ suggestions: [] });
  const suggestions = await fetchYouTubeSuggestions(query);
  return res.json({ suggestions });
});

// Live YouTube Playlist tracks endpoint
app.get('/api/youtube/playlist', async (req: Request, res: Response) => {
  const playlistId = typeof req.query.id === 'string' ? req.query.id.trim() : '';
  if (!playlistId) return res.json({ tracks: [] });
  const tracks = await fetchPlaylistTracksLive(playlistId);
  return res.json({ tracks, playlistId, total: tracks.length });
});

// Helper to search YouTube via official API or live scraper
async function getYouTubeResults(query: string, filter: string, pageToken?: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey) {
    try {
      const typeParam = filter === 'CANAIS' ? 'channel' : filter === 'PLAYLISTS' ? 'playlist' : 'video';
      let searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${encodeURIComponent(query)}&type=${typeParam}&key=${apiKey}`;
      if (pageToken) {
        searchUrl += `&pageToken=${encodeURIComponent(pageToken)}`;
      }

      // Also fetch playlists and suggestions in parallel if not purely filtering channels
      const promises: Promise<any>[] = [fetch(searchUrl).then(r => r.json())];

      if (filter === 'TODOS' || filter === 'PLAYLISTS') {
        const plUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${encodeURIComponent(query)}&type=playlist&key=${apiKey}`;
        promises.push(fetch(plUrl).then(r => r.json()).catch(() => ({ items: [] })));
      } else {
        promises.push(Promise.resolve({ items: [] }));
      }

      // Suggestions in parallel
      promises.push(fetchYouTubeSuggestions(query).catch(() => []));

      const [searchData, plData, suggestions] = await Promise.all(promises);

      if (searchData.items && searchData.items.length > 0) {
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

        const formattedTracks = searchData.items
          .filter((item: any) => item.id.kind === 'youtube#video' || item.id.kind === 'youtube#channel')
          .map((item: any) => {
            const isChannel = item.id.kind === 'youtube#channel';
            const videoId = isChannel ? item.id.channelId : item.id.videoId;
            const detail = videoDetailsMap[videoId];
            const durationStr = detail ? formatDuration(detail.contentDetails?.duration) : '3:30';

            const rawTitle = item.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
            const channelTitle = item.snippet.channelTitle || '';

            // Clean title and extract artist if formatted as "Artist - Title"
            let artist = channelTitle;
            let displayTitle = rawTitle;
            if (rawTitle.includes(' - ')) {
              const parts = rawTitle.split(' - ');
              if (parts.length >= 2 && !channelTitle.toLowerCase().includes(parts[0].trim().toLowerCase())) {
                artist = parts[0].trim();
                displayTitle = parts.slice(1).join(' - ').trim();
              }
            }

            return {
              id: `yt-${videoId}`,
              youtubeId: videoId,
              title: rawTitle,
              artist: artist || channelTitle || 'Artista Oficial',
              channelTitle,
              thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
              duration: durationStr,
              durationSec: parseDurationSec(durationStr),
              type: isChannel ? 'channel' : 'music', // All YouTube tracks are fully playable as music
              viewCount: detail?.statistics?.viewCount ? `${(parseInt(detail.statistics.viewCount) / 1000000).toFixed(1)}M visualizações` : undefined,
              publishedAt: item.snippet.publishedAt,
              source: 'youtube',
            };
          });

        const formattedPlaylists = (plData.items || [])
          .filter((item: any) => item.id.kind === 'youtube#playlist')
          .map((item: any) => ({
            id: item.id.playlistId,
            title: item.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'),
            author: item.snippet.channelTitle || 'YouTube',
            videoCount: 'Álbum / Playlist Completa',
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
          }));

        return {
          results: formattedTracks,
          playlists: formattedPlaylists,
          suggestions: suggestions || [],
          nextPageToken: searchData.nextPageToken,
          source: 'youtube_data_api_v3',
        };
      }
    } catch (err) {
      console.warn('Official YouTube API failed, using scraper fallback', err);
    }
  }

  // 2. High-performance live YouTube scraper engine
  try {
    const liveData = await searchYouTubeLive(query, filter);
    if (liveData.results.length > 0 || liveData.playlists.length > 0) {
      return {
        results: liveData.results.map((t: any) => ({ ...t, source: 'youtube' })),
        playlists: liveData.playlists || [],
        suggestions: liveData.suggestions || [],
        correctedQuery: liveData.correctedQuery,
        source: 'youtube_live_engine',
      };
    }
  } catch (liveErr) {
    console.warn('Live search parser error:', liveErr);
  }

  return { results: [], playlists: [], suggestions: [], source: 'none' };
}

// Multi-Source Search Handler (YouTube, Jamendo, SoundCloud)
async function handleMultiSourceSearch(req: Request, res: Response) {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const filter = (typeof req.query.filter === 'string' ? req.query.filter.toUpperCase() : 'TODOS');
  const source = (typeof req.query.source === 'string' ? req.query.source.toLowerCase() : 'all');
  const pageToken = typeof req.query.pageToken === 'string' ? req.query.pageToken : undefined;

  if (!query) {
    return res.json({
      results: [],
      playlists: [],
      suggestions: [],
      query: '',
      total: 0,
      countsBySource: { all: 0, youtube: 0, jamendo: 0, soundcloud: 0 },
    });
  }

  try {
    let ytResults: any[] = [];
    let ytPlaylists: any[] = [];
    let suggestions: string[] = [];
    let correctedQuery: string | undefined;
    let nextPageToken: string | undefined;
    let jamResults: any[] = [];
    let scResults: any[] = [];

    const promises: Promise<any>[] = [];

    if (source === 'all' || source === 'youtube') {
      promises.push(
        getYouTubeResults(query, filter, pageToken)
          .then(data => {
            ytResults = data.results || [];
            ytPlaylists = data.playlists || [];
            if (data.nextPageToken) nextPageToken = data.nextPageToken;
            if (data.suggestions?.length) suggestions = data.suggestions;
            if (data.correctedQuery) correctedQuery = data.correctedQuery;
          })
          .catch(e => console.warn('YouTube search failed:', e))
      );
    }

    if (!pageToken && (source === 'all' || source === 'jamendo')) {
      promises.push(
        searchJamendo(query, 25)
          .then(data => {
            jamResults = data || [];
          })
          .catch(e => console.warn('Jamendo search failed:', e))
      );
    }

    if (!pageToken && (source === 'all' || source === 'soundcloud')) {
      promises.push(
        searchSoundCloud(query, 25)
          .then(data => {
            scResults = data || [];
          })
          .catch(e => console.warn('SoundCloud search failed:', e))
      );
    }

    await Promise.allSettled(promises);

    let combinedResults: any[] = [];

    if (source === 'youtube') {
      combinedResults = ytResults;
    } else if (source === 'jamendo') {
      combinedResults = jamResults;
    } else if (source === 'soundcloud') {
      combinedResults = scResults;
    } else {
      // 'all': Interleave YouTube, SoundCloud, and Jamendo for a rich variety of results
      const maxLen = Math.max(ytResults.length, scResults.length, jamResults.length);
      for (let i = 0; i < maxLen; i++) {
        if (ytResults[i]) combinedResults.push(ytResults[i]);
        if (scResults[i]) combinedResults.push(scResults[i]);
        if (jamResults[i]) combinedResults.push(jamResults[i]);
      }
    }

    // Apply type filters
    if (filter === 'MÚSICAS') {
      combinedResults = combinedResults.filter(t => t.type === 'music');
    } else if (filter === 'VÍDEOS') {
      // In MiGaTUBE, all YouTube tracks have video clips and video player available
      combinedResults = combinedResults.filter(t => t.source === 'youtube');
    } else if (filter === 'CANAIS') {
      combinedResults = combinedResults.filter(t => t.type === 'channel');
    }

    const totalCount = combinedResults.length + ytPlaylists.length;

    return res.json({
      source: `multi_source_${source}`,
      results: combinedResults,
      playlists: ytPlaylists,
      suggestions: suggestions.length > 0 ? suggestions : [query, `${query} hits`, `${query} remix`, `${query} ao vivo`],
      correctedQuery,
      nextPageToken,
      query,
      total: totalCount,
      countsBySource: {
        all: ytResults.length + jamResults.length + scResults.length,
        youtube: ytResults.length,
        jamendo: jamResults.length,
        soundcloud: scResults.length,
      },
    });
  } catch (err) {
    console.error('Search endpoint error:', err);
    return res.status(500).json({ error: 'Search failed' });
  }
}

// Multi-Source and YouTube search endpoints
app.get('/api/music/search', handleMultiSourceSearch);
app.get('/api/youtube/search', handleMultiSourceSearch);

// Stream resolver for on-demand stream URLs (SoundCloud)
app.get('/api/music/resolve', async (req: Request, res: Response) => {
  const url = typeof req.query.url === 'string' ? req.query.url : '';
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });
  const streamUrl = await resolveSoundCloudStream(url);
  if (!streamUrl) return res.status(404).json({ error: 'Stream not found' });
  return res.json({ streamUrl });
});

// Vite Middleware for Dev and Static server for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MiGaTUBE server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
