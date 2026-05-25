import React, { useEffect, useState, useRef } from 'react';
import { AudioChannel } from '../types';
import { Sliders, Volume2, VolumeX, Settings, Radio, HelpCircle } from 'lucide-react';
import ChannelConfigModal from './ChannelConfigModal';

interface AudioMixerProps {
  channels: AudioChannel[];
  onVolumeChange: (id: string, value: number) => void;
  onToggleMute: (id: string) => void;
  onToggleSolo: (id: string) => void;
  onToggleRouting: (id: string, bus: 'M' | 'A' | 'B') => void;
  onCompressionChange: (id: string, value: number) => void;
  onEqChange: (id: string, bands: { bass?: number; mids?: number; treble?: number }) => void;
}

export default function AudioMixer({
  channels,
  onVolumeChange,
  onToggleMute,
  onToggleSolo,
  onToggleRouting,
  onCompressionChange,
  onEqChange,
}: AudioMixerProps) {
  // Let's implement real-time dynamic level bounce to simulate a fully functional console!
  const [meterLevels, setMeterLevels] = useState<{ [id: string]: number }>({});
  const [configChannel, setConfigChannel] = useState<AudioChannel | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const pulseMeters = () => {
      const levels: { [id: string]: number } = {};
      channels.forEach((chan) => {
        if (chan.muted) {
          levels[chan.id] = 0;
          return;
        }

        // Generate realistic voice-like envelope signal bounce
        const now = Date.now();
        const baseFactor = chan.volume / 100; // factor volume
        
        // Combine multiple sine waves with random factors. If master, combine input channels
        let noise = 0;
        if (chan.id === 'master') {
          // Master is average of non-muted active channels
          const activeOthers = channels.filter(c => c.id !== 'master' && !c.muted);
          if (activeOthers.length > 0) {
            const sum = activeOthers.reduce((acc, c) => acc + (meterLevels[c.id] || 0), 0);
            noise = sum / activeOthers.length;
          } else {
            noise = 0;
          }
        } else {
          // Individual channels generate customized frequencies
          const freq = chan.id === 'chan_a' ? 0.005 : chan.id === 'chan_b' ? 0.008 : 0.003;
          const speedFactor = chan.id === 'chan_a' ? 1.5 : 1.0;
          
          noise = (
            Math.sin(now * freq * speedFactor) * 0.45 +
            Math.cos(now * freq * 3.4) * 0.25 +
            Math.sin(now * 0.012) * 0.2 +
            Math.random() * 0.2
          );
          
          // Constrain between 0 and 1
          noise = Math.max(0, Math.min(1, (noise + 0.5) / 1.5)) * 100;
          noise = noise * baseFactor;
        }

        // Apply EQ adjustments to dynamic level bounce (pre-compression)
        const bassVal = chan.bass ?? 0;
        const midsVal = chan.mids ?? 0;
        const trebleVal = chan.treble ?? 0;
        const eqDbOffset = (bassVal * 0.15) + (midsVal * 0.2) + (trebleVal * 0.15);
        const eqMultiplier = Math.pow(10, eqDbOffset / 20);
        noise = noise * eqMultiplier;

        // Apply compression dynamic range adjustment to avoid distortion on loud parts
        const comp = chan.compression ?? 0;
        if (comp > 0) {
          const compFactor = comp / 100; // 0 to 1
          const threshold = 55; // threshold above which peaks are compressed
          if (noise > threshold) {
            // squash peaks above threshold
            noise = threshold + (noise - threshold) * (1 - compFactor * 0.82);
          }
        }

        levels[chan.id] = Math.max(0, Math.min(100, noise));
      });

      setMeterLevels(levels);
      animationFrameRef.current = requestAnimationFrame(pulseMeters);
    };

    animationFrameRef.current = requestAnimationFrame(pulseMeters);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [channels, meterLevels]);

  // Translate volumes to relative dB labels
  const getDBLabel = (volume: number) => {
    if (volume === 0) return '-INF dB';
    const db = Math.round((volume / 100) * 12 - 12);
    return `${db > 0 ? '+' : ''}${db} dB`;
  };

  return (
    <div className="bg-[#0A0A0A] border-t border-[#1F1F1F] p-3 text-zinc-300 flex flex-col h-[280px] overflow-hidden select-none">
      
      {/* Upper header */}
      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[#1F1F1F]">
        <Radio className="w-4 h-4 text-indigo-500 animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider text-white">Audio Mixer</span>
        <span className="text-[10px] text-zinc-500 font-mono bg-[#141414] px-2 py-0.5 rounded border border-[#1F1F1F]">
          Codec Estéreo ASIO (48 kHz)
        </span>
      </div>

      {/* Grid container of Channels */}
      <div className="flex-1 flex gap-2.5 overflow-x-auto overflow-y-hidden pb-1 min-w-max">
        
        {/* MASTER SECTION - EXACT MATCH TO IMAGE LEFT SIDE */}
        <div className="flex bg-[#0F0F0F] border-r-2 border-[#1F1F1F] pr-2.5">
          <div className="flex gap-2">
            
            {/* Master side controls label */}
            <div className="flex flex-col justify-between w-11 bg-[#0A0A0A] border border-[#1F1F1F] rounded p-1 text-[8px] font-mono text-center shrink-0">
              <span className="bg-indigo-600 text-white font-semibold px-1 py-0.5 rounded leading-none">OUTPUT</span>
              <div className="flex flex-col gap-1 items-center">
                <span className="text-zinc-500 [writing-mode:vertical-lr] tracking-wide uppercase">Outputs</span>
                <span className="text-indigo-400 font-bold font-sans">M</span>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <span className="text-zinc-500 [writing-mode:vertical-lr] tracking-wide uppercase">Inputs</span>
                <span className="text-emerald-400 font-bold font-sans">I</span>
              </div>
            </div>
            {/* MASTER INTERACTIVE STRIP */}
            <div className="bg-[#141414] border border-[#1F1F1F] rounded-lg p-2.5 flex flex-col justify-between shrink-0 w-[84px]">
              <div className="flex justify-between items-center pb-1 border-b border-[#1F1F1F]">
                <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-none">Master</p>
                <button
                  onClick={() => setConfigChannel(channels[0])}
                  className="p-0.5 rounded cursor-pointer text-zinc-500 hover:text-white hover:bg-[#1E1E1E] transition"
                  title="Configurar Equalização & Compressão do Master"
                >
                  <Settings className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Master fader and side meter bar */}
              <div className="flex justify-between items-center h-28 my-1.5 px-0.5 gap-2 overflow-hidden">
                {/* Physical Slider bar */}
                <div className="flex-1 flex justify-center relative h-full">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={channels[0]?.volume ?? 100}
                    onChange={(e) => onVolumeChange('master', Number(e.target.value))}
                    className="accent-indigo-600 cursor-row-resize h-full [writing-mode:vertical-lr] bg-[#0A0A0A] w-2.5 rounded-full appearance-none outline-none"
                    style={{ direction: 'rtl' }}
                  />
                </div>

                {/* DB level meter exactly like professional fader */}
                <div className="w-3.5 h-full bg-[#0A0A0A] rounded overflow-hidden flex flex-col justify-end p-0.5 border border-[#1F1F1F] relative shrink-0">
                  <div
                    className="w-full rounded-sm transition-all duration-75"
                    style={{
                      height: `${meterLevels['master'] || 0}%`,
                      background: 'linear-gradient(to top, #10b981 0%, #10b981 65%, #f59e0b 70%, #f59e0b 85%, #ef4444 90%, #ef4444 100%)'
                    }}
                  />
                </div>
              </div>

              {/* Control buttons */}
              <div className="flex justify-between items-center text-[10px] gap-1">
                <button
                  onClick={() => onToggleMute('master')}
                  className={`flex-1 font-semibold text-center py-1 rounded text-[9px] cursor-pointer ${
                    channels[0]?.muted
                      ? 'bg-red-650 bg-red-600 text-white'
                      : 'bg-[#1F1F1F] hover:bg-[#2A2A2A] text-zinc-350'
                  }`}
                >
                  MUTE
                </button>
                <span className="text-[8px] font-mono text-zinc-500 w-9 text-right shrink-0">
                  {getDBLabel(channels[0]?.volume ?? 0)}
                </span>
              </div>
            </div>

            {/* Audio Interface setup */}
            <div className="w-[84px] bg-[#141414] border border-[#1F1F1F] rounded-lg p-2.5 flex flex-col justify-between shrink-0">
              <div className="text-center">
                <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest line-clamp-1">Audio Intf.</p>
                <div className="h-0.5 w-6 bg-[#1F1F1F] mx-auto mt-0.5 rounded" />
              </div>

              <div className="flex flex-col items-center gap-1 my-1.5">
                {/* Routing switches in Red Highlight box, mimicking image */}
                <div className="border border-[#1F1F1F] rounded px-1.5 py-1 flex gap-1 bg-[#0A0A0A] shadow-md">
                  {['M', 'A', 'B'].map((bus) => (
                    <button
                      key={bus}
                      onClick={() => onToggleRouting('master', bus as any)}
                      className="h-4 w-4 rounded-sm text-[8px] text-zinc-300 font-semibold flex items-center justify-center bg-[#1F1F1F] border border-[#2A2A2A] transition hover:bg-[#2A2A2A] active:scale-90 cursor-pointer"
                    >
                      {bus}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speaker status visual */}
              <div className="flex justify-center items-center gap-1.5 px-0.5">
                <button className="p-1 rounded bg-[#0A0A0A] hover:bg-[#1F1F1F] text-zinc-400 hover:text-white transition-colors cursor-pointer">
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 rounded bg-[#0A0A0A] hover:bg-[#1F1F1F] text-zinc-400 hover:text-white transition-colors cursor-pointer">
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* CHANNELS A, B, C, D, E, F - MATCH PANEL IN RED BOX AND FOOTER SPAN */}
        <div className="flex gap-2">
          {channels.slice(1).map((chan) => {
            const level = meterLevels[chan.id] || 0;
            return (
              <div
                key={chan.id}
                className="bg-[#141414] border border-[#1F1F1F] rounded-lg p-1.5 flex flex-col justify-between w-16"
              >
                {/* Channel tag */}
                <div className="flex justify-between items-center pb-1 border-b border-[#1F1F1F]">
                  <span className="text-[9px] font-mono font-semibold text-zinc-350">{chan.label}</span>
                  <button
                    onClick={() => setConfigChannel(chan)}
                    className="p-0.5 rounded cursor-pointer transition text-zinc-500 hover:text-white hover:bg-[#1F1F1F]"
                    title="Configurar Equalização & Compressão"
                  >
                    <Settings className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* S / M buttons side by side */}
                <div className="grid grid-cols-2 gap-1 mt-1 text-[8px] text-center font-semibold leading-none">
                  <button
                    onClick={() => onToggleSolo(chan.id)}
                    className={`py-0.5 px-1 rounded transition cursor-pointer ${
                      chan.solo
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-[#1F1F1F] hover:bg-[#2A2A2A] text-zinc-400'
                    }`}
                  >
                    S
                  </button>
                  <button
                    onClick={() => onToggleMute(chan.id)}
                    className={`py-0.5 px-1 rounded transition cursor-pointer ${
                      chan.muted
                        ? 'bg-red-650 bg-red-600 text-white font-bold'
                        : 'bg-[#1F1F1F] hover:bg-[#2A2A2A] text-zinc-400'
                    }`}
                  >
                    M
                  </button>
                </div>

                {/* Body section layout */}
                <div className="flex-1 flex gap-1.5 my-1.5 overflow-hidden">
                  {/* Fader + VU Section */}
                  <div className="flex-1 flex justify-between gap-1 select-none relative h-24">
                    {/* Slider */}
                    <div className="flex-1 flex justify-center relative">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={chan.volume}
                        onChange={(e) => onVolumeChange(chan.id, Number(e.target.value))}
                        className="accent-indigo-650 accent-indigo-600 cursor-row-resize h-full [writing-mode:vertical-lr] bg-[#0A0A0A] w-[5px] rounded-full appearance-none outline-none"
                        style={{ direction: 'rtl' }}
                      />
                    </div>

                    {/* VU Level meter */}
                    <div className="w-1.5 relative h-full bg-[#0A0A0A] rounded overflow-hidden flex flex-col justify-end p-0.5 shrink-0">
                      {/* Multi Color indicator filling up based on level */}
                      <div
                        className="absolute bottom-0 inset-x-0 transition-all duration-75"
                        style={{
                          height: `${level}%`,
                          background: 'linear-gradient(to top, #10b981 0%, #10b981 65%, #fbbf24 70%, #fbbf24 85%, #f87171 90%, #f87171 100%)'
                        }}
                      />
                      {/* Small dot indicating peak marker */}
                      <div className="absolute w-full h-[1px] bg-red-400/80" style={{ bottom: `${level > 50 ? level - 2 : 40}%` }} />
                    </div>
                  </div>
                </div>

                {/* Routing M A B and volume DB text exactly like screenshot layout */}
                <div className="flex flex-col gap-1 items-center">
                  <div className="flex gap-0.5 text-[7px] scale-90">
                    <button
                      onClick={() => onToggleRouting(chan.id, 'M')}
                      className={`h-3 w-3 flex items-center justify-center rounded-sm font-semibold text-white leading-none cursor-pointer ${
                        chan.routedToMaster ? 'bg-indigo-600' : 'bg-[#1F1F1F] text-zinc-500'
                      }`}
                    >
                      M
                    </button>
                    <button
                      onClick={() => onToggleRouting(chan.id, 'A')}
                      className={`h-3 w-3 flex items-center justify-center rounded-sm font-semibold text-white leading-none cursor-pointer ${
                        chan.routedToA ? 'bg-amber-600' : 'bg-[#1F1F1F] text-zinc-500'
                      }`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => onToggleRouting(chan.id, 'B')}
                      className={`h-3 w-3 flex items-center justify-center rounded-sm font-semibold text-white leading-none cursor-pointer ${
                        chan.routedToB ? 'bg-emerald-600' : 'bg-[#1F1F1F] text-zinc-500'
                      }`}
                    >
                      B
                    </button>
                  </div>
                  <span className="text-[7.5px] font-mono text-zinc-500 leading-none">
                    {getDBLabel(chan.volume)}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Embedded Channel Audio Configuration Overlay Dialog */}
      {configChannel && (
        <ChannelConfigModal
          isOpen={configChannel !== null}
          onClose={() => setConfigChannel(null)}
          channel={channels.find((c) => c.id === configChannel.id) || configChannel}
          onCompressionChange={onCompressionChange}
          onEqChange={onEqChange}
        />
      )}
    </div>
  );
}
