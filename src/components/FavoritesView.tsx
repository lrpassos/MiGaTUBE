import React, { useState } from 'react';
import { Heart, Play, Trash2, Plus, Disc3 } from 'lucide-react';
import { Track } from '../types';
import { storage } from '../lib/storage';

interface FavoritesViewProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, allTracks: Track[]) => void;
  onAddToPlaylist: (track: Track) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  currentTrack,
  isPlaying,
  onPlayTrack,
  onAddToPlaylist,
}) => {
  const [favorites, setFavorites] = useState<Track[]>(() => storage.getFavorites());

  const handleRemove = (track: Track) => {
    storage.toggleFavorite(track);
    setFavorites(storage.getFavorites());
  };

  const handlePlayAll = () => {
    if (favorites.length > 0) {
      onPlayTrack(favorites[0], favorites);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-display flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-400 fill-current" />
            Minhas <span className="text-[#00ff88]">Músicas</span> Favoritas
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {favorites.length} {favorites.length === 1 ? 'faixa salva' : 'faixas salvas'} no seu MiGaTUBE.
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={handlePlayAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>Reproduzir Todas</span>
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="py-20 text-center space-y-3 rounded-3xl border border-dashed border-emerald-950 bg-[#09150f]/30">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 mx-auto flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-zinc-300">Você ainda não favoritou nenhuma música</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Quando encontrar uma música ou vídeo que adorar, clique no ícone de coração para salvá-la aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.map((track, idx) => {
            const isThisPlaying = currentTrack?.youtubeId === track.youtubeId && isPlaying;
            const isThisActive = currentTrack?.youtubeId === track.youtubeId;

            return (
              <div
                key={track.id || track.youtubeId}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isThisActive
                    ? 'bg-emerald-950/40 border-emerald-500/50'
                    : 'bg-[#09150f]/60 hover:bg-[#0c1f16] border-emerald-950/80 hover:border-emerald-800'
                }`}
              >
                <div
                  onClick={() => onPlayTrack(track, favorites)}
                  className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                >
                  <span className="w-5 text-center text-xs font-mono text-zinc-500">
                    {idx + 1}
                  </span>
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black">
                    <img src={track.thumbnail} alt="" className="w-full h-full object-cover" />
                    {isThisPlaying && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Disc3 className="w-5 h-5 text-[#00ff88] animate-spin-slow" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 pr-2">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        isThisActive ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {track.title}
                    </h4>
                    <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-zinc-500 mr-2">{track.duration || '3:30'}</span>

                  <button
                    onClick={() => onAddToPlaylist(track)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    title="Adicionar à playlist"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleRemove(track)}
                    className="p-2 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remover dos favoritos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
