import React, { useState, useEffect, useRef } from 'react';
import { Search, X, SlidersHorizontal, ListMusic, Sparkles, Layers, Radio } from 'lucide-react';
import { SearchFilter, MusicSource } from '../types';
import { fetchSuggestions } from '../lib/youtube';

interface SearchBarProps {
  onSearch: (query: string, filter: SearchFilter, source?: MusicSource) => void;
  initialQuery?: string;
  initialFilter?: SearchFilter;
  initialSource?: MusicSource;
  countsBySource?: { all: number; youtube: number; jamendo: number; soundcloud: number };
  autoFocus?: boolean;
}

const FILTERS: { id: SearchFilter; label: string }[] = [
  { id: 'TODOS', label: 'Tudo (Músicas & Vídeos)' },
  { id: 'MÚSICAS', label: 'Músicas' },
  { id: 'VÍDEOS', label: 'Vídeos / Clipes' },
  { id: 'PLAYLISTS', label: 'Playlists & Álbuns' },
  { id: 'CANAIS', label: 'Canais Oficiais' },
];

const SOURCES: { id: MusicSource; label: string; dotClass: string; activeClass: string }[] = [
  { id: 'all', label: 'Todas as Fontes', dotClass: 'bg-emerald-400', activeClass: 'bg-emerald-500 text-black shadow-emerald-500/30' },
  { id: 'youtube', label: 'YouTube (Músicas & Vídeos)', dotClass: 'bg-red-500', activeClass: 'bg-red-600 text-white shadow-red-600/30' },
  { id: 'soundcloud', label: 'SoundCloud', dotClass: 'bg-orange-500', activeClass: 'bg-orange-600 text-white shadow-orange-600/30' },
  { id: 'jamendo', label: 'Jamendo Livre', dotClass: 'bg-teal-400', activeClass: 'bg-teal-500 text-black shadow-teal-500/30' },
];

const POPULAR_SUGGESTIONS = [
  'Zé Ramalho',
  'Chão de Giz',
  'Sinônimos',
  'Admirável Gado Novo',
  'Marília Mendonça',
  'Legião Urbana',
  'Tim Maia',
  'Alok',
  'Coldplay',
  'Queen',
  'Bob Marley',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialQuery = '',
  initialFilter = 'TODOS',
  initialSource = 'all',
  countsBySource,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<SearchFilter>(initialFilter);
  const [source, setSource] = useState<MusicSource>(initialSource);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initial values
  useEffect(() => {
    if (initialQuery !== undefined) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (initialFilter) setFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    if (initialSource) setSource(initialSource);
  }, [initialSource]);

  // Debounce autocomplete suggestions
  useEffect(() => {
    const cleanQ = query.trim();
    if (!cleanQ || cleanQ.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const list = await fetchSuggestions(cleanQ);
      setSuggestions(list);
    }, 220);

    return () => clearTimeout(timer);
  }, [query]);

  // Debounced auto-trigger search as user types (500ms delay)
  useEffect(() => {
    const cleanQ = query.trim();
    if (!cleanQ || cleanQ.length < 2) return;

    // Only auto-search if it differs from the last searched query
    if (cleanQ === initialQuery?.trim()) return;

    const autoTimer = setTimeout(() => {
      onSearch(cleanQ, filter, source);
    }, 500);

    return () => clearTimeout(autoTimer);
  }, [query, filter, source, initialQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerSearch = (searchVal: string, searchFilter: SearchFilter = filter, searchSource: MusicSource = source) => {
    setShowDropdown(false);
    if (searchVal.trim()) {
      onSearch(searchVal.trim(), searchFilter, searchSource);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(query, filter, source);
  };

  const handleFilterChange = (newFilter: SearchFilter) => {
    setFilter(newFilter);
    if (query.trim()) {
      triggerSearch(query.trim(), newFilter, source);
    }
  };

  const handleSourceChange = (newSource: MusicSource) => {
    setSource(newSource);
    if (query.trim()) {
      triggerSearch(query.trim(), filter, newSource);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto space-y-2 relative z-30">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 sm:left-4 pointer-events-none text-emerald-400">
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        <input
          id="search-input"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          value={query}
          onFocus={() => setShowDropdown(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          placeholder="Pesquisar músicas, artistas ou bandas (YouTube, SoundCloud, Jamendo)..."
          autoFocus={autoFocus}
          autoComplete="off"
          className="w-full pl-10 sm:pl-12 pr-24 sm:pr-28 py-2.5 sm:py-3.5 rounded-2xl bg-[#09150f] border border-emerald-950 focus:border-emerald-500/70 text-slate-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm md:text-base transition-all shadow-inner"
        />

        <div className="absolute right-2 sm:right-2.5 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 sm:p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Limpar pesquisa"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          <button
            id="search-submit-btn"
            type="submit"
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Buscar
          </button>
        </div>

        {/* Live Autocomplete Suggestions Dropdown */}
        {showDropdown && (suggestions.length > 0 || !query.trim()) && (
          <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl bg-[#09150f]/95 border border-emerald-500/30 backdrop-blur-xl shadow-2xl overflow-hidden divide-y divide-emerald-950/60 z-50">
            {suggestions.length > 0 ? (
              <div className="p-1.5 max-h-60 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] sm:text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Sugestões em tempo real
                </div>
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(item);
                      triggerSearch(item);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs sm:text-sm text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-xl transition-colors cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{item}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-2.5">
                <div className="px-2 py-1 text-[10px] sm:text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <ListMusic className="w-3 h-3 text-emerald-400" />
                  Artistas & Músicas Populares
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5 px-1">
                  {POPULAR_SUGGESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuery(item);
                        triggerSearch(item);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/50 hover:bg-emerald-500/20 border border-emerald-900/60 hover:border-emerald-500/40 text-xs text-zinc-300 hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </form>

      {/* Sources & Filter Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
        {/* Source Switcher */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] sm:text-[11px] font-medium text-emerald-500/70 flex items-center gap-1 mr-0.5 uppercase tracking-wider pl-1 shrink-0">
            <Layers className="w-3 h-3" />
            Fonte:
          </span>
          {SOURCES.map((s) => {
            const isSelected = source === s.id;
            const count = countsBySource ? countsBySource[s.id] : undefined;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSourceChange(s.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? `${s.activeClass} font-bold shadow-sm`
                    : 'bg-[#09150f] text-zinc-400 border border-emerald-950/80 hover:text-white hover:border-emerald-800'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${s.dotClass}`} />
                <span>{s.label}</span>
                {typeof count === 'number' && count > 0 && (
                  <span className={`text-[9px] px-1 rounded-full ${isSelected ? 'bg-black/20' : 'bg-emerald-950 text-emerald-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Type Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 flex items-center gap-1 mr-0.5 uppercase tracking-wider pl-1 shrink-0">
            <SlidersHorizontal className="w-3 h-3" />
            Tipo:
          </span>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              id={`filter-btn-${f.id.toLowerCase()}`}
              type="button"
              onClick={() => handleFilterChange(f.id)}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                filter === f.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'bg-[#09150f] text-zinc-400 border border-emerald-950/80 hover:text-white hover:border-emerald-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
