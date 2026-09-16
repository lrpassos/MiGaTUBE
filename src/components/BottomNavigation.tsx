import React from 'react';
import { Home, Search, Heart, Disc3, History, Radio } from 'lucide-react';
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
      aria-label="Navegação mobile"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#060e09]/95 backdrop-blur-xl border-t border-emerald-950/90 select-none"
      style={{
        paddingBottom: 'max(6px, env(safe-area-inset-bottom, 6px))',
      }}
    >
      <div className="flex items-center justify-around overflow-x-auto no-scrollbar w-full px-1 py-1 gap-1">
        <button
          type="button"
          id="nav-mobile-home"
          onClick={() => onSelectTab('home')}
          className={`min-w-[54px] sm:min-w-[62px] min-h-[46px] flex flex-col items-center justify-center rounded-xl transition-all shrink-0 cursor-pointer ${
            currentTab === 'home'
              ? 'text-emerald-400 font-bold bg-emerald-950/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5 shrink-0" />
          <span className="text-[10px] tracking-wider uppercase whitespace-nowrap leading-tight">Início</span>
        </button>

        <button
          type="button"
          id="nav-mobile-search"
          onClick={() => onSelectTab('search')}
          className={`min-w-[54px] sm:min-w-[62px] min-h-[46px] flex flex-col items-center justify-center rounded-xl transition-all shrink-0 cursor-pointer ${
            currentTab === 'search'
              ? 'text-emerald-400 font-bold bg-emerald-950/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5 shrink-0" />
          <span className="text-[10px] tracking-wider uppercase whitespace-nowrap leading-tight">Busca</span>
        </button>

        <button
          type="button"
          id="nav-mobile-favorites"
          onClick={() => onSelectTab('favorites')}
          className={`min-w-[54px] sm:min-w-[62px] min-h-[46px] flex flex-col items-center justify-center rounded-xl transition-all shrink-0 cursor-pointer ${
            currentTab === 'favorites'
              ? 'text-emerald-400 font-bold bg-emerald-950/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Heart className="w-5 h-5 mb-0.5 shrink-0" />
          <span className="text-[10px] tracking-wider uppercase whitespace-nowrap leading-tight">Favoritos</span>
        </button>

        <button
          type="button"
          id="nav-mobile-playlists"
          onClick={() => onSelectTab('playlists')}
          className={`min-w-[54px] sm:min-w-[62px] min-h-[46px] flex flex-col items-center justify-center rounded-xl transition-all shrink-0 cursor-pointer ${
            currentTab === 'playlists'
              ? 'text-emerald-400 font-bold bg-emerald-950/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Disc3 className="w-5 h-5 mb-0.5 shrink-0" />
          <span className="text-[10px] tracking-wider uppercase whitespace-nowrap leading-tight">Playlists</span>
        </button>

        <button
          type="button"
          id="nav-mobile-history"
          onClick={() => onSelectTab('history')}
          className={`min-w-[54px] sm:min-w-[62px] min-h-[46px] flex flex-col items-center justify-center rounded-xl transition-all shrink-0 cursor-pointer ${
            currentTab === 'history'
              ? 'text-emerald-400 font-bold bg-emerald-950/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <History className="w-5 h-5 mb-0.5 shrink-0" />
          <span className="text-[10px] tracking-wider uppercase whitespace-nowrap leading-tight">Histórico</span>
        </button>

        <button
          type="button"
          id="nav-mobile-player"
          onClick={onOpenPlayer}
          className="min-w-[54px] sm:min-w-[62px] min-h-[46px] flex flex-col items-center justify-center rounded-xl text-emerald-400 hover:text-emerald-300 transition-all shrink-0 cursor-pointer"
        >
          <div className="relative shrink-0">
            <Radio className={`w-5 h-5 mb-0.5 ${isPlaying ? 'animate-pulse text-[#00ff88]' : ''}`} />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00ff88] animate-ping" />
            )}
          </div>
          <span className="text-[10px] tracking-wider uppercase font-semibold whitespace-nowrap leading-tight">Deck</span>
        </button>
      </div>
    </nav>
  );
};
