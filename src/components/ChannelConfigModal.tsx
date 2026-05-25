import React from 'react';
import { X, Sliders, Volume2, RefreshCw, Activity } from 'lucide-react';
import { AudioChannel } from '../types';

interface ChannelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: AudioChannel | null;
  onCompressionChange: (id: string, value: number) => void;
  onEqChange: (id: string, bands: { bass?: number; mids?: number; treble?: number }) => void;
}

export default function ChannelConfigModal({
  isOpen,
  onClose,
  channel,
  onCompressionChange,
  onEqChange,
}: ChannelConfigModalProps) {
  if (!isOpen || !channel) return null;

  const bass = channel.bass ?? 0;
  const mids = channel.mids ?? 0;
  const treble = channel.treble ?? 0;
  const compression = channel.compression ?? 0;

  // Handles band resets
  const handleResetEq = () => {
    onEqChange(channel.id, { bass: 0, mids: 0, treble: 0 });
  };

  // Bezier curve calculations for dynamic SVG display
  const yCenter = 50;
  // scale DB levels to pixels (12 dB ~ 35px offset)
  const yBass = yCenter - (bass / 12) * 35;
  const yMids = yCenter - (mids / 12) * 35;
  const yTreble = yCenter - (treble / 12) * 35;

  // Let's draw a professional response curve using a smooth bezier curve path
  const curvePath = `M 15 ${yCenter} C 80 ${yBass}, 130 ${yMids}, 160 ${yMids} S 240 ${yTreble}, 305 ${yCenter}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-[#0F0F12] border border-indigo-500/25 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#141419] border-b border-[#22222A]">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider leading-none">
                Ajuste de Áudio por Fonte
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono mt-1">
                Canal: <span className="text-indigo-400 font-semibold">{channel.label}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5">
          
          {/* Dynamic EQ Curve Visualizer Panel */}
          <div className="bg-[#050508] border border-[#22222A] rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-emerald-400" />
                Resposta de Freqüência (DSP)
              </span>
              <button
                onClick={handleResetEq}
                className="text-[9px] font-semibold text-zinc-500 hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
                title="Redefinir Filtros de EQ para 0 dB"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Flat (0 dB)
              </button>
            </div>

            {/* Simulated Curve representation screen */}
            <div className="relative h-28 bg-[#020204] rounded-lg border border-[#141416] overflow-hidden flex items-center justify-center">
              {/* Grid Background */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-[0.04]">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="border-[0.5px] border-zinc-100" />
                ))}
              </div>

              {/* Zero flatline reference */}
              <div className="absolute left-0 right-0 h-[1px] bg-zinc-800/40 border-dashed border-t" />

              {/* Dynamic Bezier Curve path */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 100" preserveAspectRatio="none">
                {/* Horizontal reference limits */}
                <line x1="0" y1="15" x2="320" y2="15" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.15" />
                <line x1="0" y1="85" x2="320" y2="85" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.15" />

                {/* Main Curve Shadow Area */}
                <path
                  d={`${curvePath} L 320 100 L 0 100 Z`}
                  fill="url(#eqGradient)"
                  opacity="0.08"
                />

                {/* Response path line */}
                <path
                  d={curvePath}
                  fill="none"
                  stroke="url(#curveGradient)"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />

                {/* Definition point markers (Bass, Mids, Treble circles) */}
                <circle cx="65" cy={yBass} r="3" fill="#10b981" />
                <circle cx="160" cy={yMids} r="3" fill="#f59e0b" />
                <circle cx="255" cy={yTreble} r="3" fill="#8b5cf6" />

                <defs>
                  <linearGradient id="curveGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="eqGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#020204" />
                  </linearGradient>
                </defs>
              </svg>

              {/* DB indicators */}
              <div className="absolute top-1 left-2 text-[8px] font-mono text-red-500/60 leading-none">+12 dB</div>
              <div className="absolute bottom-1 left-2 text-[8px] font-mono text-blue-500/60 leading-none">-12 dB</div>

              {/* Band range text labels */}
              <div className="absolute bottom-1 right-2 flex gap-3 text-[7.5px] font-mono text-zinc-600">
                <span>GRAVES: <strong className="text-[#10b981]">{bass > 0 ? '+' : ''}{bass}dB</strong></span>
                <span>MÉDIOS: <strong className="text-[#f59e0b]">{mids > 0 ? '+' : ''}{mids}dB</strong></span>
                <span>AGUDOS: <strong className="text-[#8b5cf6]">{treble > 0 ? '+' : ''}{treble}dB</strong></span>
              </div>
            </div>
          </div>

          {/* Equalizer (Graves, Médios, Agudos) 3 Faders Grid Layout */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">
              Equalizador Ativo de 3 Bandas (Preamplificador)
            </h4>

            <div className="grid grid-cols-3 gap-3">
              {/* GRAVES - BASS */}
              <div className="bg-[#0A0A0E] border border-[#22222A] rounded-xl p-3 flex flex-col items-center">
                <span className="text-[9px] font-bold text-[#10b981] tracking-wider uppercase mb-1 font-sans">
                  Graves
                </span>
                <span className="text-[8px] font-mono text-zinc-500 mb-3 block">
                  80 Hz
                </span>

                {/* Slider fader container */}
                <div className="h-32 flex items-center justify-center py-1">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={bass}
                    onChange={(e) => onEqChange(channel.id, { bass: Number(e.target.value) })}
                    className="accent-[#10b981] cursor-ns-resize h-28 [writing-mode:vertical-lr] bg-[#050508] border border-[#141419] w-2 rounded-full appearance-none outline-none"
                    style={{ direction: 'rtl' }}
                  />
                </div>

                <span className="text-[10px] font-mono font-bold mt-2 text-zinc-300">
                  {bass > 0 ? `+${bass}` : bass} dB
                </span>
              </div>

              {/* MÉDIOS - MIDS */}
              <div className="bg-[#0A0A0E] border border-[#22222A] rounded-xl p-3 flex flex-col items-center">
                <span className="text-[9px] font-bold text-[#f59e0b] tracking-wider uppercase mb-1 font-sans">
                  Médios
                </span>
                <span className="text-[8px] font-mono text-zinc-500 mb-3 block">
                  2.5 kHz
                </span>

                {/* Slider fader container */}
                <div className="h-32 flex items-center justify-center py-1">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={mids}
                    onChange={(e) => onEqChange(channel.id, { mids: Number(e.target.value) })}
                    className="accent-[#f59e0b] cursor-ns-resize h-28 [writing-mode:vertical-lr] bg-[#050508] border border-[#141419] w-2 rounded-full appearance-none outline-none"
                    style={{ direction: 'rtl' }}
                  />
                </div>

                <span className="text-[10px] font-mono font-bold mt-2 text-zinc-300">
                  {mids > 0 ? `+${mids}` : mids} dB
                </span>
              </div>

              {/* AGUDOS - TREBLE */}
              <div className="bg-[#0A0A0E] border border-[#22222A] rounded-xl p-3 flex flex-col items-center">
                <span className="text-[9px] font-bold text-[#8b5cf6] tracking-wider uppercase mb-1 font-sans">
                  Agudos
                </span>
                <span className="text-[8px] font-mono text-zinc-500 mb-3 block">
                  12 kHz
                </span>

                {/* Slider fader container */}
                <div className="h-32 flex items-center justify-center py-1">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={treble}
                    onChange={(e) => onEqChange(channel.id, { treble: Number(e.target.value) })}
                    className="accent-[#8b5cf6] cursor-ns-resize h-28 [writing-mode:vertical-lr] bg-[#050508] border border-[#141419] w-2 rounded-full appearance-none outline-none"
                    style={{ direction: 'rtl' }}
                  />
                </div>

                <span className="text-[10px] font-mono font-bold mt-2 text-zinc-300">
                  {treble > 0 ? `+${treble}` : treble} dB
                </span>
              </div>
            </div>
          </div>

          {/* Dinâmica / Compressor section slider inside the same config screen */}
          <div className="bg-[#0A0A0E] border border-[#22222A] p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                Limite & Compressão Dinâmica
              </span>
              <span className="text-[10px] font-mono text-[#10b981] font-bold">
                {compression > 0 ? `${compression}% ATIVO` : 'INATIVO'}
              </span>
            </div>
            
            <p className="text-[9px] text-zinc-500 leading-normal mb-3">
              Reduz automaticamente a intensidade de picos súbitos de voz para evitar distorções acústicas ou clipping no barramento de transmissão RTMP.
            </p>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={compression}
                onChange={(e) => onCompressionChange(channel.id, Number(e.target.value))}
                className="flex-1 accent-indigo-500 h-1.5 bg-[#050508] rounded-full appearance-none Outline-none cursor-pointer border border-[#22222A]/40"
              />
              <span className="text-xs font-mono font-bold text-indigo-400 w-10 text-right">
                {compression}%
              </span>
            </div>
          </div>

          {/* Professional Tip Footer */}
          <div className="text-[9px] text-zinc-600 leading-relaxed text-center bg-[#101015]/50 rounded-lg p-2.5 border border-zinc-900/60 font-medium">
            💡 <strong className="text-zinc-500">Dica Prática:</strong> Eleve ligeiramente os Agudos (+2dB) para clarear falas ruidosas e filtre Graves (-3dB) em microfones com excesso de sopro ou zumbidos de hardware.
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end p-4 bg-[#141419] border-t border-[#22222A]">
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Concluir Ajustes
          </button>
        </div>

      </div>
    </div>
  );
}
