import React, { useState } from 'react';
import { X, Plus, Check, Disc3, Music } from 'lucide-react';
import { Track, Playlist } from '../types';
import { storage } from '../lib/storage';

interface PlaylistModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onPlaylistsUpdated?: () => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  track,
  isOpen,
  onClose,
  onPlaylistsUpdated,
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => storage.getPlaylists());
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setPlaylists(storage.getPlaylists());
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen || !track) return null;

  const handleAddToPlaylist = (playlistId: string, playlistName: string) => {
    const success = storage.addTrackToPlaylist(playlistId, track);
    if (success) {
      setFeedback(`Adicionado a "${playlistName}"!`);
      setPlaylists(storage.getPlaylists());
      if (onPlaylistsUpdated) onPlaylistsUpdated();
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setFeedback(`Esta música já está em "${playlistName}".`);
    }
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const created = storage.createPlaylist(newPlaylistName.trim());
    storage.addTrackToPlaylist(created.id, track);
    setNewPlaylistName('');
    setFeedback(`Playlist "${created.name}" criada com a música!`);
    setPlaylists(storage.getPlaylists());
    if (onPlaylistsUpdated) onPlaylistsUpdated();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[#09150f] border border-emerald-500/30 p-6 shadow-2xl space-y-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-[#00ff88] flex items-center justify-center">
              <Disc3 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Adicionar à Playlist</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Track Preview */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 border border-emerald-950">
          <img
            src={track.thumbnail}
            alt={track.title}
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{track.title}</p>
            <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
          </div>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-[#00ff88]" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Existing Playlists list */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Suas Playlists</p>
          {playlists.map((pl) => {
            const hasTrack = pl.tracks.some((t) => t.id === track.id || t.youtubeId === track.youtubeId);

            return (
              <button
                key={pl.id}
                type="button"
                onClick={() => handleAddToPlaylist(pl.id, pl.name)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#060c08] hover:bg-emerald-950/40 border border-emerald-950 hover:border-emerald-800 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300">
                      {pl.name}
                    </h5>
                    <p className="text-[10px] text-zinc-500">{pl.tracks.length} músicas</p>
                  </div>
                </div>

                {hasTrack ? (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Adicionada
                  </span>
                ) : (
                  <Plus className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Create New Playlist Inline */}
        <form onSubmit={handleCreateNew} className="pt-2 border-t border-emerald-950/80">
          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
            Criar Nova Playlist
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Ex: Reggae das Antigas..."
              className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-emerald-950 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!newPlaylistName.trim()}
              className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Criar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
