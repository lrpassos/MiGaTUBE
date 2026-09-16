import React from 'react';
import { Home, Search, Heart, Disc3, Clock, Settings, Radio } from 'lucide-react';
import { NavigationTab } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  favoritesCount?: number;
  playlistsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  favoritesCount = 0,
  playlistsCount = 0,
}) => {
  const menuItems = [
    { id: 'home' as NavigationTab, label: 'Início', icon: Home },
    { id: 'search' as NavigationTab, label: 'Buscar', icon: Search },
    { id: 'favorites' as NavigationTab, label: 'Favoritos', icon: Heart, badge: favoritesCount },
    { id: 'playlists' as NavigationTab, label: 'Playlists', icon: Disc3, badge: playlistsCount },
    { id: 'history' as NavigationTab, label: 'Histórico', icon: Clock },
    { id: 'settings' as NavigationTab, label: 'Configurações', icon: Settings },
  ];

  return (
    <aside
      id="sidebar-desktop"
      className="hidden md:flex flex-col w-64 bg-[#060c08] border-r border-emerald-950/80 p-5 shrink-0 select-none justify-between h-full"
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer group px-2"
        >
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-950 via-[#0a2618] to-emerald-800 border border-emerald-500/40 p-1 flex items-center justify-center shadow-lg shadow-emerald-950/80 group-hover:border-emerald-400 transition-all">
            <Radio className="w-5 h-5 text-[#00ff88] group-hover:scale-110 transition-transform" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00ff88] border-2 border-black animate-pulse" />
          </div>

          <div>
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center font-display">
              MiGa<span className="text-[#00ff88] neon-text-glow">TUBE</span>
            </span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-500 block -mt-1 font-semibold">
              Música & Vídeo Hi-Fi
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold mb-2">
            Navegação
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/15 text-[#00ff88] border border-emerald-500/30 shadow-xs'
                    : 'text-zinc-400 hover:text-slate-100 hover:bg-emerald-950/30 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00ff88]' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-900">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & PWA Button */}
      <div className="pt-4 border-t border-emerald-950/60 space-y-3">
        <PWAInstallButton compact />

        <div className="px-2 text-[11px] text-zinc-500 space-y-0.5 font-mono">
          <p className="text-emerald-500/80 font-semibold">MiGaTUBE v2.0</p>
          <p>YouTube Official API & Player</p>
        </div>
      </div>
    </aside>
  );
};
