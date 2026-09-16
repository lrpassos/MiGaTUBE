import React, { useState, useEffect, useRef } from 'react';
import { Search, X, SlidersHorizontal, ListMusic, Sparkles } from 'lucide-react';
import { SearchFilter } from '../types';
import { fetchSuggestions } from '../lib/youtube';

interface SearchBarProps {
  onSearch: (query: string, filter: SearchFilter) => void;
  initialQuery?: string;
  initialFilter?: SearchFilter;
  autoFocus?: boolean;
}

const FILTERS: { id: SearchFilter; label: string }[] = [
  { id: 'TODOS', label: 'Todos' },
  { id: 'MÚSICAS', label: 'Músicas' },
  { id: 'PLAYLISTS', label: 'Playlists & Álbuns' },
  { id: 'VÍDEOS', label: 'Vídeos' },
  { id: 'CANAIS', label: 'Canais' },
];

const POPULAR_SUGGESTIONS = [
  'Bob Marley',
  'Bob Marley Greatest Hits',
  'Bob Marley Legend Album',
  'Reggae Classics',
  'Gilberto Gil',
  'Natiruts Acústico',
  'Maneva',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialQuery = '',
  initialFilter = 'TODOS',
  autoFocus = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<SearchFilter>(initialFilter);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initial query
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

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

  const triggerSearch = (searchVal: string, searchFilter: SearchFilter = filter) => {
    setShowDropdown(false);
    if (searchVal.trim()) {
      onSearch(searchVal.trim(), searchFilter);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(query, filter);
  };

  const handleFilterChange = (newFilter: SearchFilter) => {
    setFilter(newFilter);
    if (query.trim()) {
      triggerSearch(query.trim(), newFilter);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto space-y-3 relative z-30">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-emerald-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          id="search-input"
          type="text"
          value={query}
          onFocus={() => setShowDropdown(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          placeholder="Pesquisar músicas, álbuns, playlists (ex: Bob Marley)..."
          autoFocus={autoFocus}
          autoComplete="off"
          className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-[#09150f] border border-emerald-950 focus:border-emerald-500/70 text-slate-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm md:text-base transition-all shadow-inner"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Limpar pesquisa"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            id="search-submit-btn"
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs md:text-sm transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            Buscar
          </button>
        </div>

        {/* Live Autocomplete Suggestions Dropdown */}
        {showDropdown && (suggestions.length > 0 || !query.trim()) && (
          <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl bg-[#09150f]/95 border border-emerald-500/30 backdrop-blur-xl shadow-2xl overflow-hidden divide-y divide-emerald-950/60 z-50">
            {suggestions.length > 0 ? (
              <div className="p-1.5">
                <div className="px-3 py-1 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
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
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-xl transition-colors cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{item}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-2.5">
                <div className="px-2 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <ListMusic className="w-3 h-3 text-emerald-400" />
                  Mais Buscados
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[11px] font-medium text-emerald-500/70 flex items-center gap-1 mr-1 uppercase tracking-wider pl-1">
          <SlidersHorizontal className="w-3 h-3" />
          Filtro:
        </span>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            id={`filter-btn-${f.id.toLowerCase()}`}
            type="button"
            onClick={() => handleFilterChange(f.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              filter === f.id
                ? 'bg-emerald-500 text-black font-semibold shadow-sm shadow-emerald-500/30'
                : 'bg-[#09150f] text-zinc-400 border border-emerald-950/80 hover:text-white hover:border-emerald-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
};
