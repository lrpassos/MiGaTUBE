import React, { useState, useEffect } from 'react';
import { Settings, Sliders, Disc3, Activity, RotateCcw, Trash2, ShieldCheck, Download, Radio, Info } from 'lucide-react';
import { AppSettings } from '../types';
import { storage } from '../lib/storage';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [hasServerKey, setHasServerKey] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasServerKey(Boolean(data.hasYouTubeApiKey));
      })
      .catch(() => {
        setHasServerKey(false);
      });
  }, []);

  const handleToggle = (key: keyof AppSettings) => {
    const updated = {
      ...settings,
      [key]: !settings[key],
    };
    storage.saveSettings(updated);
    onUpdateSettings(updated);
  };

  const handleResetAll = () => {
    if (window.confirm('Tem certeza de que deseja limpar todos os dados locais (favoritos, playlists criadas e histórico)? Esta ação não pode ser desfeita.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight font-display flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          Configurações do <span className="text-[#00ff88]">MiGaTUBE</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Personalize a reprodução, visualização de vinil e preferências locais.
        </p>
      </div>

      {/* Playback & Visual Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-emerald-500 font-bold flex items-center gap-2">
          <Sliders className="w-4 h-4" />
          Interface & Experiência Analógica
        </h3>

        <div className="space-y-2">
          {/* Vinyl Animation Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#09150f] border border-emerald-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center text-[#00ff88]">
                <Disc3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Animação do Deck de Vinil</h4>
                <p className="text-xs text-zinc-400">
                  Gira o disco de vinil suavemente e posiciona o braço de leitura durante a reprodução.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('vinylAnimation')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                settings.vinylAnimation ? 'bg-emerald-500 justify-end' : 'bg-zinc-800 justify-start'
              }`}
            >
              <div className="bg-black w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          {/* VU Meter Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#09150f] border border-emerald-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center text-[#00ff88]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">VU Meter Digital</h4>
                <p className="text-xs text-zinc-400">
                  Exibe o medidor de volume com LEDs verdes e neon sincronizados com a música.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('vuMeterEnabled')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                settings.vuMeterEnabled ? 'bg-emerald-500 justify-end' : 'bg-zinc-800 justify-start'
              }`}
            >
              <div className="bg-black w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          {/* Autoplay Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#09150f] border border-emerald-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center text-[#00ff88]">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Reprodução Automática (Autoplay)</h4>
                <p className="text-xs text-zinc-400">
                  Avança automaticamente para a próxima faixa da fila ao término da música.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('autoplay')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                settings.autoplay ? 'bg-emerald-500 justify-end' : 'bg-zinc-800 justify-start'
              }`}
            >
              <div className="bg-black w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>
        </div>
      </div>

      {/* Backend & YouTube Integration Info */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-emerald-500 font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Conexão & API do YouTube
        </h3>

        <div className="p-4 rounded-2xl bg-[#09150f] border border-emerald-950 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-white">Status da Integração Oficial</span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                hasServerKey
                  ? 'bg-emerald-500/20 text-[#00ff88] border border-emerald-500/40'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}
            >
              {hasServerKey ? 'YOUTUBE_API_KEY ATIVA' : 'MODO CATÁLOGO INTELIGENTE ATIVO'}
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            O MiGaTUBE utiliza o servidor seguro em backend para processar requisições da YouTube Data API v3 sem expor credenciais no navegador, com transição automática para o catálogo Hi-Fi curado em caso de cotas ou ausência de chave.
          </p>
        </div>
      </div>

      {/* PWA & Installation */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-[#09150f] border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black">
            M
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Instalar o MiGaTUBE no Smartphone</h4>
            <p className="text-xs text-zinc-400">
              Instale como aplicativo nativo (PWA) no Android, iOS ou Desktop com ícone exclusivo.
            </p>
          </div>
        </div>

        <PWAInstallButton />
      </div>

      {/* Storage Management */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-mono uppercase tracking-widest text-red-400 font-bold flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Gerenciamento de Dados Locais
        </h3>

        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/40 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-red-200">Redefinir Dados Locais</h4>
            <p className="text-xs text-zinc-400">
              Apaga favoritos, histórico e restaura as playlists padrões de fábrica.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetAll}
            className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold border border-red-500/30 transition-colors cursor-pointer"
          >
            Redefinir Tudo
          </button>
        </div>
      </div>
    </div>
  );
};
