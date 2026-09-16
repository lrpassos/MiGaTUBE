import React from 'react';
import {
  Play,
  Disc3,
  Heart,
  Plus,
  Sparkles,
  TrendingUp,
  Radio,
  Compass,
  Users,
  Layers,
  ArrowRight,
  Music,
  Video,
  Volume2,
} from 'lucide-react';
import { Track, Playlist, MusicSource } from '../types';
import { FEATURED_TRACKS, FEATURED_ARTISTS, GENRES } from '../lib/curatedData';
import { storage } from '../lib/storage';

interface HomeViewProps {
  onPlayTrack: (track: Track, allTracks: Track[]) => void;
  onAddToPlaylist: (track: Track) => void;
  onOpenArtist: (name: string) => void;
  onSelectGenre: (genre: string) => void;
  onOpenPlaylists: () => void;
  onQuickSearch?: (query: string, source?: MusicSource) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
}

const QUICK_SEARCH_CHIPS = [
  { label: 'Marília Mendonça', query: 'Marília Mendonça' },
  { label: 'Coldplay', query: 'Coldplay' },
  { label: 'Queen', query: 'Queen' },
  { label: 'Alok', query: 'Alok' },
  { label: 'Adele', query: 'Adele' },
  { label: 'Bob Marley', query: 'Bob Marley' },
  { label: 'Ludmilla', query: 'Ludmilla' },
  { label: 'Tim Maia', query: 'Tim Maia' },
  { label: 'Lo-Fi Chill', query: 'Lo-Fi Chill Beats' },
  { label: 'Acoustic Guitar', query: 'Acoustic Guitar' },
];

