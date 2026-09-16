import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  ChevronDown,
  ChevronUp,
  Maximize2,
  ListMusic,
  Heart,
  Plus,
  Disc3,
  Video,
  Radio,
  Tv,
  ExternalLink,
  AlertCircle,
  X,
} from 'lucide-react';
import { Track, AppSettings } from '../types';
import { VUMeter } from './VUMeter';
import { VinylPlayer } from './VinylPlayer';
import { storage } from '../lib/storage';
import { AudioWaveform, getVolumeColor } from './AudioWaveform';

interface PlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  mode: 'vinyl' | 'video';
  queue: Track[];
  queueIndex: number;
  repeatMode: 'off' | 'all' | 'one';
  shuffle: boolean;
  isExpanded: boolean;
  settings: AppSettings;
  showFloatingVideo?: boolean;
  onToggleFloatingVideo?: () => void;
  playbackError?: string | null;
  onClearPlaybackError?: () => void;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onSetVolume: (vol: number) => void;
  onToggleMute: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onSetMode: (mode: 'vinyl' | 'video') => void;
  onToggleExpand: () => void;
  onAddToPlaylist: (track: Track) => void;
  onPlayQueueItem: (track: Track, index: number) => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const Player: React.FC<PlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  mode,
  queue,
  queueIndex,
  repeatMode,
  shuffle,
  isExpanded,
  settings,
  showFloatingVideo,
  onToggleFloatingVideo,
  playbackError,
  onClearPlaybackError,
  onTogglePlay,
  onSeek,
  onSetVolume,
  onToggleMute,
  onNext,
  onPrev,
  onToggleRepeat,
  onToggleShuffle,
  onSetMode,
  onToggleExpand,
  onAddToPlaylist,
  onPlayQueueItem,
}) => {
  const [showQueue, setShowQueue] = useState(false);
  const [isFav, setIsFav] = useState(() => (currentTrack ? storage.isFavorite(currentTrack.id || currentTrack.youtubeId) : false));

  // Sync favorite state
  React.useEffect(() => {
    if (currentTrack) {
      setIsFav(storage.isFavorite(currentTrack.id || currentTrack.youtubeId));
    }
  }, [currentTrack]);

  if (!currentTrack) {
    return null;
  }

  const handleToggleFavorite = () => {
    if (currentTrack) {
      const fav = storage.toggleFavorite(currentTrack);
      setIsFav(fav);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* 1. PERSISTENT BOTTOM PLAYER BAR */}
      <div
        id="persistent-bottom-player"
        className="fixed bottom-[calc(54px+max(6px,env(safe-area-inset-bottom,6px)))] md:bottom-0 inset-x-0 z-30 bg-[#060d09]/95 border-t border-emerald-950/90 backdrop-blur-xl px-3 md:px-6 py-2.5 transition-all select-none"
      >
        {/* Progress Bar (Clickable top edge) */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = clickX / rect.width;
            onSeek(ratio * duration);
          }}
          className="absolute -top-1.5 inset-x-0 h-3 group cursor-pointer flex items-center"
        >
          <div className="w-full h-1 bg-emerald-950 group-hover:h-1.5 transition-all rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 via-[#00ff88] to-emerald-400 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 md:gap-6 max-w-7xl mx-auto">
          {/* Left: Track Info */}
          <div
            onClick={onToggleExpand}
            className="flex items-center gap-3 min-w-0 max-w-[200px] md:max-w-xs cursor-pointer group"
          >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-emerald-500/30 shadow-md bg-black">
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform ${
                  mode === 'vinyl' && isPlaying && settings.vinylAnimation ? 'scale-105' : ''
                }`}
                referrerPolicy="no-referrer"
              />
              {mode === 'vinyl' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-2.5 h-2.5 rounded-full bg-black/80 border border-emerald-400" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h4 className="text-xs md:text-sm font-semibold text-slate-100 truncate group-hover:text-emerald-400 transition-colors">
                {currentTrack.title}
              </h4>
              <p className="text-[11px] text-zinc-400 truncate">{currentTrack.artist}</p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite();
              }}
              className={`p-1.5 rounded-lg transition-colors hidden sm:block ${
                isFav ? 'text-red-400' : 'text-zinc-500 hover:text-white'
              }`}
              title="Favoritar"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Center: Controls & Scrubber (Desktop) */}
          <div className="flex flex-col items-center gap-1 flex-1 max-w-xl">
            <div className="flex items-center gap-3 md:gap-5">
              <button
                type="button"
                onClick={onToggleShuffle}
                className={`p-1.5 rounded-lg transition-colors hidden sm:block ${
                  shuffle ? 'text-[#00ff88]' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Modo aleatório"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onPrev}
                className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Anterior"
              >
                <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              <button
                type="button"
                id="btn-play-pause-bottom"
                onClick={onTogglePlay}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer"
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 md:w-5 md:h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={onNext}
                className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Próxima"
              >
                <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              <button
                type="button"
                onClick={onToggleRepeat}
                className={`p-1.5 rounded-lg transition-colors hidden sm:block ${
                  repeatMode !== 'off' ? 'text-[#00ff88]' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title={`Repetir: ${repeatMode}`}
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Time Indicators (Desktop) */}
            <div className="w-full hidden md:flex items-center justify-between text-[10px] font-mono text-zinc-500 px-1">
              <span>{formatTime(currentTime)}</span>
              <span className="text-emerald-500/70 font-semibold">{mode === 'vinyl' ? 'VINIL DIGITAL' : 'VÍDEO OFICIAL'}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: VU Meter, Volume, Queue & Expand */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* VU Meter */}
            {settings.vuMeterEnabled && (
              <div className="hidden lg:block">
                <VUMeter isPlaying={isPlaying} compact />
              </div>
            )}

            {/* Mode switch */}
            <button
              type="button"
              onClick={() => onSetMode(mode === 'vinyl' ? 'video' : 'vinyl')}
              className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 border transition-all cursor-pointer ${
                mode === 'vinyl'
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700'
              }`}
              title={mode === 'vinyl' ? 'Alternar para Vídeo' : 'Alternar para Vinil'}
            >
              {mode === 'vinyl' ? (
                <>
                  <Disc3 className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline text-[10px]">VINIL</span>
                </>
              ) : (
                <>
                  <Video className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline text-[10px]">VÍDEO</span>
                </>
              )}
            </button>

            {/* Volume (Desktop) */}
            <div className="hidden md:flex items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleMute}
                className="p-1.5 text-zinc-400 hover:text-white"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-zinc-500" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => onSetVolume(parseInt(e.target.value, 10))}
                className="w-20 h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Queue Toggle */}
            <button
              type="button"
              onClick={() => setShowQueue(!showQueue)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                showQueue
                  ? 'bg-emerald-500/20 text-[#00ff88] border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              title="Fila de reprodução"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* PiP Floating Screen Toggle */}
            {onToggleFloatingVideo && (
              <button
                type="button"
                id="btn-pip-toggle"
                onClick={onToggleFloatingVideo}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  showFloatingVideo
                    ? 'bg-emerald-500/20 text-[#00ff88] border border-emerald-500/40'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
                title={showFloatingVideo ? 'Ocultar tela flutuante' : 'Ver vídeo flutuante (PiP)'}
              >
                <Tv className="w-4 h-4" />
              </button>
            )}

            {/* Expand / Maximize button */}
            <button
              type="button"
              id="btn-expand-player"
              onClick={onToggleExpand}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Expandir player"
            >
              <ChevronUp className="w-5 h-5 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXPANDED FULL-SCREEN PLAYER MODAL */}
      <div
        id="expanded-player-modal"
        className={`fixed inset-0 z-50 bg-[#050706] flex flex-col justify-between overflow-y-auto pb-safe transition-all duration-200 select-none ${
          isExpanded
            ? 'opacity-100 pointer-events-auto visible'
            : 'opacity-0 pointer-events-none -top-[99999px] -left-[99999px] invisible'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:px-8 border-b border-emerald-950/60 shrink-0">
          <button
            type="button"
            onClick={onToggleExpand}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Minimizar player"
          >
            <ChevronDown className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm md:text-base tracking-tight text-white font-display">
                MiGa<span className="text-[#00ff88]">TUBE</span>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                {mode === 'vinyl' ? 'Deck de Vinil Digital' : 'Player de Vídeo'}
              </span>
            </div>
            {/* Waveform under the name MiGaTUBE with volume gradient */}
            <div className="mt-1">
              <AudioWaveform
                volume={isMuted ? 0 : volume}
                isPlaying={isPlaying}
                barCount={20}
                height={14}
                showLabel={true}
              />
            </div>
          </div>

          {/* Mode Switch Pills */}
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-emerald-950">
            <button
              type="button"
              onClick={() => onSetMode('vinyl')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'vinyl'
                  ? 'bg-emerald-500 text-black shadow-xs shadow-emerald-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Disc3 className="w-3.5 h-3.5" />
              <span>Vinil</span>
            </button>

            <button
              type="button"
              onClick={() => onSetMode('video')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'video'
                  ? 'bg-emerald-500 text-black shadow-xs shadow-emerald-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Vídeo</span>
            </button>
          </div>
        </div>

          {/* Playback Error Warning Banner */}
          {playbackError && (
            <div className="mx-4 md:mx-8 mt-3 p-3 rounded-2xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{playbackError}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onNext}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-[11px] transition-colors"
                >
                  Próxima Faixa
                </button>
                {onClearPlaybackError && (
                  <button
                    type="button"
                    onClick={onClearPlaybackError}
                    className="p-1 rounded-md text-amber-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Main Visual Arena */}
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-4 md:p-8 gap-6 max-w-6xl mx-auto w-full">
            {/* Visualizer Area (Vinyl Deck OR Video Player) */}
            <div className="w-full flex-1 max-w-xl flex flex-col items-center justify-center relative min-h-[320px] md:min-h-[400px]">
              {/* 1. Vinyl Deck Option */}
              <div className={`w-full flex flex-col items-center transition-all duration-300 ${mode === 'vinyl' ? 'block' : 'hidden'}`}>
                <VinylPlayer
                  track={currentTrack}
                  isPlaying={isPlaying}
                  animateVinyl={settings.vinylAnimation}
                />

                {/* Corner VU Meter under vinyl */}
                {settings.vuMeterEnabled && (
                  <div className="mt-2 flex items-center justify-center">
                    <VUMeter isPlaying={isPlaying} />
                  </div>
                )}
              </div>

              {/* 2. Video Player Option: Directly replaces vinyl deck in place, no popup */}
              <div
                className={`w-full flex flex-col items-center transition-all duration-300 ${
                  mode === 'video'
                    ? 'block'
                    : 'fixed -top-[9999px] -left-[9999px] w-[320px] h-[180px] pointer-events-none opacity-0'
                }`}
              >
                <div className="w-full aspect-video rounded-3xl overflow-hidden bg-black border-2 border-emerald-500/60 shadow-2xl shadow-emerald-950/80 relative flex items-center justify-center">
                  {currentTrack.audioUrl ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-emerald-950/50 via-black to-black text-center">
                      <img
                        src={currentTrack.thumbnail}
                        alt=""
                        className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover mb-3 shadow-2xl border border-emerald-500/40"
                      />
                      <span className="text-xs text-emerald-400 font-mono font-bold uppercase tracking-wider">
                        Áudio Sem Restrição • {currentTrack.source === 'audius' ? 'Audius Open Source' : 'Streaming Hi-Fi'}
                      </span>
                      <p className="text-base font-bold text-white mt-1 max-w-sm truncate">{currentTrack.title}</p>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{currentTrack.artist}</p>
                      <div className="mt-4">
                        <AudioWaveform volume={isMuted ? 0 : volume} isPlaying={isPlaying} barCount={26} height={16} showLabel={false} />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full">
                      <div id="migatube-yt-iframe" className="w-full h-full" />
                    </div>
                  )}
                </div>

                {settings.vuMeterEnabled && (
                  <div className="mt-2 flex items-center justify-center">
                    <VUMeter isPlaying={isPlaying} compact />
                  </div>
                )}
              </div>
            </div>

            {/* Info & Transport Section */}
            <div className="w-full lg:w-96 flex flex-col justify-center space-y-6">
              {/* Track Title & Artist */}
              <div className="space-y-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-950 text-emerald-400 border border-emerald-900">
                    {currentTrack.genre || 'Música'}
                  </span>
                  {currentTrack.album && (
                    <span className="text-xs text-zinc-500 truncate max-w-[180px]">
                      {currentTrack.album}
                    </span>
                  )}
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug line-clamp-2">
                  {currentTrack.title}
                </h2>
                <p className="text-sm md:text-base text-emerald-400 font-medium">
                  {currentTrack.artist}
                </p>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2">
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const ratio = clickX / rect.width;
                    onSeek(ratio * duration);
                  }}
                  className="w-full h-3 flex items-center cursor-pointer group"
                >
                  <div className="w-full h-1.5 bg-[#0e2117] rounded-full overflow-hidden group-hover:h-2 transition-all">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#00ff88] rounded-full shadow-[0_0_8px_#00ff88]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs font-mono text-zinc-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Transport Buttons */}
              <div className="flex items-center justify-between px-2">
                <button
                  type="button"
                  onClick={onToggleShuffle}
                  className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                    shuffle ? 'text-[#00ff88] bg-emerald-950/40' : 'text-zinc-500 hover:text-white'
                  }`}
                  title="Aleatório"
                >
                  <Shuffle className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={onPrev}
                  className="p-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  title="Faixa anterior"
                >
                  <SkipBack className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  id="btn-play-pause-expanded"
                  onClick={onTogglePlay}
                  className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-xl shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer"
                  title={isPlaying ? 'Pausar' : 'Reproduzir'}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current ml-1" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={onNext}
                  className="p-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  title="Próxima faixa"
                >
                  <SkipForward className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={onToggleRepeat}
                  className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                    repeatMode !== 'off' ? 'text-[#00ff88] bg-emerald-950/40' : 'text-zinc-500 hover:text-white'
                  }`}
                  title={`Repetir: ${repeatMode}`}
                >
                  <Repeat className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Actions Row */}
              <div className="flex items-center justify-around pt-2 border-t border-emerald-950/70">
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isFav ? 'text-red-400 bg-red-500/10' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  <span>{isFav ? 'Favoritado' : 'Favoritar'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddToPlaylist(currentTrack)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar à Playlist</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQueue(!showQueue)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    showQueue ? 'text-[#00ff88] bg-emerald-950/50' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ListMusic className="w-4 h-4" />
                  <span>Fila ({queue.length})</span>
                </button>
              </div>

              {/* Volume Slider in Modal with dynamic gradient color */}
              {(() => {
                const volColor = getVolumeColor(isMuted ? 0 : volume);
                return (
                  <div className="flex items-center gap-3 bg-[#08150f] p-3 rounded-2xl border border-emerald-950 transition-colors">
                    <button
                      type="button"
                      onClick={onToggleMute}
                      className="transition-colors cursor-pointer"
                      style={{ color: volColor.hex }}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => onSetVolume(parseInt(e.target.value, 10))}
                      style={{ accentColor: volColor.hex }}
                      className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer"
                    />
                    <span
                      className="text-xs font-mono font-bold w-10 text-right transition-colors"
                      style={{ color: volColor.hex }}
                    >
                      {isMuted ? '0%' : `${volume}%`}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Queue Drawer Overlay inside Expanded Modal */}
          {showQueue && (
            <div className="border-t border-emerald-950/80 bg-[#060c08] p-4 max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between mb-3 max-w-6xl mx-auto">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ListMusic className="w-4 h-4 text-emerald-400" />
                  Fila de Reprodução ({queue.length} faixas)
                </h4>
                <button
                  type="button"
                  onClick={() => setShowQueue(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Fechar
                </button>
              </div>

              <div className="space-y-1.5 max-w-6xl mx-auto">
                {queue.map((item, idx) => {
                  const isCurrent = idx === queueIndex;
                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      onClick={() => onPlayQueueItem(item, idx)}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-500/15 text-[#00ff88] font-bold border border-emerald-500/30'
                          : 'hover:bg-white/5 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="w-4 text-zinc-500 text-center">{idx + 1}</span>
                        <img src={item.thumbnail} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <div className="truncate">
                          <p className="truncate">{item.title}</p>
                          <p className="text-[10px] text-zinc-500">{item.artist}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0 ml-2">
                        {item.duration || '3:30'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
    </>
  );
};
