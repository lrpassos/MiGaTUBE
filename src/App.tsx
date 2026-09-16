import React, { useState, useEffect } from 'react';
import { Radio, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { NavigationTab, SearchFilter, Track, AppSettings, Playlist } from './types';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import { searchYouTube } from './lib/youtube';
import { storage } from './lib/storage';
import { FEATURED_TRACKS } from './lib/curatedData';

import { Sidebar } from './components/Sidebar';
import { BottomNavigation } from './components/BottomNavigation';
import { SearchBar } from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import { HomeView } from './components/HomeView';
import { PlaylistsView } from './components/PlaylistsView';
import { FavoritesView } from './components/FavoritesView';
import { HistoryView } from './components/HistoryView';
import { ArtistView } from './components/ArtistView';
import { SettingsView } from './components/SettingsView';
import { Player } from './components/Player';
import { PlaylistModal } from './components/PlaylistModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [activeArtistName, setActiveArtistName] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('TODOS');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Player state
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState<Track | null>(null);

  // Settings state
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());

  // Playlist & Favorite counters
  const [favoritesCount, setFavoritesCount] = useState<number>(() => storage.getFavorites().length);
  const [playlistsCount, setPlaylistsCount] = useState<number>(() => storage.getPlaylists().length);

  const player = useYouTubePlayer();

  const refreshCounts = () => {
    setFavoritesCount(storage.getFavorites().length);
    setPlaylistsCount(storage.getPlaylists().length);
  };

  const handleSearch = async (query: string, filter: SearchFilter) => {
    setSearchQuery(query);
    setSearchFilter(filter);
    setCurrentTab('search');
    setActiveArtistName(null);
    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await searchYouTube(query, filter);
      setSearchResults(response.results);
    } catch (err: any) {
      setSearchError('Ocorreu um erro ao pesquisar. Tente novamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenArtist = (artistName: string) => {
    setActiveArtistName(artistName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectGenre = (genre: string) => {
    handleSearch(genre, 'MÚSICAS');
  };

  const handlePlayEntirePlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length > 0) {
      player.playTrack(playlist.tracks[0], playlist.tracks, 0);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#050806] text-slate-100 overflow-hidden font-sans">
      <OfflineIndicator />

      {/* Hidden YouTube Iframe Container */}
      <div
        id="youtube-player-anchor"
        className="fixed top-0 left-0 w-1 h-1 pointer-events-none opacity-0 overflow-hidden -z-50"
      >
        <div id="migatube-yt-iframe" />
      </div>

      {/* Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setActiveArtistName(null);
        }}
        favoritesCount={favoritesCount}
        playlistsCount={playlistsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto no-scrollbar relative pb-36 md:pb-28">
        {/* Top Header / App Bar */}
        <header className="sticky top-0 z-30 bg-[#050806]/90 backdrop-blur-md border-b border-emerald-950/80 px-4 md:px-8 py-3 flex items-center justify-between gap-4 select-none">
          {/* Mobile Brand Logo */}
          <div
            onClick={() => {
              setCurrentTab('home');
              setActiveArtistName(null);
            }}
            className="flex md:hidden items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black text-sm shadow-md shadow-emerald-500/30">
              M
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white font-display">
              MiGa<span className="text-[#00ff88]">TUBE</span>
            </span>
          </div>

          {/* Header Search Field (Visible on Desktop / Compact on Mobile) */}
          <div className="flex-1 max-w-xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              initialQuery={searchQuery}
              initialFilter={searchFilter}
            />
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <PWAInstallButton compact />
          </div>
        </header>

        {/* Dynamic Main Views */}
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {activeArtistName ? (
            <ArtistView
              artistName={activeArtistName}
              onBack={() => setActiveArtistName(null)}
              onPlayTrack={(track, all) => player.playTrack(track, all)}
              onAddToPlaylist={(track) => setSelectedTrackForPlaylist(track)}
              onOpenArtist={handleOpenArtist}
            />
          ) : currentTab === 'home' ? (
            <HomeView
              onPlayTrack={(track, all) => player.playTrack(track, all)}
              onAddToPlaylist={(track) => setSelectedTrackForPlaylist(track)}
              onOpenArtist={handleOpenArtist}
              onSelectGenre={handleSelectGenre}
              onOpenPlaylists={() => setCurrentTab('playlists')}
              currentTrack={player.currentTrack}
              isPlaying={player.isPlaying}
            />
          ) : currentTab === 'search' ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight font-display">
                  {searchQuery ? (
                    <>
                      Resultados para "<span className="text-[#00ff88]">{searchQuery}</span>"
                    </>
                  ) : (
                    'Explorar & Pesquisar'
                  )}
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Vídeos, canais e músicas oficiais disponíveis no YouTube.
                </p>
              </div>

              <SearchResults
                results={searchResults.length > 0 ? searchResults : FEATURED_TRACKS}
                isLoading={isSearching}
                error={searchError}
                currentTrack={player.currentTrack}
                isPlaying={player.isPlaying}
                onPlayTrack={(track, all) => player.playTrack(track, all)}
                onAddToPlaylist={(track) => setSelectedTrackForPlaylist(track)}
                onOpenArtist={handleOpenArtist}
              />
            </div>
          ) : currentTab === 'favorites' ? (
            <FavoritesView
              currentTrack={player.currentTrack}
              isPlaying={player.isPlaying}
              onPlayTrack={(track, all) => player.playTrack(track, all)}
              onAddToPlaylist={(track) => setSelectedTrackForPlaylist(track)}
            />
          ) : currentTab === 'playlists' ? (
            <PlaylistsView
              onPlayTrack={(track, all) => player.playTrack(track, all)}
              onPlayEntirePlaylist={handlePlayEntirePlaylist}
            />
          ) : currentTab === 'history' ? (
            <HistoryView
              onPlayTrack={(track, all) => player.playTrack(track, all)}
              onAddToPlaylist={(track) => setSelectedTrackForPlaylist(track)}
            />
          ) : currentTab === 'settings' ? (
            <SettingsView
              settings={settings}
              onUpdateSettings={setSettings}
            />
          ) : null}
        </div>
      </main>

      {/* Persistent Bottom Player Bar & Full Expanded Player Modal */}
      <Player
        currentTrack={player.currentTrack}
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        volume={player.volume}
        isMuted={player.isMuted}
        mode={player.mode}
        queue={player.queue}
        queueIndex={player.queueIndex}
        repeatMode={player.repeatMode}
        shuffle={player.shuffle}
        isExpanded={isPlayerExpanded}
        settings={settings}
        onTogglePlay={player.togglePlay}
        onSeek={player.seekTo}
        onSetVolume={player.setVolume}
        onToggleMute={player.toggleMute}
        onNext={player.nextTrack}
        onPrev={player.prevTrack}
        onToggleRepeat={player.toggleRepeat}
        onToggleShuffle={player.toggleShuffle}
        onSetMode={player.setMode}
        onToggleExpand={() => setIsPlayerExpanded(!isPlayerExpanded)}
        onAddToPlaylist={(track) => setSelectedTrackForPlaylist(track)}
        onPlayQueueItem={(track, index) => player.playTrack(track, player.queue, index)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setActiveArtistName(null);
        }}
        onOpenPlayer={() => setIsPlayerExpanded(true)}
        isPlaying={player.isPlaying}
      />

      {/* Add To Playlist Modal */}
      <PlaylistModal
        track={selectedTrackForPlaylist}
        isOpen={Boolean(selectedTrackForPlaylist)}
        onClose={() => setSelectedTrackForPlaylist(null)}
        onPlaylistsUpdated={refreshCounts}
      />
    </div>
  );
}
export default App;
