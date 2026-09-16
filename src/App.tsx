import React, { useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import { Track, Playlist, AppSettings, SearchFilter, YouTubePlaylist, MusicSource } from './types';
import { storage } from './lib/storage';
import { FEATURED_TRACKS } from './lib/curatedData';
import { searchYouTube, fetchPlaylistTracks } from './lib/youtube';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';

// Modular Components
import { Sidebar } from './components/Sidebar';
import { BottomNavigation } from './components/BottomNavigation';
import { SearchBar } from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import { Player } from './components/Player';
import { HomeView } from './components/HomeView';
import { FavoritesView } from './components/FavoritesView';
import { PlaylistsView } from './components/PlaylistsView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { ArtistView } from './components/ArtistView';
import { PlaylistModal } from './components/PlaylistModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { AudioWaveform } from './components/AudioWaveform';

export function App() {
  // Navigation & Screen state
  const [currentTab, setCurrentTab] = useState<'home' | 'search' | 'favorites' | 'playlists' | 'history' | 'settings'>('home');
  const [activeArtistName, setActiveArtistName] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('TODOS');
  const [searchSource, setSearchSource] = useState<MusicSource>('all');
  const [countsBySource, setCountsBySource] = useState<{
    all: number;
    youtube: number;
    jamendo: number;
    soundcloud: number;
  }>({ all: 0, youtube: 0, jamendo: 0, soundcloud: 0 });
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searchPlaylists, setSearchPlaylists] = useState<YouTubePlaylist[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [correctedQuery, setCorrectedQuery] = useState<string | undefined>();
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Player state
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [showFloatingVideo, setShowFloatingVideo] = useState(false);
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

  const handleSearch = async (
    query: string,
    filter: SearchFilter = searchFilter,
    source: MusicSource = searchSource
  ) => {
    setSearchQuery(query);
    setSearchFilter(filter);
    setSearchSource(source);
    setCurrentTab('search');
    setActiveArtistName(null);
    setHasSearched(true);
    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await searchYouTube(query, filter, source);
      setSearchResults(response.results || []);
      setSearchPlaylists(response.playlists || []);
      setSearchSuggestions(response.suggestions || []);
      setCorrectedQuery(response.correctedQuery);
      if (response.countsBySource) {
        setCountsBySource(response.countsBySource);
      }
    } catch (err: any) {
      setSearchError('Ocorreu um erro ao pesquisar. Tente novamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlayYouTubePlaylist = async (pl: YouTubePlaylist) => {
    setIsSearching(true);
    try {
      const tracks = await fetchPlaylistTracks(pl.id);
      if (tracks.length > 0) {
        player.playTrack(tracks[0], tracks, 0);
        setIsPlayerExpanded(true);
      } else if (pl.firstVideoId) {
        const fallbackTrack: Track = {
          id: `yt-${pl.firstVideoId}`,
          youtubeId: pl.firstVideoId,
          title: pl.title,
          artist: pl.author || 'YouTube Playlist',
          thumbnail: pl.thumbnail || '',
          duration: '3:30',
          type: 'music',
        };
        player.playTrack(fallbackTrack, [fallbackTrack], 0);
        setIsPlayerExpanded(true);
      }
    } catch (e) {
      console.warn('Failed to load playlist tracks', e);
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

      {/* Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setActiveArtistName(null);
        }}
        favoritesCount={favoritesCount}
        playlistsCount={playlistsCount}
        volume={player.volume}
        isPlaying={player.isPlaying}
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
            className="flex md:hidden items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black text-sm shadow-md shadow-emerald-500/30 shrink-0">
              M
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white font-display">
                MiGa<span className="text-[#00ff88]">TUBE</span>
              </span>
              <AudioWaveform
                volume={player.volume}
                isPlaying={player.isPlaying}
                barCount={10}
                height={8}
                showLabel={false}
              />
            </div>
          </div>

          {/* Header Search Field (Visible on Desktop / Compact on Mobile) */}
          <div className="flex-1 max-w-2xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              initialQuery={searchQuery}
              initialFilter={searchFilter}
              initialSource={searchSource}
              countsBySource={countsBySource}
            />
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <PWAInstallButton compact />
          </div>
        </header>

        {/* Dynamic Main Views */}
        <div className="flex-1 p-3 sm:p-5 md:p-8 max-w-7xl mx-auto w-full">
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
              onQuickSearch={(q, src) => handleSearch(q, 'TODOS', src || 'all')}
              currentTrack={player.currentTrack}
              isPlaying={player.isPlaying}
            />
          ) : currentTab === 'search' ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-display">
                  {hasSearched && searchQuery ? (
                    <>
                      Resultados para "<span className="text-[#00ff88]">{searchQuery}</span>"
                    </>
                  ) : (
                    'Explorar Tendências & Artistas'
                  )}
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {hasSearched && searchQuery
                    ? 'Resultados unificados: YouTube, SoundCloud e Jamendo Livre.'
                    : 'Pesquise qualquer artista, música ou álbum pelo nome no campo de busca acima.'}
                </p>
              </div>

              <SearchResults
                results={hasSearched ? searchResults : FEATURED_TRACKS}
                playlists={hasSearched ? searchPlaylists : []}
                suggestions={searchSuggestions}
                correctedQuery={correctedQuery}
                isLoading={isSearching}
                error={searchError}
                searchQuery={searchQuery}
                searchSource={searchSource}
                currentTrack={player.currentTrack}
                isPlaying={player.isPlaying}
                onPlayTrack={(track, all) => player.playTrack(track, all)}
                onPlayPlaylist={handlePlayYouTubePlaylist}
                onSelectQuery={(q) => handleSearch(q, searchFilter, searchSource)}
                onSelectSource={(src) => handleSearch(searchQuery || 'top músicas', searchFilter, src)}
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
        showFloatingVideo={showFloatingVideo}
        onToggleFloatingVideo={() => setShowFloatingVideo(!showFloatingVideo)}
        playbackError={player.playbackError}
        onClearPlaybackError={() => player.setPlaybackError(null)}
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
