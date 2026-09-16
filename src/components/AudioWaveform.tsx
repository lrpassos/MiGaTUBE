import React, { useMemo } from 'react';

interface AudioWaveformProps {
  volume: number; // 0 - 100
  isPlaying: boolean;
  barCount?: number;
  height?: number; // in pixels
  className?: string;
  showLabel?: boolean;
}

/**
 * Calculates dynamic color gradient based on user volume:
 * - High volume: Vermelho (Red)
 * - Lowering: Degradê passando por Laranja -> Amarelo -> Verde
 * - Low volume: Branco (White)
 */
export function getVolumeColor(vol: number): {
  hex: string;
  glow: string;
  label: string;
  bgTailwind: string;
  gradientStyle: string;
} {
  const v = Math.max(0, Math.min(100, vol));

  let r = 255;
  let g = 255;
  let b = 255;
  let label = 'Baixo (Branco)';

  if (v >= 75) {
    // 75 -> 100: Laranja para Vermelho
    const factor = (v - 75) / 25; // 0 to 1
    r = 255;
    g = Math.round(120 * (1 - factor)); // 120 down to 0
    b = Math.round(20 * (1 - factor));
    label = 'Volume Alto (Vermelho)';
  } else if (v >= 50) {
    // 50 -> 75: Amarelo para Laranja
    const factor = (v - 50) / 25; // 0 to 1
    r = 255;
    g = Math.round(215 - (215 - 120) * factor); // 215 down to 120
    b = Math.round(15 * factor);
    label = 'Volume Médio-Alto (Laranja)';
  } else if (v >= 25) {
    // 25 -> 50: Verde para Amarelo
    const factor = (v - 25) / 25; // 0 to 1
    r = Math.round(0 + 255 * factor); // 0 up to 255
    g = Math.round(255 - (255 - 215) * factor);
    b = Math.round(136 * (1 - factor));
    label = 'Volume Moderado (Amarelo/Verde)';
  } else {
    // 0 -> 25: Branco para Verde
    const factor = v / 25; // 0 to 1
    r = Math.round(255 - 255 * factor); // 255 down to 0
    g = 255;
    b = Math.round(255 - (255 - 136) * factor); // 255 down to 136
    label = 'Volume Baixo (Branco)';
  }

  const hex = `rgb(${r}, ${g}, ${b})`;
  const glow = `rgba(${r}, ${g}, ${b}, 0.55)`;

  return {
    hex,
    glow,
    label,
    bgTailwind: v >= 75 ? 'bg-red-500' : v >= 50 ? 'bg-orange-500' : v >= 25 ? 'bg-emerald-400' : 'bg-white',
    gradientStyle: `linear-gradient(to top, rgba(${r}, ${g}, ${b}, 0.3) 0%, rgba(${r}, ${g}, ${b}, 1) 100%)`,
  };
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  volume,
  isPlaying,
  barCount = 14,
  height = 14,
  className = '',
  showLabel = false,
}) => {
  const { hex, glow, gradientStyle, label } = useMemo(() => getVolumeColor(volume), [volume]);

  // Baseline height patterns for an organic musical wave
  const baseHeights = useMemo(() => {
    return [35, 60, 95, 45, 80, 100, 65, 90, 40, 75, 90, 55, 85, 30, 70, 95, 50, 65, 80, 40];
  }, []);

  return (
    <div className={`flex flex-col gap-0.5 select-none ${className}`}>
      <div
        className="flex items-end gap-[2px] h-[16px] px-0.5"
        style={{ height: `${height}px` }}
        title={`Onda Sonora MiGaTUBE | Volume: ${volume}% | Cor: ${label}`}
      >
        {Array.from({ length: barCount }).map((_, i) => {
          const baseH = baseHeights[i % baseHeights.length];
          const minH = 15;
          const barHeightPercent = isPlaying ? baseH : minH;
          const animationDelay = `${(i * 0.09).toFixed(2)}s`;
          const animationDuration = `${(0.45 + (i % 5) * 0.12).toFixed(2)}s`;

          return (
            <div
              key={i}
              className="w-[2.5px] rounded-full transition-all duration-300"
              style={{
                height: `${barHeightPercent}%`,
                background: gradientStyle,
                boxShadow: isPlaying ? `0 0 5px ${glow}` : 'none',
                animation: isPlaying ? `migatubeWaveBounce ${animationDuration} ease-in-out infinite alternate` : 'none',
                animationDelay,
              }}
            />
          );
        })}
      </div>

      {showLabel && (
        <span
          className="text-[9px] font-mono tracking-wider transition-colors duration-300 font-medium"
          style={{ color: hex }}
        >
          {volume}% • {isPlaying ? 'Sinal Ativo' : 'Pausa'}
        </span>
      )}

      {/* Embedded CSS keyframes for wave bounce */}
      <style>{`
        @keyframes migatubeWaveBounce {
          0% {
            height: 18%;
            opacity: 0.6;
          }
          50% {
            height: 96%;
            opacity: 1;
          }
          100% {
            height: 32%;
            opacity: 0.75;
          }
        }
      `}</style>
    </div>
  );
};
