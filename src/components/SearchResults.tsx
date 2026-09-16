import React, { useState } from 'react';
import {
  Play,
  Heart,
  Plus,
  MoreVertical,
  Disc3,
  Video,
  ListMusic,
  Sparkles,
  ExternalLink,
  Music2,
  Check,
} from 'lucide-react';
import { Track, YouTubePlaylist } from '../types';
import { storage } from '../lib/storage';

interface SearchResultsProps {
  results: Track[];
  playlists?: YouTubePlaylist[];
  suggestions?: string[];
  correctedQuery?: string;
  isLoading: boolean;
  error?: string | null;
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, allTracks: Track[]) => void;
  onPlayPlaylist?: (playlist: YouTubePlaylist) => void;
  onSelectQuery?: (query: string) => void;
  onAddToPlaylist: (track: Track) => void;
  onOpenArtist?: (artistName: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  playlists = [],
  suggestions = [],
  correctedQuery,
  isLoading,
  error,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onPlayPlaylist,
  onSelectQuery,
  onAddToPlaylist,
  onOpenArtist,
}) => {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    const favs = storage.getFavorites();
    return new Set(favs.map((t) => t.id || t.youtubeId));
  });

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleToggleFavorite = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    const isFav = storage.toggleFavorite(track);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      const key = track.id || track.youtubeId;
      if (isFav) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3 py-6">
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
          <Disc3 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Buscando no YouTube, SoundCloud e Jamendo...</span>
        </div>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="flex items-center gap-3 p-3 rounded-2xl bg-[#09150f]/60 border border-emerald-950 animate-pulse"
          >
            <div className="w-16 h-16 rounded-xl bg-emerald-950/40 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-emerald-950/60 rounded-md w-3/4" />
              <div className="h-3 bg-emerald-950/40 rounded-md w-1/2" />
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-950/40" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
          <Disc3 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-zinc-300 font-medium text-sm">{error}</p>
        <p className="text-zinc-500 text-xs">Verifique sua conexão ou tente uma pesquisa diferente.</p>
      </div>
    );
  }

  const hasNoContent = results.length === 0 && playlists.length === 0;

  if (hasNoContent) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#0c1e15] border border-emerald-950 flex items-center justify-center mx-auto text-zinc-500">
          <Disc3 className="w-6 h-6" />
        </div>
        <p className="text-zinc-300 font-medium text-sm">Não encontramos resultados diretos.</p>
        {suggestions.length > 0 && (
          <div className="space-y-2 max-w-sm mx-auto pt-2">
            <p className="text-xs text-zinc-400">Sugestões de busca:</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {suggestions.slice(0, 5).map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectQuery?.(s)}
                  className="px-3 py-1 rounded-full bg-emerald-950/80 hover:bg-emerald-500/20 border border-emerald-800 text-xs text-emerald-400 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Typo Correction Banner */}
      {correctedQuery && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-slate-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Você quis dizer: </span>
          <button
            onClick={() => onSelectQuery?.(correctedQuery)}
            className="font-bold text-emerald-400 underline hover:text-emerald-300 cursor-pointer"
          >
            {correctedQuery}
          </button>
        </div>
      )}

      {/* 2. YouTube Playlists & Albums Section (if found) */}
      {playlists.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Playlists & Álbuns ({playlists.length})
              </h3>
            </div>
            <span className="text-[11px] text-zinc-400">Toque para ouvir todas as faixas</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => onPlayPlaylist?.(pl)}
                className="group relative flex flex-col p-2.5 rounded-2xl bg-[#09150f] border border-emerald-950/80 hover:border-emerald-500/50 hover:bg-[#0e2117] transition-all cursor-pointer shadow-md"
              >
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/80 mb-2">
                  <img
                    src={
                      pl.thumbnail ||
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
                    }
                    alt={pl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                  {/* Playlist Overlay Indicator */}
                  <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[10px] font-medium text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <ListMusic className="w-3 h-3" />
                    <span>{pl.videoCount || 'Várias faixas'}</span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-lg shadow-emerald-500/50">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
                  {pl.title}
                </h4>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">{pl.author}</p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayPlaylist?.(pl);
                  }}
                  className="mt-2.5 w-full py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black text-[11px] font-bold transition-all border border-emerald-500/30 flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Tocar Playlist
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Tracks & Music Videos List */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <div className="flex items-center gap-2">
              <Music2 className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-100 uppercase tracking-wider">
                Músicas & Vídeos ({results.length})
              </span>
            </div>
            <span className="text-emerald-400 font-medium">Toque para reproduzir</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {results.map((track) => {
              const isThisPlaying = currentTrack?.youtubeId === track.youtubeId && isPlaying;
              const isThisActive = currentTrack?.youtubeId === track.youtubeId;
              const isFav = favoriteIds.has(track.id) || favoriteIds.has(track.youtubeId);

              return (
                <div
                  key={track.id || track.youtubeId}
                  id={`result-card-${track.youtubeId}`}
                  onClick={() => onPlayTrack(track, results)}
                  className={`group relative flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isThisActive
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                      : 'bg-[#09150f]/70 hover:bg-[#0c1f16] border-emerald-950/80 hover:border-emerald-800'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-black/60 shadow-md">
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />

                    {/* Overlay Play Indicator */}
                    <div
                      className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                        isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-lg shadow-emerald-500/40">
                        {isThisPlaying ? (
                          <div className="flex items-center gap-0.5">
                            <span className="w-1 h-3 bg-black animate-pulse" />
                            <span className="w-1 h-4 bg-black animate-pulse delay-75" />
                            <span className="w-1 h-2 bg-black animate-pulse delay-150" />
                          </div>
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </div>
                    </div>

                    {/* Content Type Badge */}
                    <div className="absolute top-1 left-1">
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/80 text-[8px] font-mono text-emerald-400 font-bold tracking-wider uppercase">
                        {track.type === 'video' ? (
                          <>
                            <Video className="w-2.5 h-2.5" />
                            VÍDEO
                          </>
                        ) : (
                          <>
                            <Disc3 className="w-2.5 h-2.5" />
                            ÁUDIO
                          </>
                        )}
                      </span>
                    </div>

                    {/* Duration */}
                    {track.duration && (
                      <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded-md bg-black/80 text-[9px] font-mono text-zinc-300">
                        {track.duration}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 pr-1">
                    <h4
                      className={`text-xs md:text-sm font-bold truncate ${
                        isThisActive ? 'text-emerald-400' : 'text-slate-100 group-hover:text-emerald-300'
                      }`}
                    >
                      {track.title}
                    </h4>
                    <p
                      onClick={(e) => {
                        if (onOpenArtist) {
                          e.stopPropagation();
                          onOpenArtist(track.artist);
                        }
                      }}
                      className="text-xs text-zinc-400 hover:text-emerald-400 truncate mt-0.5 cursor-pointer"
                    >
                      {track.artist}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {track.source === 'youtube' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-500/15 text-[9px] font-mono text-red-400 border border-red-500/30 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> YouTube
                        </span>
                      )}
                      {track.source === 'soundcloud' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-500/15 text-[9px] font-mono text-orange-400 border border-orange-500/30 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> SoundCloud
                        </span>
                      )}
                      {track.source === 'jamendo' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-500/15 text-[9px] font-mono text-teal-300 border border-teal-500/30 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" /> Jamendo Livre
                        </span>
                      )}
                      {track.isUnrestricted && track.source !== 'jamendo' && track.source !== 'soundcloud' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-[9px] font-mono text-[#00ff88] border border-emerald-500/30 font-medium">
                          <Check className="w-2.5 h-2.5" /> Sem Restrição
                        </span>
                      )}
                      {track.viewCount && (
                        <span className="text-[10px] text-zinc-500 truncate">{track.viewCount}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(e, track)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isFav
                          ? 'text-rose-500 bg-rose-500/10'
                          : 'text-zinc-500 hover:text-rose-400 hover:bg-white/5'
                      }`}
                      title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onAddToPlaylist(track)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-emerald-400 hover:bg-white/5 transition-colors cursor-pointer"
                      title="Adicionar à playlist"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Related Search Suggestions */}
      {suggestions.length > 0 && (
        <div className="pt-2 border-t border-emerald-950/60">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pesquisas relacionadas:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectQuery?.(s)}
                className="px-3 py-1 rounded-full bg-[#09150f] hover:bg-emerald-950/80 border border-emerald-950/80 hover:border-emerald-500/40 text-xs text-zinc-300 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
