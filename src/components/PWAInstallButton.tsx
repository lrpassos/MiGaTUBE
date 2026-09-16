import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        id="btn-pwa-install"
        onClick={install}
        className={`flex items-center gap-2 font-medium transition-all duration-200 cursor-pointer ${
          compact
            ? 'px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs'
            : 'px-4 py-2 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 font-semibold shadow-lg shadow-emerald-500/20 text-sm'
        }`}
        title="Instalar MiGaTUBE no dispositivo"
      >
        <Download className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>Instalar App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="btn-pwa-ios-guide"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/30 text-xs font-medium cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar no iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#09150f] border border-emerald-500/30 p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-black text-sm">
                    M
                  </div>
                  <h3 className="text-base font-bold text-white">Instalar MiGaTUBE</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Para instalar o MiGaTUBE na tela de início do seu iPhone ou iPad:
              </p>

              <div className="space-y-3 mb-6 text-xs text-slate-200">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-emerald-950">
                  <Share className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>1. Toque no botão <strong>Compartilhar</strong> na barra do Safari.</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-emerald-950">
                  <PlusSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>2. Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
