import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Disc3, Heart, Plus, Users, Radio, ExternalLink, Video, Sparkles, Loader2 } from 'lucide-react';
import { Track } from '../types';
import { FEATURED_TRACKS, FEATURED_ARTISTS, FeaturedArtist } from '../lib/curatedData';
import { searchMusic } from '../lib/youtube';
import { storage } from '../lib/storage';

interface ArtistViewProps {
  artistName: string;
  onBack: () => void;
  onPlayTrack: (track: Track, allTracks: Track[]) => void;
  onAddToPlaylist: (track: Track) => void;
  onOpenArtist: (name: string) => void;
}

export const ArtistView: React.FC<ArtistViewProps> = ({
  artistName,
  onBack,
  onPlayTrack,
  onAddToPlaylist,
  onOpenArtist,
}) => {
  const [artistTracks, setArtistTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Find artist data in catalog or synthesize profile
  const knownArtist = FEATURED_ARTISTS.find(
    (a) => a.name.toLowerCase() === artistName.toLowerCase()
  );

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadArtistTracks = async () => {
      try {
        const res = await searchMusic(artistName, 'MÚSICAS', 'all');
        if (isMounted) {
          if (res.results && res.results.length > 0) {
            setArtistTracks(res.results);
          } else {
            // Fallback only to exact artist matches, never unrelated artists
            const localMatches = FEATURED_TRACKS.filter(t =>
              t.artist.toLowerCase().includes(artistName.toLowerCase()) ||
              t.title.toLowerCase().includes(artistName.toLowerCase())
            );
            setArtistTracks(localMatches);
          }
        }
      } catch {
        if (isMounted) {
          const localMatches = FEATURED_TRACKS.filter(t =>
            t.artist.toLowerCase().includes(artistName.toLowerCase())
          );
          setArtistTracks(localMatches);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadArtistTracks();

    return () => {
      isMounted = false;
    };
  }, [artistName]);

  const artistBio = knownArtist?.bio || `Apresentando grandes sucessos de ${artistName} no MiGaTUBE com áudio de alta fidelidade e deck analógico.`;
  const artistAvatar = knownArtist?.avatarUrl || artistTracks[0]?.thumbnail || `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80`;
  const artistCover = knownArtist?.coverUrl || artistTracks[0]?.thumbnail || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80`;
  const subscribers = knownArtist?.subscribers || 'Artista Oficial';

  const handlePlayAll = () => {
    if (artistTracks.length > 0) {
      onPlayTrack(artistTracks[0], artistTracks);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar</span>
      </button>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-950/80 shadow-2xl bg-black">
        <div className="absolute inset-0">
          <img
            src={artistCover}
            alt={artistName}
            className="w-full h-full object-cover filter brightness-50 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060c08] via-[#060c08]/70 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 z-10">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-3 border-emerald-500/60 shadow-2xl shrink-0">
            <img src={artistAvatar} alt={artistName} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-500/20 text-[#00ff88] border border-emerald-500/30">
                CANAL & ARTISTA VERIFICADO
              </span>
              <span className="text-xs text-zinc-400 font-mono">{subscribers}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
              {artistName}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl line-clamp-2">
              {artistBio}
            </p>

            <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-xl shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Reproduzir Tudo</span>
              </button>

              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(artistName)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-black/60 border border-emerald-950 hover:border-emerald-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Canal no YouTube</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Top Tracks by this Artist */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-emerald-400" />
            Músicas de {artistName}
          </h2>
          {artistTracks.length > 0 && (
            <span className="text-xs text-zinc-500 font-mono">
              {artistTracks.length} faixas disponíveis
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#09150f]/40 border border-emerald-950/60 animate-pulse"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-950/50 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-emerald-950/70 rounded w-3/4" />
                  <div className="h-2.5 bg-emerald-950/40 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : artistTracks.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-emerald-950/80 bg-[#09150f]/40 space-y-2">
            <Disc3 className="w-8 h-8 text-zinc-500 mx-auto" />
            <p className="text-zinc-300 text-sm font-medium">
              Nenhuma faixa encontrada especificamente para este artista.
            </p>
            <p className="text-zinc-500 text-xs">
              Você pode buscar no campo de pesquisa acima para explorar álbuns e shows completos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {artistTracks.map((track, idx) => (
              <div
                key={track.id || track.youtubeId}
                onClick={() => onPlayTrack(track, artistTracks)}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#09150f]/70 hover:bg-[#0c1f16] border border-emerald-950/80 hover:border-emerald-800 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-5 text-center text-xs font-mono text-zinc-500 group-hover:text-emerald-400">
                    {idx + 1}
                  </span>
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 pr-2">
                    <h4 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 truncate">
                      {track.title}
                    </h4>
                    <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-zinc-500">{track.duration || '3:30'}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToPlaylist(track);
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    title="Adicionar à playlist"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Artists */}
      <div className="space-y-4 pt-4 border-t border-emerald-950/70">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          Outros Artistas em Destaque
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {FEATURED_ARTISTS.filter(a => a.name.toLowerCase() !== artistName.toLowerCase()).map((other) => (
            <div
              key={other.id}
              onClick={() => onOpenArtist(other.name)}
              className="p-4 rounded-2xl bg-[#09150f]/60 hover:bg-[#0c1f16] border border-emerald-950/80 hover:border-emerald-800 transition-all text-center cursor-pointer group"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-2 border-emerald-500/30 group-hover:border-emerald-400 transition-colors">
                <img src={other.avatarUrl} alt={other.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">
                {other.name}
              </h4>
              <p className="text-[10px] text-zinc-500 uppercase font-mono mt-0.5">{other.genre}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
