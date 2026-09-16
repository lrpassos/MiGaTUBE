import React from 'react';
import { Home, Search, Heart, Disc3, Radio } from 'lucide-react';
import { NavigationTab } from '../types';

interface BottomNavigationProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenPlayer: () => void;
  isPlaying: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenPlayer,
  isPlaying,
}) => {
  return (
    <nav
      id="bottom-navigation-mobile"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#060e09]/95 backdrop-blur-lg border-t border-emerald-950/80 px-2 py-1 pb-safe flex items-center justify-around select-none"
    >
      <button
        type="button"
        id="nav-mobile-home"
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
          currentTab === 'home'
            ? 'text-emerald-400 font-bold'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-wider uppercase">Início</span>
      </button>

      <button
        type="button"
        id="nav-mobile-search"
        onClick={() => onSelectTab('search')}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
          currentTab === 'search'
            ? 'text-emerald-400 font-bold'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Search className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-wider uppercase">Pesquisar</span>
      </button>

      <button
        type="button"
        id="nav-mobile-favorites"
        onClick={() => onSelectTab('favorites')}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
          currentTab === 'favorites'
            ? 'text-emerald-400 font-bold'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Heart className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-wider uppercase">Favoritos</span>
      </button>

      <button
        type="button"
        id="nav-mobile-playlists"
        onClick={() => onSelectTab('playlists')}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
          currentTab === 'playlists'
            ? 'text-emerald-400 font-bold'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Disc3 className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-wider uppercase">Playlists</span>
      </button>

      <button
        type="button"
        id="nav-mobile-player"
        onClick={onOpenPlayer}
        className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
      >
        <div className="relative">
          <Radio className={`w-5 h-5 mb-0.5 ${isPlaying ? 'animate-pulse text-[#00ff88]' : ''}`} />
          {isPlaying && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00ff88] animate-ping" />
          )}
        </div>
        <span className="text-[10px] tracking-wider uppercase font-semibold">Player</span>
      </button>
    </nav>
  );
};
