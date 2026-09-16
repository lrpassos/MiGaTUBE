import React, { useState, useEffect } from 'react';
import { X, Play, Heart, Plus, Disc3, ListMusic, Music2 } from 'lucide-react';
import { Track, YouTubePlaylist } from '../types';
import { storage } from '../lib/storage';

interface AlbumModalProps {
  playlist: YouTubePlaylist | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayTrack: (track: Track, allTracks: Track[]) => void;
  onAddToPlaylist: (track: Track) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
}

export const AlbumModal: React.FC<AlbumModalProps> = ({
  playlist,
  isOpen,
  onClose,
  onPlayTrack,
  onAddToPlaylist,
  currentTrack,
  isPlaying,
}) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    const favs = storage.getFavorites();
    return new Set(favs.map((t) => t.id || t.youtubeId));
  });

  useEffect(() => {
    if (!isOpen || !playlist) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetch(`/api/youtube/playlist?id=${encodeURIComponent(playlist.id)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar faixas');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data.tracks && Array.isArray(data.tracks)) {
          setTracks(data.tracks);
        } else {
          setTracks([]);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Erro ao carregar faixas do álbum:', err);
        setError('Não foi possível carregar as faixas deste álbum no momento.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, playlist]);

  if (!isOpen || !playlist) return null;

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

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      onPlayTrack(tracks[0], tracks);
    }
  };

  return (
    <div
      id="album-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        id="album-modal-container"
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#07130c] border border-emerald-900/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Album Artwork & Meta */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-b from-[#0e291b] to-[#07130c] border-b border-emerald-950 flex flex-col sm:flex-row items-center sm:items-end gap-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-emerald-950 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-10"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shadow-xl shrink-0 border border-emerald-500/20 bg-black">
            <img
              src={
                playlist.thumbnail ||
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
              }
              alt={playlist.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold uppercase tracking-wider">
              <ListMusic className="w-3.5 h-3.5" />
              <span>Álbum / Playlist</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white line-clamp-2 leading-snug">
              {playlist.title}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400">
              {playlist.author || 'Artista Oficial'} • {tracks.length > 0 ? `${tracks.length} faixas` : playlist.videoCount || 'Faixas disponíveis'}
            </p>

            {tracks.length > 0 && (
              <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
                <button
                  type="button"
                  onClick={handlePlayAll}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Reproduzir Álbum</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tracks List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <Disc3 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
              <p className="text-xs text-zinc-400 font-medium">Carregando faixas do álbum...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-xs text-rose-400">{error}</p>
            </div>
          ) : tracks.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Music2 className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-400">Nenhuma faixa encontrada neste álbum.</p>
            </div>
          ) : (
            tracks.map((track, idx) => {
              const isCurrent = currentTrack?.youtubeId === track.youtubeId;
              const isFav = favoriteIds.has(track.id || track.youtubeId);

              return (
                <div
                  key={track.id || `${track.youtubeId}-${idx}`}
                  onClick={() => onPlayTrack(track, tracks)}
                  className={`group flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer border ${
                    isCurrent
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                      : 'bg-[#0a1810]/50 hover:bg-[#0e2217] border-transparent text-zinc-200'
                  }`}
                >
                  <span className="w-6 text-center text-xs text-zinc-500 font-mono shrink-0">
                    {isCurrent && isPlaying ? (
                      <span className="text-emerald-400 font-bold">▶</span>
                    ) : (
                      idx + 1
                    )}
                  </span>

                  <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-black shrink-0">
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold truncate group-hover:text-emerald-300 transition-colors">
                      {track.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {track.artist || playlist.author}
                    </p>
                  </div>

                  {track.duration && (
                    <span className="text-[11px] text-zinc-500 font-mono shrink-0 hidden sm:inline">
                      {track.duration}
                    </span>
                  )}

                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(e, track)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isFav
                          ? 'text-rose-500 bg-rose-500/10'
                          : 'text-zinc-500 hover:text-rose-400 hover:bg-white/5'
                      }`}
                      title={isFav ? 'Remover dos favoritos' : 'Favoritar'}
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
            })
          )}
        </div>
      </div>
    </div>
  );
};
