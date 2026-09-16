import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config({ path: '.env.local' });
dotenv.config();

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

// Fallback catalog when YOUTUBE_API_KEY is omitted or quota exceeded
const MOCK_SEARCH_DATABASE = [
  // Bob Marley
  {
    id: 'bm-1',
    youtubeId: 'mGVGIbflG_M',
    title: 'Bob Marley & The Wailers - Three Little Birds (Official Music Video)',
    artist: 'Bob Marley & The Wailers',
    channelTitle: 'Bob Marley',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    duration: '3:00',
    type: 'music',
    genre: 'Reggae',
    album: 'Exodus',
    viewCount: '240M visualizações',
  },
  {
    id: 'bm-2',
    youtubeId: '69RdQFDuYlo',
    title: 'Bob Marley & The Wailers - Is This Love',
    artist: 'Bob Marley & The Wailers',
    channelTitle: 'Bob Marley',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    duration: '3:52',
    type: 'music',
    genre: 'Reggae',
    album: 'Kaya',
    viewCount: '310M visualizações',
  },
  {
    id: 'bm-3',
    youtubeId: 'vdB-8eLEW8g',
    title: 'Bob Marley & The Wailers - One Love / People Get Ready',
    artist: 'Bob Marley & The Wailers',
    channelTitle: 'Bob Marley',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    duration: '2:52',
    type: 'music',
    genre: 'Reggae',
    album: 'Exodus',
    viewCount: '190M visualizações',
  },
  {
    id: 'bm-4',
    youtubeId: 'kOFu6b3w6c0',
    title: 'Bob Marley & The Wailers - Redemption Song',
    artist: 'Bob Marley & The Wailers',
    channelTitle: 'Bob Marley',
    thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    duration: '3:47',
    type: 'music',
    genre: 'Reggae',
    album: 'Uprising',
    viewCount: '175M visualizações',
  },
  {
    id: 'bm-5',
    youtubeId: 'IT8XvxBLJKs',
    title: 'Bob Marley & The Wailers - No Woman No Cry (Live At The Lyceum)',
    artist: 'Bob Marley & The Wailers',
    channelTitle: 'Bob Marley',
    thumbnail: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&auto=format&fit=crop&q=80',
    duration: '7:09',
    type: 'video',
    genre: 'Reggae',
    album: 'Live!',
    viewCount: '98M visualizações',
  },
  // Michael Jackson
  {
    id: 'mj-1',
    youtubeId: 'Zi_XLOBDo_Y',
    title: 'Michael Jackson - Billie Jean (Official Video)',
    artist: 'Michael Jackson',
    channelTitle: 'Michael Jackson',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    duration: '4:56',
    type: 'video',
    genre: 'Pop',
    album: 'Thriller',
    viewCount: '1.4B visualizações',
  },
  {
    id: 'mj-2',
    youtubeId: 'sOnqjkJTMaA',
    title: 'Michael Jackson - Thriller (Official 4K Video)',
    artist: 'Michael Jackson',
    channelTitle: 'Michael Jackson',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    duration: '13:42',
    type: 'video',
    genre: 'Pop',
    album: 'Thriller',
    viewCount: '1.0B visualizações',
  },
  {
    id: 'mj-3',
    youtubeId: 'oRdxUFDoQe0',
    title: 'Michael Jackson - Beat It (Official Music Video)',
    artist: 'Michael Jackson',
    channelTitle: 'Michael Jackson',
    thumbnail: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=600&auto=format&fit=crop&q=80',
    duration: '4:59',
    type: 'music',
    genre: 'Pop',
    album: 'Thriller',
    viewCount: '950M visualizações',
  },
  // Rock & Queen & Coldplay
  {
    id: 'qn-1',
    youtubeId: 'fJ9rUzIMcZQ',
    title: 'Queen - Bohemian Rhapsody (Official Video Remastered)',
    artist: 'Queen',
    channelTitle: 'Queen Official',
    thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
    duration: '5:55',
    type: 'video',
    genre: 'Rock',
    album: 'A Night at the Opera',
    viewCount: '1.7B visualizações',
  },
  {
    id: 'cp-1',
    youtubeId: '1G4isv_Fylg',
    title: 'Coldplay - Paradise (Official Video)',
    artist: 'Coldplay',
    channelTitle: 'Coldplay',
    thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80',
    duration: '4:20',
    type: 'video',
    genre: 'Rock',
    album: 'Mylo Xyloto',
    viewCount: '1.8B visualizações',
  },
  // MPB & Samba
  {
    id: 'mpb-1',
    youtubeId: 'f0u2g8FfUq0',
    title: 'Tom Jobim & Vinicius de Moraes - Garota de Ipanema',
    artist: 'Tom Jobim & Vinicius de Moraes',
    channelTitle: 'Bossa Nova Brasil',
    thumbnail: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=80',
    duration: '3:15',
    type: 'music',
    genre: 'MPB',
    album: 'The Composer of Desafinado, Plays',
    viewCount: '45M visualizações',
  },
  {
    id: 'mpb-2',
    youtubeId: 'k1-TrAvp_xs',
    title: 'Elis Regina & Tom Jobim - Águas de Março',
    artist: 'Elis Regina & Tom Jobim',
    channelTitle: 'Elis Regina',
    thumbnail: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80',
    duration: '3:32',
    type: 'music',
    genre: 'MPB',
    album: 'Elis & Tom',
    viewCount: '80M visualizações',
  },
  {
    id: 'smb-1',
    youtubeId: 'uK8iCfqVv6Q',
    title: 'Alcione - Não Deixe o Samba Morrer',
    artist: 'Alcione',
    channelTitle: 'Alcione Oficial',
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    duration: '4:18',
    type: 'music',
    genre: 'Samba',
    album: 'A Voz do Samba',
    viewCount: '52M visualizações',
  },
  {
    id: 'jz-1',
    youtubeId: 'vmDDOFXSgAs',
    title: 'Dave Brubeck Quartet - Take Five',
    artist: 'Dave Brubeck Quartet',
    channelTitle: 'Jazz Classics',
    thumbnail: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=600&auto=format&fit=crop&q=80',
    duration: '5:24',
    type: 'music',
    genre: 'Jazz',
    album: 'Time Out',
    viewCount: '85M visualizações',
  }
];

