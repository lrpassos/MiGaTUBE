import React, { useState } from 'react';
import { Disc3, Plus, Play, Trash2, Music, Clock, ArrowLeft, MoreVertical, X } from 'lucide-react';
import { Playlist, Track } from '../types';
import { storage } from '../lib/storage';

interface PlaylistsViewProps {
  onPlayTrack: (track: Track, allTracks: Track[]) => void;
  onPlayEntirePlaylist: (playlist: Playlist) => void;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  onPlayTrack,
  onPlayEntirePlaylist,
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => storage.getPlaylists());
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const refresh = () => {
    const all = storage.getPlaylists();
    setPlaylists(all);
    if (selectedPlaylist) {
      const updated = all.find((p) => p.id === selectedPlaylist.id);
      setSelectedPlaylist(updated || null);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created = storage.createPlaylist(newTitle.trim(), newDesc.trim());
    setNewTitle('');
    setNewDesc('');
    setIsCreating(false);
    refresh();
    setSelectedPlaylist(created);
  };

  const handleDelete = (playlistId: string) => {
    if (window.confirm('Tem certeza de que deseja excluir esta playlist?')) {
      storage.deletePlaylist(playlistId);
      setSelectedPlaylist(null);
      refresh();
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    if (!selectedPlaylist) return;
    storage.removeTrackFromPlaylist(selectedPlaylist.id, trackId);
    refresh();
  };

  // If a playlist is opened, show its contents
  if (selectedPlaylist) {
    return (
      <div className="space-y-6 animate-in fade-in">
        {/* Back Button */}
        <button
          onClick={() => setSelectedPlaylist(null)}
          className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para todas as playlists</span>
        </button>

        {/* Playlist Hero Banner */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 rounded-3xl bg-gradient-to-b from-emerald-950/60 via-[#09150f] to-[#060c08] border border-emerald-900/40 shadow-xl">
          <div className="relative w-36 h-36 rounded-2xl overflow-hidden shadow-2xl bg-black border border-emerald-500/30 shrink-0">
            {selectedPlaylist.coverUrl ? (
              <img
                src={selectedPlaylist.coverUrl}
                alt={selectedPlaylist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-emerald-950 text-emerald-400">
                <Disc3 className="w-16 h-16 animate-spin-slow" />
              </div>
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              PLAYLIST PRIVADA
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
              {selectedPlaylist.name}
            </h1>
            {selectedPlaylist.description && (
              <p className="text-xs text-zinc-400 max-w-md">{selectedPlaylist.description}</p>
            )}
            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-mono text-zinc-400 pt-1">
              <span>{selectedPlaylist.tracks.length} músicas</span>
              <span>•</span>
              <span>Atualizado recentemente</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {selectedPlaylist.tracks.length > 0 && (
              <button
                onClick={() => onPlayEntirePlaylist(selectedPlaylist)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Reproduzir</span>
              </button>
            )}

            {!selectedPlaylist.isSystem && (
              <button
                onClick={() => handleDelete(selectedPlaylist.id)}
                className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                title="Excluir playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tracks List */}
        <div className="space-y-2">
          {selectedPlaylist.tracks.length === 0 ? (
            <div className="py-16 text-center space-y-2 border border-dashed border-emerald-950 rounded-3xl bg-[#09150f]/30">
              <Disc3 className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm text-zinc-300 font-semibold">Esta playlist está vazia</p>
              <p className="text-xs text-zinc-500">
                Pesquise por músicas ou artistas e clique no ícone "+" para adicioná-las aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {selectedPlaylist.tracks.map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#09150f]/60 hover:bg-[#0c1f16] border border-emerald-950/70 hover:border-emerald-800 transition-all group"
                >
                  <div
                    onClick={() => onPlayTrack(track, selectedPlaylist.tracks)}
                    className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                  >
                    <span className="w-5 text-center text-xs font-mono text-zinc-500 group-hover:text-emerald-400">
                      {idx + 1}
                    </span>
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 pr-2">
                      <h4 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 truncate">
                        {track.title}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-zinc-500">{track.duration || '3:30'}</span>
                    <button
                      onClick={() => handleRemoveTrack(track.id || track.youtubeId)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remover da playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Playlists Index Grid
  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-display">
            Suas <span className="text-[#00ff88]">Playlists</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Crie coleções personalizadas para curtir no MiGaTUBE.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Playlist</span>
        </button>
      </div>

      {/* Inline Create Form Modal */}
      {isCreating && (
        <div className="p-5 rounded-3xl bg-[#09150f] border border-emerald-500/40 shadow-xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Criar Nova Playlist</h4>
            <button
              onClick={() => setIsCreating(false)}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Nome da Playlist (ex: Reggae das Antigas, Rock Clássico...)"
              className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-emerald-950 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Descrição opcional..."
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-emerald-950 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black text-xs font-semibold"
              >
                Salvar Playlist
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Playlists */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            onClick={() => setSelectedPlaylist(playlist)}
            className="group p-3.5 rounded-3xl bg-[#09150f]/80 hover:bg-[#0c1f16] border border-emerald-950/80 hover:border-emerald-800 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/60 mb-3 shadow-md">
              {playlist.coverUrl ? (
                <img
                  src={playlist.coverUrl}
                  alt={playlist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-950/40 text-emerald-400">
                  <Disc3 className="w-12 h-12" />
                </div>
              )}

              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayEntirePlaylist(playlist);
                  }}
                  className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-lg shadow-emerald-500/40"
                  title="Reproduzir playlist"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 truncate">
                {playlist.name}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {playlist.tracks.length} {playlist.tracks.length === 1 ? 'música' : 'músicas'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
