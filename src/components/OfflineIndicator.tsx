import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      id="offline-indicator-banner"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-950/95 border border-emerald-500/40 px-4 py-1.5 text-xs font-medium text-emerald-300 shadow-xl backdrop-blur-md animate-bounce"
    >
      <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
      <span>Modo Offline — Catálogo local em execução</span>
    </div>
  );
};
