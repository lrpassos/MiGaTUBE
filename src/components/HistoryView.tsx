import React, { useState } from 'react';
import { Clock, Play, Trash2, Plus, RotateCcw } from 'lucide-react';
import { Track } from '../types';
import { storage } from '../lib/storage';

interface HistoryViewProps {
  onPlayTrack: (track: Track, allTracks: Track[]) => void;
  onAddToPlaylist: (track: Track) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onPlayTrack,
  onAddToPlaylist,
}) => {
  const [history, setHistory] = useState<Track[]>(() => storage.getHistory());

  const handleClearHistory = () => {
    if (window.confirm('Deseja limpar todo o histórico de reprodução?')) {
      storage.clearHistory();
      setHistory([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-display flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-400" />
            Histórico de <span className="text-[#00ff88]">Reprodução</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Músicas e vídeos tocados recentemente no seu dispositivo.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Histórico</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-20 text-center space-y-2 rounded-3xl border border-dashed border-emerald-950 bg-[#09150f]/30">
          <Clock className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-sm font-semibold text-zinc-300">Nenhum histórico disponível</p>
          <p className="text-xs text-zinc-500">
            As músicas e vídeos que você reproduzir aparecerão aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((track, idx) => (
            <div
              key={`${track.id || track.youtubeId}-${idx}`}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#09150f]/60 hover:bg-[#0c1f16] border border-emerald-950/80 hover:border-emerald-800 transition-all group"
            >
              <div
                onClick={() => onPlayTrack(track, history)}
                className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black">
                  <img src={track.thumbnail} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <RotateCcw className="w-4 h-4 text-[#00ff88]" />
                  </div>
                </div>
                <div className="min-w-0 pr-2">
                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 truncate">
                    {track.title}
                  </h4>
                  <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-zinc-500 mr-2">{track.duration || '3:30'}</span>

                <button
                  onClick={() => onPlayTrack(track, history)}
                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-[#00ff88] transition-colors"
                  title="Reproduzir novamente"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>

                <button
                  onClick={() => onAddToPlaylist(track)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
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
  );
};
