import React from 'react';
import { Disc3, Radio, Sparkles } from 'lucide-react';
import { Track } from '../types';

interface VinylPlayerProps {
  track: Track;
  isPlaying: boolean;
  animateVinyl?: boolean;
}

export const VinylPlayer: React.FC<VinylPlayerProps> = ({
  track,
  isPlaying,
  animateVinyl = true,
}) => {
  return (
    <div
      id="deck-de-vinil-digital"
      className="relative w-full max-w-md aspect-square mx-auto flex items-center justify-center p-4 select-none"
    >
      {/* Turntable Platter Outer Base */}
      <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-[#0c1c14] via-[#06100b] to-[#020504] border border-emerald-950/90 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,255,136,0.08)] flex items-center justify-center overflow-hidden">
        
        {/* Subtle background circuit / grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Deck metadata badges */}
        <div className="absolute top-4 left-5 flex items-center gap-2 text-[10px] font-mono tracking-widest text-emerald-500/70 uppercase">
          <Radio className="w-3 h-3 text-emerald-400" />
          <span>DECK DIGITAL 33⅓ RPM</span>
        </div>

        <div className="absolute top-4 right-5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/50 border border-emerald-500/20 text-[9px] font-mono text-emerald-400">
          <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#00ff88] animate-ping' : 'bg-zinc-600'}`} />
          <span>{isPlaying ? 'ROTATING' : 'STOPPED'}</span>
        </div>

        {/* Platter Rim */}
        <div className="relative w-[84%] aspect-square rounded-full bg-[#070b09] border-4 border-[#12281b] shadow-inner flex items-center justify-center">
          
          {/* Vinyl Record */}
          <div
            className={`relative w-[96%] aspect-square rounded-full bg-radial from-[#151c18] via-[#090d0b] to-[#040605] shadow-[0_0_20px_rgba(0,0,0,0.95)] flex items-center justify-center transition-transform ${
              animateVinyl && isPlaying ? 'animate-spin-slow' : 'paused'
            }`}
          >
            {/* Concentric sound grooves */}
            <div className="absolute inset-2 rounded-full border border-emerald-950/40 pointer-events-none" />
            <div className="absolute inset-6 rounded-full border border-zinc-800/30 pointer-events-none" />
            <div className="absolute inset-10 rounded-full border border-emerald-900/30 pointer-events-none" />
            <div className="absolute inset-14 rounded-full border border-zinc-800/40 pointer-events-none" />
            <div className="absolute inset-20 rounded-full border border-emerald-950/50 pointer-events-none" />
            <div className="absolute inset-24 rounded-full border border-zinc-800/30 pointer-events-none" />

            {/* Subtle Vinyl Light Reflection (anisotropic gleam) */}
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,255,136,0.08)_45deg,transparent_90deg,transparent_180deg,rgba(0,255,136,0.08)_225deg,transparent_270deg)] pointer-events-none" />

            {/* Center Album Label */}
            <div className="relative w-[40%] aspect-square rounded-full p-1 bg-gradient-to-tr from-emerald-950 via-[#0a2016] to-[#020504] border-2 border-emerald-500/40 shadow-lg flex items-center justify-center overflow-hidden">
              <img
                src={track.thumbnail}
                alt={track.title}
                className="w-full h-full object-cover rounded-full filter contrast-110 select-none"
                referrerPolicy="no-referrer"
              />
              
              {/* Spindle hole */}
              <div className="absolute w-5 h-5 rounded-full bg-[#020504] border border-emerald-500/80 shadow-[inset_0_0_4px_#000] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tonearm Assembly (Stylus resting on vinyl when playing) */}
        <div className="absolute top-2 right-4 w-28 h-56 pointer-events-none z-10 transition-transform duration-700 ease-out origin-[85%_12%]"
          style={{
            transform: isPlaying ? 'rotate(18deg)' : 'rotate(-8deg)'
          }}
        >
          {/* Tonearm Pivot Base */}
          <div className="absolute top-0 right-0 w-12 h-12 rounded-full bg-gradient-to-b from-zinc-700 via-zinc-900 to-black border border-emerald-500/30 shadow-md flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#00ff88]" />
            </div>
          </div>

          {/* Tonearm Metal Tube */}
          <div className="absolute top-6 right-5 w-1.5 h-44 bg-gradient-to-b from-zinc-400 via-zinc-600 to-zinc-800 rounded-full shadow-md transform -rotate-12 origin-top">
            {/* Headshell / Needle cartridge at the tip */}
            <div className="absolute -bottom-1 -left-2 w-4 h-7 bg-zinc-900 border border-emerald-500/60 rounded-xs shadow-lg flex flex-col items-center justify-end pb-1">
              <span className="w-1 h-2 bg-emerald-400 rounded-xs shadow-[0_0_4px_#00ff88]" />
            </div>
          </div>
        </div>

        {/* Bottom Turntable Accent Bar */}
        <div className="absolute bottom-3 inset-x-6 flex items-center justify-between text-[10px] font-mono text-emerald-400/80">
          <div className="flex items-center gap-1.5">
            <Disc3 className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: isPlaying ? '3s' : '0s' }} />
            <span className="truncate max-w-[200px] text-zinc-300 font-sans">{track.artist}</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Hi-Fi DECK</span>
          </div>
        </div>

      </div>
    </div>
  );
};
