import React from 'react';
import { Play, Pause, SkipForward, Maximize2, X, Disc3 } from 'lucide-react';
import { Track } from '../types';

interface MiniPlayerProps {
  track: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onExpand: () => void;
  onClose: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  track,
  isPlaying,
  onTogglePlay,
  onNext,
  onExpand,
  onClose,
}) => {
  return (
    <div
      id="mini-player-floating"
      onClick={onExpand}
      className="fixed bottom-16 md:bottom-24 right-4 z-40 flex items-center gap-3 p-2 pr-3 rounded-2xl bg-[#09150f]/95 border border-emerald-500/40 shadow-2xl backdrop-blur-md cursor-pointer hover:border-emerald-400 transition-all select-none max-w-xs animate-in slide-in-from-bottom-4"
    >
      {/* Mini Rotating Vinyl or Thumbnail */}
      <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-emerald-500/60 shadow-md bg-black">
        <img
          src={track.thumbnail}
          alt={track.title}
          className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : 'paused'}`}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-black border border-emerald-400" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 pr-1">
        <h5 className="text-xs font-bold text-slate-100 truncate">{track.title}</h5>
        <p className="text-[10px] text-zinc-400 truncate">{track.artist}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onTogglePlay}
          className="p-1.5 rounded-full bg-emerald-500 text-black hover:bg-emerald-400 transition-colors shadow-sm shadow-emerald-500/40 cursor-pointer"
          title={isPlaying ? 'Pausar' : 'Reproduzir'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={onNext}
          className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Próxima faixa"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-white/10 transition-colors cursor-pointer"
          title="Fechar mini player"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
