import React from 'react';
import { Play, Disc3, Heart, Plus, Sparkles, TrendingUp, Radio, Compass, Users } from 'lucide-react';
import { Track, Playlist } from '../types';
import { FEATURED_TRACKS, FEATURED_ARTISTS, GENRES } from '../lib/curatedData';
import { storage } from '../lib/storage';

interface HomeViewProps {
  onPlayTrack: (track: Track, allTracks: Track[]) => void;
  onAddToPlaylist: (track: Track) => void;
  onOpenArtist: (name: string) => void;
  onSelectGenre: (genre: string) => void;
  onOpenPlaylists: () => void;
  currentTrack: Track | null;
  isPlaying: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onPlayTrack,
  onAddToPlaylist,
  onOpenArtist,
  onSelectGenre,
  onOpenPlaylists,
  currentTrack,
  isPlaying,
}) => {
  const playlists = storage.getPlaylists();

  return (
    <div className="space-y-10 animate-in fade-in">
      {/* Hero Welcome Showcase */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-[#07170f] via-[#05100a] to-[#030705] border border-emerald-900/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00ff88] text-[11px] font-mono font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Experiência Analógica com Áudio Oficial</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
              Bem-vindo ao <span className="text-[#00ff88] neon-text-glow">MiGaTUBE</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
              Descubra suas músicas e vídeos prediletos com nosso exclusivo deck de vinil digital em 33⅓ RPM, medidor de sinal VU Meter e reprodução contínua de alta fidelidade.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => onPlayTrack(FEATURED_TRACKS[0], FEATURED_TRACKS)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Ouvir Destaques de Hoje</span>
              </button>

              <button
                onClick={onOpenPlaylists}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-black/60 hover:bg-emerald-950/50 border border-emerald-950 text-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                <Disc3 className="w-4 h-4 text-emerald-400" />
                <span>Explorar Playlists</span>
              </button>
            </div>
          </div>

          {/* Decorative Turntable Mini Visual */}
          <div className="hidden lg:flex flex-col items-center justify-center shrink-0">
            <div className="relative w-44 h-44 rounded-full bg-radial from-[#121c17] via-black to-black border-4 border-emerald-950/80 shadow-2xl flex items-center justify-center animate-spin-slow">
              <div className="absolute inset-4 rounded-full border border-emerald-900/30" />
              <div className="absolute inset-8 rounded-full border border-zinc-800/40" />
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500/60 shadow-lg">
                <img
                  src={FEATURED_TRACKS[0].thumbnail}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute w-3 h-3 rounded-full bg-black border border-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Em Alta / Featured Tracks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Em Alta no MiGaTUBE</h2>
          </div>
          <span className="text-xs font-mono text-zinc-500">Músicas & Vídeos Recomendados</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURED_TRACKS.slice(0, 6).map((track) => {
            const isThisPlaying = currentTrack?.youtubeId === track.youtubeId && isPlaying;
            const isThisActive = currentTrack?.youtubeId === track.youtubeId;

            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track, FEATURED_TRACKS)}
                className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer group ${
                  isThisActive
                    ? 'bg-emerald-950/40 border-emerald-500/60'
                    : 'bg-[#09150f]/70 hover:bg-[#0c1f16] border-emerald-950/80 hover:border-emerald-800'
                }`}
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-black">
                  <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                      isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Play className="w-5 h-5 text-[#00ff88] fill-current" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h4
                    className={`text-xs sm:text-sm font-semibold truncate ${
                      isThisActive ? 'text-emerald-400 font-bold' : 'text-slate-100 group-hover:text-emerald-300'
                    }`}
                  >
                    {track.title}
                  </h4>
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenArtist(track.artist);
                    }}
                    className="text-xs text-zinc-400 hover:text-emerald-400 truncate"
                  >
                    {track.artist}
                  </p>
                  <span className="text-[10px] font-mono text-zinc-500">{track.duration}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToPlaylist(track);
                  }}
                  className="p-2 rounded-xl text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  title="Adicionar à playlist"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Artistas Populares */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Artistas em Destaque</h2>
          </div>
          <span className="text-xs font-mono text-zinc-500">Toque para ver discografia</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {FEATURED_ARTISTS.map((artist) => (
            <div
              key={artist.id}
              onClick={() => onOpenArtist(artist.name)}
              className="p-4 rounded-3xl bg-[#09150f]/60 hover:bg-[#0c1f16] border border-emerald-950/80 hover:border-emerald-700 transition-all text-center cursor-pointer group flex flex-col items-center"
            >
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 border-2 border-emerald-500/30 group-hover:border-emerald-400 group-hover:scale-105 transition-all shadow-md">
                <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 truncate w-full">
                {artist.name}
              </h4>
              <p className="text-[10px] font-mono text-emerald-500 uppercase mt-0.5">{artist.genre}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Gêneros & Estilos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Estilos & Gêneros</h2>
          </div>
          <span className="text-xs font-mono text-zinc-500">Pesquisar por categoria</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {GENRES.map((genre) => (
            <div
              key={genre.name}
              onClick={() => onSelectGenre(genre.name)}
              className="relative overflow-hidden h-24 rounded-2xl border border-emerald-950/80 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-md"
            >
              <img
                src={genre.coverUrl}
                alt={genre.name}
                className="w-full h-full object-cover group-hover:scale-110 filter brightness-60 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-3">
                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00ff88] transition-colors">
                  {genre.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Playlists Prontas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Playlists do MiGaTUBE</h2>
          </div>
          <button
            onClick={onOpenPlaylists}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Ver Todas
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {playlists.slice(0, 4).map((pl) => (
            <div
              key={pl.id}
              onClick={onOpenPlaylists}
              className="p-3 rounded-2xl bg-[#09150f]/60 hover:bg-[#0c1f16] border border-emerald-950/80 hover:border-emerald-800 transition-all cursor-pointer group"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-black">
                {pl.coverUrl ? (
                  <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-950 text-emerald-400">
                    <Disc3 className="w-10 h-10" />
                  </div>
                )}
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">
                {pl.name}
              </h4>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{pl.tracks.length} músicas</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
