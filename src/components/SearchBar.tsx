import React, { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { SearchFilter } from '../types';

interface SearchBarProps {
  onSearch: (query: string, filter: SearchFilter) => void;
  initialQuery?: string;
  initialFilter?: SearchFilter;
  autoFocus?: boolean;
}

const FILTERS: { id: SearchFilter; label: string }[] = [
  { id: 'TODOS', label: 'Todos' },
  { id: 'MÚSICAS', label: 'Músicas' },
  { id: 'VÍDEOS', label: 'Vídeos' },
  { id: 'CANAIS', label: 'Canais' },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialQuery = '',
  initialFilter = 'TODOS',
  autoFocus = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<SearchFilter>(initialFilter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), filter);
    }
  };

  const handleFilterChange = (newFilter: SearchFilter) => {
    setFilter(newFilter);
    if (query.trim()) {
      onSearch(query.trim(), newFilter);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-emerald-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar músicas, artistas ou vídeos..."
          autoFocus={autoFocus}
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
