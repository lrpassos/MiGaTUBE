import React, { useState } from 'react';
import { Play, Heart, Plus, MoreVertical, Disc3, Video, Clock, Eye, Check, ExternalLink } from 'lucide-react';
import { Track } from '../types';
import { storage } from '../lib/storage';

interface SearchResultsProps {
  results: Track[];
  isLoading: boolean;
  error?: string | null;
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, allTracks: Track[]) => void;
  onAddToPlaylist: (track: Track) => void;
  onOpenArtist?: (artistName: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading,
  error,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onAddToPlaylist,
  onOpenArtist,
}) => {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    const favs = storage.getFavorites();
    return new Set(favs.map(t => t.id || t.youtubeId));
  });

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleToggleFavorite = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    const isFav = storage.toggleFavorite(track);
    setFavoriteIds(prev => {
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

  if (results.length === 0) {
    return (
      <div className="py-16 text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-[#0c1e15] border border-emerald-950 flex items-center justify-center mx-auto text-zinc-500">
          <Disc3 className="w-6 h-6" />
        </div>
        <p className="text-zinc-300 font-medium text-sm">Não encontramos resultados para essa pesquisa.</p>
        <p className="text-zinc-500 text-xs">Tente pesquisar por termos como "Bob Marley", "Reggae" ou "MPB".</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-zinc-400 px-1 pb-1">
        <span>Resultados encontrados ({results.length})</span>
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
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-950/50'
                  : 'bg-[#09150f]/70 hover:bg-[#0c1f16] border-emerald-950/80 hover:border-emerald-800'
              }`}
            >
              {/* Thumbnail Container */}
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
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Content Type Badge */}
                <div className="absolute top-1 left-1">
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-xs bg-black/80 text-[9px] font-mono text-emerald-400 font-bold tracking-wider uppercase">
                    {track.type === 'video' ? (
                      <>
                        <Video className="w-2.5 h-2.5" />
                        VÍDEO
                      </>
                    ) : (
                      <>
                        <Disc3 className="w-2.5 h-2.5" />
                        MÚSICA
                      </>
                    )}
                  </span>
                </div>

                {/* Duration */}
                {track.duration && (
                  <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded-xs bg-black/80 text-[9px] font-mono text-zinc-300">
                    {track.duration}
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="flex-1 min-w-0 pr-1">
                <h4
                  className={`text-sm font-semibold truncate transition-colors ${
                    isThisActive ? 'text-emerald-400 font-bold' : 'text-slate-100 group-hover:text-emerald-300'
                  }`}
                  title={track.title}
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
                  className="text-xs text-zinc-400 hover:text-emerald-400 truncate hover:underline transition-colors mt-0.5"
                >
                  {track.artist}
                </p>

                <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500">
                  {track.viewCount && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-zinc-500" />
                      {track.viewCount}
                    </span>
                  )}
                  {track.album && (
                    <span className="hidden sm:inline-block truncate max-w-[120px] text-emerald-600">
                      • {track.album}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Favorite */}
                <button
                  type="button"
                  onClick={(e) => handleToggleFavorite(e, track)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isFav
                      ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                </button>

                {/* Add to Playlist */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToPlaylist(track);
                  }}
                  className="p-2 rounded-xl text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                  title="Adicionar à playlist"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Dropdown Options Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === (track.id || track.youtubeId) ? null : (track.id || track.youtubeId));
                    }}
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                    title="Mais opções"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuId === (track.id || track.youtubeId) && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-10 z-30 w-44 rounded-xl bg-[#08140e] border border-emerald-500/30 p-1.5 shadow-2xl space-y-1 text-xs text-slate-200 animate-in fade-in"
                    >
                      <button
                        onClick={() => {
                          onPlayTrack(track, results);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/20 text-left text-emerald-400"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Reproduzir agora
                      </button>
                      <button
                        onClick={() => {
                          onAddToPlaylist(track);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Adicionar à playlist
                      </button>
                      <button
                        onClick={(e) => {
                          handleToggleFavorite(e, track);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        {isFav ? 'Remover dos favoritos' : 'Favoritar'}
                      </button>
                      <a
                        href={`https://www.youtube.com/watch?v=${track.youtubeId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left text-zinc-400 hover:text-white"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver no YouTube
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