// Health Check API
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'MiGaTUBE API',
    hasYouTubeApiKey: Boolean(process.env.YOUTUBE_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// YouTube Official Search API endpoint with fallback proxy
app.get('/api/youtube/search', async (req: Request, res: Response) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const filter = (typeof req.query.filter === 'string' ? req.query.filter.toUpperCase() : 'TODOS');
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!query) {
    return res.json({ results: [], query: '', total: 0 });
  }

  // If official API Key is configured in environment
  if (apiKey) {
    try {
      const typeParam = filter === 'CANAIS' ? 'channel' : 'video';
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=${typeParam}&key=${apiKey}`;
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
          const videoId = isChannel ? item.id.channelId : item.id.videoId;
          const detail = videoDetailsMap[videoId];
          const durationStr = detail ? formatDuration(detail.contentDetails?.duration) : '3:30';

          const title = item.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
          const channelTitle = item.snippet.channelTitle;

          // Determine if content is audio/track oriented or official clip
          const lowerTitle = title.toLowerCase();
          const isAudioVisual = lowerTitle.includes('audio') || lowerTitle.includes('lyric') || lowerTitle.includes('track') || lowerTitle.includes('album') || !lowerTitle.includes('clip');

          return {
            id: `yt-${videoId}`,
            youtubeId: videoId,
            title,
            artist: channelTitle || 'Artista Oficial',
            channelTitle,
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
            duration: durationStr,
            durationSec: parseDurationSec(durationStr),
            type: isChannel ? 'channel' : isAudioVisual ? 'music' : 'video',
            viewCount: detail?.statistics?.viewCount ? `${(parseInt(detail.statistics.viewCount) / 1000000).toFixed(1)}M visualizações` : undefined,
            publishedAt: item.snippet.publishedAt,
          };
        });

        return res.json({
          source: 'youtube_data_api_v3',
          results: formatted,
          query,
          total: formatted.length,
        });
      }
    } catch (err) {
      console.warn('YouTube API call failed or quota reached, engaging intelligent fallback', err);
    }
  }

  // Fallback engine: Searches curated database or returns contextual matching tracks
  const cleanQ = query.toLowerCase();
  let matched = MOCK_SEARCH_DATABASE.filter(item => {
    return (
      item.title.toLowerCase().includes(cleanQ) ||
      item.artist.toLowerCase().includes(cleanQ) ||
      (item.genre && item.genre.toLowerCase().includes(cleanQ)) ||
      (item.album && item.album.toLowerCase().includes(cleanQ))
    );
  });

  // If query is generic or novel, provide smart contextual results
  if (matched.length === 0) {
    matched = MOCK_SEARCH_DATABASE.slice(0, 8).map((base, idx) => ({
      ...base,
      id: `gen-${idx}-${Date.now()}`,
      title: `${query.charAt(0).toUpperCase() + query.slice(1)} - Faixa Especial #${idx + 1}`,
      artist: query.toUpperCase(),
    }));
  }

  // Apply filters
  let filtered = matched;
  if (filter === 'MÚSICAS') {
    filtered = matched.filter(t => t.type === 'music');
  } else if (filter === 'VÍDEOS') {
    filtered = matched.filter(t => t.type === 'video');
  }

  return res.json({
    source: 'migatube_curated_engine',
    results: filtered,
    query,
    total: filtered.length,
  });
});

// Vite Middleware for Dev and Static server for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