export const HomeView: React.FC<HomeViewProps> = ({
  onPlayTrack,
  onAddToPlaylist,
  onOpenArtist,
  onSelectGenre,
  onOpenPlaylists,
  onQuickSearch,
  currentTrack,
  isPlaying,
}) => {
  const playlists = storage.getPlaylists();

  const handleSourceExplore = (source: MusicSource, defaultQuery: string) => {
    if (onQuickSearch) {
      onQuickSearch(defaultQuery, source);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10 animate-in fade-in pb-8">
      {/* 1. Hero Showcase */}
      <div className="relative rounded-3xl overflow-hidden p-5 sm:p-7 md:p-9 bg-gradient-to-br from-[#07170f] via-[#05100a] to-[#020504] border border-emerald-900/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-3 sm:space-y-4 text-center lg:text-left max-w-2xl">
            {/* Engine Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#00ff88] text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Multi-Fonte: YouTube • SoundCloud • Jamendo</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display leading-tight">
              Música Ilimitada no <span className="text-[#00ff88] neon-text-glow">MiGaTUBE</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Ouça qualquer música, artista ou banda combinando a potência do YouTube, o acervo streaming do SoundCloud e as faixas 100% livres do Jamendo, tudo em áudio cristalino com vinil digital.
            </p>

            {/* Quick Action CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => onPlayTrack(FEATURED_TRACKS[0], FEATURED_TRACKS)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer min-h-[44px]"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Ouvir Destaques de Hoje</span>
              </button>

              <button
                type="button"
                onClick={onOpenPlaylists}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-black/60 hover:bg-emerald-950/50 border border-emerald-950 text-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px]"
              >
                <Disc3 className="w-4 h-4 text-emerald-400" />
                <span>Minhas Playlists</span>
              </button>
            </div>

            {/* Fast Search Chips */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-center lg:justify-start gap-1.5">
                <span>Pesquisas Populares:</span>
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5">
                {QUICK_SEARCH_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onQuickSearch?.(chip.query)}
                    className="px-2.5 py-1 rounded-lg bg-[#09150f]/90 hover:bg-emerald-500/20 border border-emerald-900/60 hover:border-emerald-500/40 text-xs text-zinc-300 hover:text-emerald-300 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Decorative Turntable Mini Visual */}
          <div className="hidden lg:flex flex-col items-center justify-center shrink-0">
            <div className="relative w-48 h-48 rounded-full bg-radial from-[#121c17] via-black to-black border-4 border-emerald-950/80 shadow-2xl flex items-center justify-center animate-spin-slow">
              <div className="absolute inset-4 rounded-full border border-emerald-900/30" />
              <div className="absolute inset-8 rounded-full border border-zinc-800/40" />
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500/60 shadow-lg">
                <img
                  src={FEATURED_TRACKS[0].thumbnail}
                  alt="Vinil"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute w-3.5 h-3.5 rounded-full bg-black border-2 border-emerald-400" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400/80 mt-2">33⅓ RPM Hi-Fi Analog</span>
          </div>
        </div>
      </div>

      {/* 2. Integrated Music Sources Showcase */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Fontes de Áudio Integradas</h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono hidden sm:inline">3 Plataformas Unificadas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* YouTube Card */}
          <div
            onClick={() => handleSourceExplore('youtube', 'Música Oficial Brasil')}
            className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#180808]/80 to-[#09150f] border border-red-950/80 hover:border-red-500/50 transition-all cursor-pointer shadow-md flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> YouTube Oficial
                </span>
                <ArrowRight className="w-4 h-4 text-red-400/60 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-red-300 transition-colors">
                Catálogo Global & Vídeos
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Clipes oficiais, shows ao vivo, álbuns de grandes gravadoras e playlists do YouTube.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-red-400 flex items-center gap-1 pt-1">
              <span>Buscar no YouTube</span>
              <span>→</span>
            </div>
          </div>

          {/* SoundCloud Card */}
          <div
            onClick={() => handleSourceExplore('soundcloud', 'Brazilian Music')}
            className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1a0e05]/80 to-[#09150f] border border-orange-950/80 hover:border-orange-500/50 transition-all cursor-pointer shadow-md flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-orange-500" /> SoundCloud
                </span>
                <ArrowRight className="w-4 h-4 text-orange-400/60 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-orange-300 transition-colors">
                Streaming Direto & Remixes
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Áudio contínuo sem cortes de vídeo, faixas eletrônicas, versões acústicas e novidades de criadores.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-orange-400 flex items-center gap-1 pt-1">
              <span>Buscar no SoundCloud</span>
              <span>→</span>
            </div>
          </div>

          {/* Jamendo Card */}
          <div
            onClick={() => handleSourceExplore('jamendo', 'Pop Rock')}
            className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#051717]/80 to-[#09150f] border border-teal-950/80 hover:border-teal-500/50 transition-all cursor-pointer shadow-md flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-teal-400" /> Jamendo Livre
                </span>
                <ArrowRight className="w-4 h-4 text-teal-400/60 group-hover:text-teal-300 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                100% Livre & Sem Anúncios
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Catálogo independente de alta qualidade para ouvir sem restrições de direitos autorais ou propagandas.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-teal-300 flex items-center gap-1 pt-1">
              <span>Buscar no Jamendo</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Em Alta / Featured Tracks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Em Alta no MiGaTUBE</h2>
          </div>
          <span className="text-xs font-mono text-zinc-400 hidden sm:inline">Recomendações em alta</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURED_TRACKS.slice(0, 6).map((track) => {
            const isThisPlaying = currentTrack?.youtubeId === track.youtubeId && isPlaying;
            const isThisActive = currentTrack?.youtubeId === track.youtubeId;

            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track, FEATURED_TRACKS)}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer group min-h-[64px] ${
                  isThisActive
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                    : 'bg-[#09150f]/80 hover:bg-[#0c1f16] border-emerald-950/80 hover:border-emerald-800'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-black shadow-md">
                  <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" loading="lazy" />
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                      isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-lg shadow-emerald-500/40">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Track Details */}
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
                    className="text-xs text-zinc-400 hover:text-emerald-400 truncate mt-0.5 cursor-pointer"
                  >
                    {track.artist}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-zinc-500">{track.duration}</span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-[9px] font-mono text-emerald-400">
                      Hi-Fi
                    </span>
                  </div>
                </div>

                {/* Quick Add */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToPlaylist(track);
                  }}
                  className="p-2.5 rounded-xl text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer shrink-0"
                  title="Adicionar à playlist"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Artistas em Destaque */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Artistas em Destaque</h2>
          </div>
          <span className="text-xs font-mono text-zinc-400 hidden sm:inline">Toque para ouvir discografia</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {FEATURED_ARTISTS.map((artist) => (
            <div
              key={artist.id}
              onClick={() => onOpenArtist(artist.name)}
              className="p-3 sm:p-4 rounded-3xl bg-[#09150f]/70 hover:bg-[#0c1f16] border border-emerald-950/80 hover:border-emerald-600 transition-all text-center cursor-pointer group flex flex-col items-center shadow-sm"
            >
              <div className="relative w-18 h-18 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-2.5 border-2 border-emerald-500/30 group-hover:border-emerald-400 group-hover:scale-105 transition-all shadow-md">
                <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 truncate w-full">
                {artist.name}
              </h4>
              <p className="text-[10px] font-mono text-emerald-400 uppercase mt-0.5 truncate w-full">{artist.genre}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Gêneros & Estilos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Estilos & Gêneros</h2>
          </div>
          <span className="text-xs font-mono text-zinc-400 hidden sm:inline">Explorar por categoria</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
                referrerPolicy="no-referrer"
                loading="lazy"
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

      {/* 6. Playlists do MiGaTUBE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Playlists Criadas</h2>
          </div>
          <button
            type="button"
            onClick={onOpenPlaylists}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
          >
            Ver Todas
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {playlists.slice(0, 4).map((pl) => (
            <div
              key={pl.id}
              onClick={onOpenPlaylists}
              className="p-3 rounded-2xl bg-[#09150f]/70 hover:bg-[#0c1f16] border border-emerald-950/80 hover:border-emerald-800 transition-all cursor-pointer group shadow-sm"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-black">
                {pl.coverUrl ? (
                  <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-950 text-emerald-400">
                    <Disc3 className="w-8 h-8" />
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
