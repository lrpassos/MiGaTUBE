import React, { useEffect, useState } from 'react';

interface VUMeterProps {
  isPlaying: boolean;
  compact?: boolean;
}

export const VUMeter: React.FC<VUMeterProps> = ({ isPlaying, compact = false }) => {
  const barCount = compact ? 8 : 12;
  const [levels, setLevels] = useState<number[]>(() => new Array(barCount).fill(1));

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const updateLevels = (now: number) => {
      // Update every ~60ms for smooth, responsive digital audio meter vibe
      if (now - lastTime > 60) {
        lastTime = now;
        if (isPlaying) {
          setLevels(prev =>
            prev.map((_, i) => {
              // Create realistic frequency peaks: bass (left) higher, mids dynamic, treble (right) active
              const factor = i < 3 ? 0.85 : i < 8 ? 0.7 : 0.6;
              const randomJitter = Math.sin(now * 0.005 + i * 0.8) * 0.35 + 0.55;
              const noise = Math.random() * 0.4;
              const level = Math.min(10, Math.max(1, Math.round((randomJitter + noise) * 10 * factor)));
              return level;
            })
          );
        } else {
          // Graceful decay when paused
          setLevels(prev => prev.map(l => Math.max(1, l - 1)));
        }
      }
      animationFrameId = requestAnimationFrame(updateLevels);
    };

    animationFrameId = requestAnimationFrame(updateLevels);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, barCount]);

  return (
    <div
      id="vu-meter"
      className={`flex items-end gap-0.5 bg-black/60 p-1.5 rounded-lg border border-emerald-950/80 backdrop-blur-xs select-none ${
        compact ? 'h-7' : 'h-10'
      }`}
      title={isPlaying ? 'VU Meter: Áudio Ativo' : 'VU Meter: Em Espera'}
    >
      {levels.map((level, i) => (
        <div key={i} className="flex flex-col-reverse gap-0.5 h-full justify-start w-1.5">
          {Array.from({ length: 10 }).map((_, segIdx) => {
            const isActive = segIdx < level;
            let colorClass = 'bg-[#0a2316]'; // Inactive segment

            if (isActive) {
              if (segIdx >= 8) {
                // Peak (top 2 segments)
                colorClass = 'bg-[#00ff88] shadow-[0_0_6px_#00ff88]';
              } else if (segIdx >= 5) {
                // Mid
                colorClass = 'bg-[#10b981]';
              } else {
                // Low
                colorClass = 'bg-[#059669]';
              }
            }

            return (
              <span
                key={segIdx}
                className={`w-full rounded-xs transition-colors duration-75 ${
                  compact ? 'h-[2px]' : 'h-[2.5px]'
                } ${colorClass}`}
              />
            );
          })}
        </div>
      ))}
      <div className="flex flex-col justify-between text-[7px] font-mono text-emerald-600/80 font-bold ml-1 h-full py-0.5 leading-none select-none">
        <span>+3</span>
        <span>0</span>
        <span>-6</span>
      </div>
    </div>
  );
};
