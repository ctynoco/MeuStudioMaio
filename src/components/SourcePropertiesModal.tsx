import React, { useState, useEffect, useRef } from 'react';
import { X, Sliders, Volume2, RefreshCw, SlidersHorizontal, Settings, Camera, Tv, Image as ImageIcon, Video, Layers, Eye, EyeOff, Plus, Trash2, HelpCircle, Activity, Sparkles, Check, RotateCcw, FileText, Wind } from 'lucide-react';
import { Source } from '../types';

interface SourcePropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: Source | null;
  onModifySource: (id: string, updates: Partial<Source>) => void;
}

const STREAMING_DEVICES = {
  webcam: [
    { id: 'webcam_int', name: 'Integrated Camera (04f2:b61e)' },
    { id: 'webcam_obs', name: 'OBS Virtual Camera' },
    { id: 'webcam_logi', name: 'Logitech Webcam C920' },
    { id: 'webcam_nv', name: 'NVIDIA Broadcast Camera' },
  ],
  screen: [
    { id: 'scr_main', name: 'Monitor Principal - Tela Completa (1920x1080)' },
    { id: 'scr_second', name: 'Monitor Auxiliar (1280x720)' },
    { id: 'win_chrome', name: 'Janela: Google Chrome - Plenário Live' },
    { id: 'win_zoom', name: 'Janela: Zoom Meeting - Ver. José Silva' },
    { id: 'win_vlc', name: 'Janela: VLC Media Player' },
  ],
};

export default function SourcePropertiesModal({
  isOpen,
  onClose,
  source,
  onModifySource,
}: SourcePropertiesModalProps) {
  const [activeTab, setActiveTab] = useState<'properties' | 'filters'>('properties');
  const [selectedFilter, setSelectedFilter] = useState<string>('chromakey');
  const [bounceLevel, setBounceLevel] = useState(30);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen || !source) return;

    // Simulate level meter bouncing for audio-carrying sources using gain Db offset
    const activeGain = source.gainDb ?? 0;
    const isMuted = source.muted;

    const animate = () => {
      if (isMuted || source.volume === 0) {
        setBounceLevel(0);
      } else {
        const baseFactor = 35 + Math.random() * 25;
        // Apply gain dB multiplier (e.g. +6dB increases amplitude)
        const dbMultiplier = Math.pow(10, activeGain / 20);
        const calculated = Math.min(100, Math.max(0, baseFactor * dbMultiplier));
        setBounceLevel(calculated);
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isOpen, source]);

  if (!isOpen || !source) return null;

  // Make sure default values are local-bound
  const locked = source.locked ?? false;
  const resolution = source.resolution ?? '1920x1080';
  const fps = source.fps ?? 30;
  const selectedDevice = source.selectedDevice ?? (source.type === 'webcam' ? STREAMING_DEVICES.webcam[0].name : STREAMING_DEVICES.screen[0].name);
  const captureCursor = source.captureCursor ?? true;
  const videoFormat = source.videoFormat ?? 'NV12';
  const speedMultiplier = source.speedMultiplier ?? 1.0;
  const loopVideo = source.loopVideo ?? true;

  // Filters State references
  const chromaKeyActive = source.chromaKey ?? false;
  const chromaKeyColor = source.chromaKeyColor ?? 'green';
  const chromaKeySimilarity = source.chromaKeySimilarity ?? 400;
  const chromaKeySmoothness = source.chromaKeySmoothness ?? 80;
  const chromaKeySpillValue = source.chromaKeySpillValue ?? 100;
  const gainDb = source.gainDb ?? 0;
  const noiseSuppressionActive = source.noiseSuppression ?? false;
  const noiseSuppressionMethod = source.noiseSuppressionMethod ?? 'rnnoise';

  // Video adjustment filters
  const contrast = source.contrast ?? 100; // in %
  const brightness = source.brightness ?? 100; // in %
  const saturation = source.saturation ?? 100; // in %
  const gamma = source.gamma ?? 1.0; // color gamma multiplier

  // Reset function to restore layout parameters
  const handleResetSettings = () => {
    onModifySource(source.id, {
      selectedDevice: source.type === 'webcam' ? STREAMING_DEVICES.webcam[0].name : STREAMING_DEVICES.screen[0].name,
      resolution: '1920x1080',
      fps: 30,
      videoFormat: 'NV12',
      captureCursor: true,
      speedMultiplier: 1.0,
      loopVideo: true,
      contrast: 100,
      brightness: 100,
      saturation: 100,
      gamma: 1.0,
    });
  };

  const handleResetFilters = () => {
    onModifySource(source.id, {
      chromaKey: false,
      chromaKeyColor: 'green',
      chromaKeySimilarity: 400,
      chromaKeySmoothness: 80,
      chromaKeySpillValue: 100,
      gainDb: 0,
      noiseSuppression: false,
      noiseSuppressionMethod: 'rnnoise',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-4xl bg-[#141416] border border-[#222125] rounded-xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
        
        {/* Title Bar - Styled like native OBS Studio Window */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1C1B1F] border-b border-[#28272C] select-none shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-sans">
              Propriedades de Mídia e Filtros: <span className="text-indigo-400 font-mono">{source.name}</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#28272C] rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Navigation Tabs (Properties vs Video/Audio Filters) */}
        <div className="flex bg-[#1A191D] border-b border-[#222125] shrink-0 px-2 gap-1.5">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'properties'
                ? 'border-indigo-500 text-white bg-[#222125]/40'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Configurações da Fonte
          </button>
          <button
            onClick={() => setActiveTab('filters')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'filters'
                ? 'border-indigo-500 text-white bg-[#222125]/40'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Filtros Ativos (OBS DSP)
          </button>
        </div>

        {/* Main Content Area - Split (Left Pane: Live OBS Preview, Right Pane: Scrollable Form Parameters) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-[#0F0E12]">
          
          {/* LEFT COLUMN: LIVE OBS STUDIO SIMULATOR PREVIEW */}
          <div className="w-full md:w-[45%] border-r border-[#1D1C20] flex flex-col bg-[#080709] p-4 justify-between select-none">
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-red-500 animate-pulse" />
                Visualização do Canvas do Dispositivo
              </span>

              {/* Simulation Screen Container */}
              <div className="relative w-full aspect-video bg-[#040405] rounded-lg border border-[#222125] overflow-hidden flex items-center justify-center">
                
                {/* Backdrop Pattern representation (e.g. green backdrop or legislative view) */}
                {chromaKeyActive && chromaKeyColor === 'green' && (
                  <div className="absolute inset-0 bg-emerald-950/20 border border-emerald-500/20 m-2 rounded" />
                )}

                {/* Background when Chroma Key cuts out the solid color / webcam backup */}
                {chromaKeyActive && source.type === 'webcam' && (
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950 via-slate-900 to-[#040405] opacity-80" />
                )}

                {/* Simulated webcam visual */}
                {source.type === 'webcam' && (
                  <div 
                    className="flex flex-col items-center justify-center text-center transition-all duration-300"
                    style={{
                      transform: `scale(${source.scale})`,
                      opacity: source.opacity,
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
                    }}
                  >
                    {!chromaKeyActive && <div className="absolute inset-x-8 inset-y-4 rounded bg-emerald-500/10 border-2 border-emerald-700/30 -z-10" />}
                    <Camera className={`w-12 h-12 ${chromaKeyActive ? 'text-indigo-400' : 'text-emerald-400'} mb-2`} />
                    <p className="text-xs font-semibold text-zinc-300">{selectedDevice}</p>
                    <p className="text-[9px] font-mono text-zinc-500 mt-1">
                      {resolution} @ {fps}fps • {videoFormat}
                    </p>
                    {chromaKeyActive && (
                      <span className="absolute bottom-2 bg-indigo-500/15 border border-indigo-500/45 text-indigo-400 font-mono text-[7.5px] font-bold px-1.5 py-0.5 rounded leading-none">
                        FUNDO CHROMA TRANSPARENTE
                      </span>
                    )}
                  </div>
                )}

                {/* Simulated screen capture visual */}
                {source.type === 'screen' && (
                  <div 
                    className="flex flex-col items-center justify-center p-4 text-center"
                    style={{
                      transform: `scale(${source.scale})`,
                      opacity: source.opacity,
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
                    }}
                  >
                    <Tv className="w-12 h-12 text-purple-400 mb-2" />
                    <span className="text-xs font-semibold text-zinc-300 max-w-[200px] truncate">{selectedDevice}</span>
                    <p className="text-[9px] font-mono text-zinc-500 mt-0.5">Captura Ativa: {captureCursor ? 'Com Cursor' : 'Sem Cursor'}</p>
                  </div>
                )}

                {/* Simulated Image Source */}
                {source.type === 'image' && (
                  <div 
                    className="flex flex-col items-center justify-center p-3 text-center"
                    style={{
                      transform: `scale(${source.scale})`,
                      opacity: source.opacity,
                      color: source.color || '#ffffff',
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
                    }}
                  >
                    <ImageIcon className="w-14 h-14 mb-2" style={{ color: source.color || undefined }} />
                    <span className="text-xs font-semibold text-zinc-300">tvcamara_maracanau.png</span>
                    <p className="text-[9px] font-mono text-zinc-500 mt-0.5">Z-Index Alpha • {resolution}</p>
                  </div>
                )}

                {/* Simulated Video Source */}
                {source.type === 'video' && (
                  <div 
                    className="flex flex-col items-center justify-center p-4 text-center"
                    style={{
                      transform: `scale(${source.scale})`,
                      opacity: source.opacity,
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
                    }}
                  >
                    <div className="relative mb-2">
                      <Video className="w-12 h-12 text-sky-450 animate-pulse" />
                      <span className="absolute -top-1 -right-2 text-[6px] font-bold bg-sky-500 text-black px-1 rounded-sm leading-none font-mono">
                        {speedMultiplier.toFixed(1)}x
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-zinc-300">clipe_ordinario_2026.mp4</span>
                    <p className="text-[9px] font-mono text-zinc-500 mt-0.5">
                      {loopVideo ? 'Looping Contínuo' : 'Parar ao término'}
                    </p>
                  </div>
                )}

                {/* Simulated Color Solid */}
                {source.type === 'color_solid' && (
                  <div 
                    className="w-full h-full flex flex-col items-center justify-center p-4 text-center"
                    style={{ 
                      backgroundColor: source.color || '#3b82f6',
                      opacity: source.opacity,
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
                    }}
                  >
                    <span className="text-xs font-bold text-black drop-shadow bg-white/70 px-2 py-0.5 rounded font-mono">
                      {source.color || '#3b82f6'}
                    </span>
                    <span className="text-[9px] font-semibold text-black/80 drop-shadow mt-1">SÓLIDO DE FUNDO OBS</span>
                  </div>
                )}

                {/* Canvas grid metrics / guidelines */}
                <div className="absolute inset-0 border border-zinc-700/20 pointer-events-none" />
                <div className="absolute inset-x-0 h-[1px] top-1/2 bg-zinc-700/10 pointer-events-none" />
                <div className="absolute inset-y-0 w-[1px] left-1/2 bg-zinc-700/10 pointer-events-none" />
                
                {/* Visual anchor dots signifying OBS transform anchors */}
                <div className="absolute w-1.5 h-1.5 bg-red-500 border border-white top-0 left-0" />
                <div className="absolute w-1.5 h-1.5 bg-red-500 border border-white top-0 right-0" />
                <div className="absolute w-1.5 h-1.5 bg-red-500 border border-white bottom-0 left-0" />
                <div className="absolute w-1.5 h-1.5 bg-red-500 border border-white bottom-0 right-0" />
                <div className="absolute w-1.5 h-1.5 bg-red-500 border border-white top-1/2 left-0 -translate-y-1/2" />
                <div className="absolute w-1.5 h-1.5 bg-red-500 border border-white top-1/2 right-0 -translate-y-1/2" />
              </div>
            </div>

            {/* REAL-TIME VU DB AUDIO GAIN BOUNCER BAR */}
            <div className="bg-[#141317] border border-[#222125] p-3 rounded-lg space-y-2 mt-4">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  Ganho Real e Decibéis (DSP)
                </span>
                <span className={`${bounceLevel > 80 ? 'text-red-400' : bounceLevel > 60 ? 'text-yellow-400' : 'text-emerald-400'} font-mono text-[9px]`}>
                  {bounceLevel > 0 ? `${(Math.log10(bounceLevel/100) * 20 + gainDb).toFixed(1)} dB` : 'MUTED'}
                </span>
              </div>

              {/* VU Meter Slider Bar exactly matching professional layout */}
              <div className="h-2 w-full bg-[#050507] rounded border border-zinc-900 overflow-hidden flex relative">
                {/* Peak Green bar */}
                <div 
                  className="bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 h-full transition-all duration-75"
                  style={{ width: `${bounceLevel}%` }}
                />
                
                {/* Mute threshold indicator overlay */}
                {source.muted && (
                  <div className="absolute inset-0 bg-red-950/40 flex items-center justify-center">
                    <span className="text-[7.5px] font-bold text-red-500 tracking-widest leading-none">CANAL MUTADO EM SOFTWARE</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-[7px] font-mono text-zinc-500 leading-none">
                <span>-60 dB</span>
                <span>-30 dB</span>
                <span>-18 dB</span>
                <span>-10 dB</span>
                <span>-5 dB</span>
                <span>0 dB</span>
                <span>+6 dB</span>
              </div>
            </div>

            {/* QUICK ACTIONS FOOTER FOR SOURCE */}
            <div className="border-t border-[#1D1C20] pt-3.5 mt-2 flex justify-between items-center text-[10px] text-zinc-400 gap-2 shrink-0">
              <span className="font-mono flex items-center gap-1">
                📌 X: {Math.round(source.position.x)}, Y: {Math.round(source.position.y)}
              </span>
              <div className="flex items-center gap-1.5">
                <span>Cadeado:</span>
                <button
                  onClick={() => onModifySource(source.id, { locked: !locked })}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 font-bold leading-none cursor-pointer border ${
                    locked
                      ? 'bg-red-950/20 text-red-400 border-red-900/40'
                      : 'bg-[#1C1B1F] text-zinc-300 border-zinc-800'
                  }`}
                  title={locked ? 'Desbloquear Posição' : 'Bloquear Posição de Tela'}
                >
                  {locked ? 'TRAVADO' : 'LIVRE'}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: RESPONSIVE OPTIONS FORM BODY (PROPERTIES TAB / FILTERS TAB) */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#161519]">
            
            {/* TAB #1: CONFIGURAÇÕES DA FONTE */}
            {activeTab === 'properties' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest leading-none mb-4 pb-2 border-b border-[#222125]">
                    Configurações do Dispositivo de Fluxo
                  </h4>

                  <div className="space-y-4">
                    {/* DEVICE SELECTOR */}
                    {(source.type === 'webcam' || source.type === 'screen') && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-300 block">
                          {source.type === 'webcam' ? 'Dispositivo de Captura de Câmera' : 'Selecionar Tela ou Janela'}
                        </label>
                        <select
                          value={selectedDevice}
                          onChange={(e) => onModifySource(source.id, { selectedDevice: e.target.value })}
                          className="w-full bg-[#0F0E12] text-zinc-200 border border-[#222125] rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                        >
                          {source.type === 'webcam'
                            ? STREAMING_DEVICES.webcam.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)
                            : STREAMING_DEVICES.screen.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)
                          }
                        </select>
                      </div>
                    )}

                    {/* IMAGE FILE SOURCE SETTING */}
                    {source.type === 'image' && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-300 block">Caminho da Imagem Estática</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={source.imageUrl || 'assets/maracanau_logo.png'}
                              onChange={(e) => onModifySource(source.id, { imageUrl: e.target.value })}
                              className="flex-1 bg-[#0F0E12] text-zinc-200 border border-[#222125] rounded px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => onModifySource(source.id, { imageUrl: 'assets/maracanau_logo.png' })}
                              className="px-3 bg-[#1C1B1F] hover:bg-zinc-800 text-zinc-300 rounded text-xs border border-zinc-800 transition-colors"
                            >
                              Browse
                            </button>
                          </div>
                        </div>

                        {/* Image tint solid color */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-300 block">Preenchimento de Cor (Tint)</label>
                          <div className="flex gap-3 items-center">
                            <input
                              type="color"
                              value={source.color || '#ffffff'}
                              onChange={(e) => onModifySource(source.id, { color: e.target.value })}
                              className="bg-transparent h-8 w-14 cursor-pointer outline-none border border-zinc-850 rounded"
                            />
                            <span className="text-xs font-mono text-zinc-400">{source.color || '#ffffff'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* VIDEO CLIPE SOURCE SETTINGS */}
                    {source.type === 'video' && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-300 block font-sans">Arquivo de Vídeo MP4</label>
                          <input
                            type="text"
                            value={source.videoUrl || 'assets/clips/sessao_parlamentar.mp4'}
                            onChange={(e) => onModifySource(source.id, { videoUrl: e.target.value })}
                            className="w-full bg-[#0F0E12] text-zinc-200 border border-[#222125] rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-1">
                          <label className="flex items-center gap-2 text-xs text-zinc-300 font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={loopVideo}
                              onChange={(e) => onModifySource(source.id, { loopVideo: e.target.checked })}
                              className="accent-indigo-500 rounded border-zinc-800 focus:ring-0"
                            />
                            Repetir em Loop
                          </label>

                          <label className="flex items-center gap-2 text-xs text-zinc-300 font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!source.muted}
                              onChange={(e) => onModifySource(source.id, { muted: !e.target.checked })}
                              className="accent-indigo-500 rounded border-zinc-800 focus:ring-0"
                            />
                            Ativar Áudio
                          </label>
                        </div>

                        {/* Video playback speed control slider */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-xs text-zinc-300 font-semibold">
                            <span>Velocidade de Reprodução</span>
                            <span className="font-mono text-indigo-400">{speedMultiplier.toFixed(1)}x</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.5"
                            value={speedMultiplier}
                            onChange={(e) => onModifySource(source.id, { speedMultiplier: parseFloat(e.target.value) })}
                            className="w-full accent-indigo-500 bg-[#0F0E12] h-1.5 rounded-full cursor-pointer appearance-none border border-[#222125]"
                          />
                          <div className="flex justify-between text-[8px] font-mono text-zinc-500 leading-none">
                            <span>0.5x (Slow)</span>
                            <span>1.0x (Normal)</span>
                            <span>1.5x</span>
                            <span>2.0x (Fast)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SOLID COLOR SELECTOR */}
                    {source.type === 'color_solid' && (
                      <div className="space-y-3">
                        <label className="text-xs font-semibold text-zinc-300 block">Cor de Preenchimento de Fundo Sólido</label>
                        <div className="flex items-center gap-4 bg-[#0F0E12] border border-[#222125] p-3 rounded-lg">
                          <input
                            type="color"
                            value={source.color || '#1e3a8a'}
                            onChange={(e) => onModifySource(source.id, { color: e.target.value })}
                            className="bg-transparent h-9 w-16 cursor-pointer outline-none border border-zinc-700/50 rounded"
                          />
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-zinc-200">Selecionador de Cor Exata</p>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase">{source.color || '#1e3a8a'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* RESOLUTION AND FPS OVERRIDES (FOR WEBCAM / SCREEN SOURCES) */}
                    {(source.type === 'webcam' || source.type === 'screen') && (
                      <div className="grid grid-cols-2 gap-4 pt-1.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-300 block">Resolução Recomendada</label>
                          <select
                            value={resolution}
                            onChange={(e) => onModifySource(source.id, { resolution: e.target.value })}
                            className="w-full bg-[#0F0E12] text-zinc-200 border border-[#222125] rounded px-3 py-1.5 text-xs focus:outline-none"
                          >
                            <option value="1920x1080">1920x1080 (1080p FHD)</option>
                            <option value="1280x720">1280x720 (720p HD)</option>
                            <option value="854x480">854x480 (480p SD)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-300 block">Taxa de Atualização (FPS)</label>
                          <select
                            value={fps}
                            onChange={(e) => onModifySource(source.id, { fps: Number(e.target.value) })}
                            className="w-full bg-[#0F0E12] text-zinc-200 border border-[#222125] rounded px-3 py-1.5 text-xs focus:outline-none"
                          >
                            <option value={30}>30 fps</option>
                            <option value={60}>60 fps</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* VIDEO DECODER FORMAT (ONLY FOR CAPTURE OR WEBCAM SOURCES) */}
                    {source.type === 'webcam' && (
                      <div className="space-y-1.5 pt-1.5">
                        <label className="text-xs font-semibold text-zinc-300 block">Formato de Decodificação de Vídeo</label>
                        <select
                          value={videoFormat}
                          onChange={(e) => onModifySource(source.id, { videoFormat: e.target.value })}
                          className="w-full bg-[#0F0E12] text-zinc-200 border border-[#222125] rounded px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="NV12">NV12 (Hardware Compressed)</option>
                          <option value="YUY2">YUY2 (uncompressed, chroma sub-sampled)</option>
                          <option value="XRGB">XRGB (Full 32-bit RGB rendering)</option>
                        </select>
                      </div>
                    )}

                    {/* CAPTURE CURSOR CHECKBOX (FOR SCREEN SOURCES ONLY) */}
                    {source.type === 'screen' && (
                      <label className="flex items-center gap-2.5 text-xs text-zinc-300 font-semibold cursor-pointer pt-2">
                        <input
                          type="checkbox"
                          checked={captureCursor}
                          onChange={(e) => onModifySource(source.id, { captureCursor: e.target.checked })}
                          className="accent-indigo-500 rounded border-zinc-800"
                        />
                        Capturar cursor do mouse na área de trabalho
                      </label>
                    )}
                  </div>
                </div>

                {/* BASIC COLOR AND RENDERING FILTERS IN THE TAB TOO */}
                <div className="pt-4 border-t border-[#222125]">
                  <h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest leading-none mb-4">
                    Correção de Cor & Gama Básica
                  </h4>

                  <div className="space-y-3.5">
                    {/* Contrast slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-300 font-semibold">
                        <span>Contraste</span>
                        <span className="font-mono text-indigo-400">{contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="180"
                        value={contrast}
                        onChange={(e) => onModifySource(source.id, { contrast: Number(e.target.value) })}
                        className="w-full accent-indigo-500 bg-[#0F0E12] h-1 rounded-sm appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Brightness slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-300 font-semibold">
                        <span>Brilho</span>
                        <span className="font-mono text-indigo-400">{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={brightness}
                        onChange={(e) => onModifySource(source.id, { brightness: Number(e.target.value) })}
                        className="w-full accent-indigo-500 bg-[#0F0E12] h-1 rounded-sm appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Saturation slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-300 font-semibold">
                        <span>Saturação de Cor</span>
                        <span className="font-mono text-indigo-400">{saturation}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={saturation}
                        onChange={(e) => onModifySource(source.id, { saturation: Number(e.target.value) })}
                        className="w-full accent-indigo-500 bg-[#0F0E12] h-1 rounded-sm appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB #2: FILTROS ATIVOS DO OBS (CHROMA KEY, AUDIO FILTERS ETC.) */}
            {activeTab === 'filters' && (
              <div className="flex-1 flex overflow-hidden min-h-0">
                
                {/* SPLIT COLUMN LEFT: List of Active Filters exactly like OBS Studio */}
                <div className="w-[35%] bg-[#1A191C] border-r border-[#222125] flex flex-col justify-between h-full min-h-0">
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Filtros de Vídeo/Áudio</span>
                    
                    {/* Chromat Key filter row */}
                    <div
                      onClick={() => setSelectedFilter('chromakey')}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        selectedFilter === 'chromakey' ? 'bg-indigo-950/40 border border-indigo-800/40 text-white font-semibold' : 'hover:bg-zinc-800/50 text-zinc-400 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Sparkles className={`w-3.5 h-3.5 ${chromaKeyActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                        <span className="text-[11px] truncate">Fundo Chroma Key</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onModifySource(source.id, { chromaKey: !chromaKeyActive });
                        }}
                        className={`p-0.5 rounded ${chromaKeyActive ? 'text-indigo-450 text-indigo-400' : 'text-zinc-650 text-zinc-500'}`}
                      >
                        {chromaKeyActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Audio Gain filter row */}
                    <div
                      onClick={() => setSelectedFilter('gain')}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        selectedFilter === 'gain' ? 'bg-indigo-950/40 border border-indigo-800/40 text-white font-semibold' : 'hover:bg-zinc-800/50 text-zinc-400 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Volume2 className={`w-3.5 h-3.5 ${gainDb !== 0 ? 'text-emerald-400' : 'text-zinc-500'}`} />
                        <span className="text-[11px] truncate">Ganho Dinâmico dBs</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onModifySource(source.id, { gainDb: gainDb === 0 ? 6 : 0 });
                        }}
                        className="p-0.5 rounded text-zinc-400"
                      >
                        {gainDb !== 0 ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-650" />}
                      </button>
                    </div>

                    {/* Noise suppression row */}
                    <div
                      onClick={() => setSelectedFilter('noise')}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        selectedFilter === 'noise' ? 'bg-indigo-950/40 border border-indigo-800/40 text-white font-semibold' : 'hover:bg-zinc-800/50 text-zinc-400 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Wind className={`w-3.5 h-3.5 ${noiseSuppressionActive ? 'text-teal-400' : 'text-zinc-500'}`} />
                        <span className="text-[11px] truncate">Redução de Ruído</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onModifySource(source.id, { noiseSuppression: !noiseSuppressionActive });
                        }}
                        className={`p-0.5 rounded ${noiseSuppressionActive ? 'text-teal-400' : 'text-zinc-500'}`}
                      >
                        {noiseSuppressionActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Add / Add/Remove Filter icons footer just like OBS layout */}
                  <div className="bg-[#1C1B1F] border-t border-[#222125] p-1.5 flex justify-start gap-1">
                    <button
                      onClick={() => onModifySource(source.id, { chromaKey: true })}
                      className="p-1 hover:bg-[#28272C] text-zinc-400 hover:text-white rounded transition"
                      title="Adicionar Novo Filtro DSP"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleResetFilters}
                      className="p-1 hover:bg-[#28272C] text-zinc-400 hover:text-red-400 rounded transition"
                      title="Remover / Redefinir Todos Filtros"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* SPLIT COLUMN RIGHT: Filter Parameters Area */}
                <div className="flex-1 overflow-y-auto p-5 select-none text-zinc-300">
                  
                  {/* DETAILED CHROMA KEY PARAMS */}
                  {selectedFilter === 'chromakey' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-[#0F0E12] border border-[#222125] p-3 rounded-lg">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-zinc-200 block">Filtro de Fundo Virtual (Chroma)</span>
                          <span className="text-[9.5px] text-zinc-500">Isola e recorta cores sólidas de fundo do transmissor</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={chromaKeyActive}
                          onChange={(e) => onModifySource(source.id, { chromaKey: e.target.checked })}
                          className="accent-indigo-500 rounded border-zinc-800"
                        />
                      </div>

                      {chromaKeyActive && (
                        <div className="space-y-4 pt-1 animate-fadeIn">
                          {/* Filter target color standard */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-300 block">Cor de Tipo de Chave (OBS Key Color)</label>
                            <select
                              value={chromaKeyColor}
                              onChange={(e) => onModifySource(source.id, { chromaKeyColor: e.target.value as any })}
                              className="w-full bg-[#0F0E12] text-zinc-200 border border-[#222125] rounded px-3 py-2 text-xs focus:outline-none"
                            >
                              <option value="green">Verde (Chroma Screen)</option>
                              <option value="blue">Azul (Estúdio Tradicional)</option>
                              <option value="magenta">Magenta / Rosa</option>
                              <option value="custom">Valor Personalizado</option>
                            </select>
                          </div>

                          {/* Similarity (Semelhança) slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span>Semelhança de Tom</span>
                              <span className="font-mono text-indigo-400">{chromaKeySimilarity}</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="1000"
                              value={chromaKeySimilarity}
                              onChange={(e) => onModifySource(source.id, { chromaKeySimilarity: Number(e.target.value) })}
                              className="w-full accent-indigo-500 bg-[#0F0E12] h-1 rounded-sm appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[7px] font-mono text-zinc-500 leading-none">
                              <span>Menos Tolerância</span>
                              <span>Filtro Padrão (400)</span>
                              <span>Mais Recorte</span>
                            </div>
                          </div>

                          {/* Smoothness (Suavidade) slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span>Suavidade das Bordas recortadas</span>
                              <span className="font-mono text-indigo-400">{chromaKeySmoothness}</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="1000"
                              value={chromaKeySmoothness}
                              onChange={(e) => onModifySource(source.id, { chromaKeySmoothness: Number(e.target.value) })}
                              className="w-full accent-indigo-500 bg-[#0F0E12] h-1 rounded-sm appearance-none cursor-pointer"
                            />
                          </div>

                          {/* Spill reduction (Redução de vazamento) */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span>Redução de Vazamento da Cor Chave</span>
                              <span className="font-mono text-indigo-400">{chromaKeySpillValue}</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="1000"
                              value={chromaKeySpillValue}
                              onChange={(e) => onModifySource(source.id, { chromaKeySpillValue: Number(e.target.value) })}
                              className="w-full accent-indigo-500 bg-[#0F0E12] h-1 rounded-sm appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DETAILED AUDIO GAIN FILTER PARAMS */}
                  {selectedFilter === 'gain' && (
                    <div className="space-y-4">
                      <div className="bg-[#0F0E12] border border-[#222125] p-3.5 rounded-lg space-y-1">
                        <span className="text-xs font-bold text-zinc-200 block">Filtro de Ganho de Áudio Decibel (Pre-Fader)</span>
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                          Aumenta ou diminui a amplitude de sinal bruto do microfone/mídia antes de ser direcionada ao console ou barramentos do Mixer.
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs text-zinc-300 font-semibold">
                          <span>Ganho do Canal</span>
                          <span className={`font-mono font-bold ${gainDb > 0 ? 'text-emerald-400' : gainDb < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                            {gainDb > 0 ? `+${gainDb.toFixed(1)}` : gainDb.toFixed(1)} dB
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-30"
                          max="30"
                          step="0.5"
                          value={gainDb}
                          onChange={(e) => onModifySource(source.id, { gainDb: parseFloat(e.target.value) })}
                          className="w-full accent-emerald-500 bg-[#0F0E12] h-1.5 rounded-full appearance-none cursor-pointer border border-[#222125]"
                        />
                        <div className="flex justify-between text-[8px] font-mono text-zinc-500 leading-none">
                          <span>-30.0 dB (Mute)</span>
                          <span>0.0 dB (Padrão)</span>
                          <span>+30.0 dB (Alto)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NOISE SUPPRESSION PARAMS */}
                  {selectedFilter === 'noise' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-[#0F0E12] border border-[#222125] p-3.5 rounded-lg">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-zinc-200 block">Redutor de Ruídos Externos Ativo</span>
                          <span className="text-[9.5px] text-zinc-500 font-sans">Atenua sussurros, ventiladores e ruído de hardware portátil</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={noiseSuppressionActive}
                          onChange={(e) => onModifySource(source.id, { noiseSuppression: e.target.checked })}
                          className="accent-teal-500 rounded border-zinc-800 focus:ring-0"
                        />
                      </div>

                      {noiseSuppressionActive && (
                        <div className="pt-2 space-y-3 animate-fadeIn">
                          <label className="text-xs font-semibold text-zinc-300 block">Método de Supressão (Algoritmo CPU)</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => onModifySource(source.id, { noiseSuppressionMethod: 'speex' })}
                              className={`p-3 rounded-lg border text-left flex flex-col justify-between transition ${
                                noiseSuppressionMethod === 'speex'
                                  ? 'border-teal-500 bg-[#0F0E12] text-teal-400'
                                  : 'border-[#222125] bg-[#1C1B1F]/30 text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              <span className="text-xs font-bold block">Speex (Baixo consumo CPU)</span>
                              <span className="text-[9px] text-zinc-500 mt-2">Nível de Supressão Ajustável a -30 dB fixo. Útil para hardware antigo.</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onModifySource(source.id, { noiseSuppressionMethod: 'rnnoise' })}
                              className={`p-3 rounded-lg border text-left flex flex-col justify-between transition ${
                                noiseSuppressionMethod === 'rnnoise'
                                  ? 'border-teal-500 bg-[#0F0E12] text-teal-400'
                                  : 'border-[#222125] bg-[#1C1B1F]/30 text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              <span className="text-xs font-bold block">RNNoise (Rede Neural Artificial)</span>
                              <span className="text-[9px] text-zinc-500 mt-2">Algoritmo inteligente de supressão seletiva de fala com zero perda.</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom control actions (Restore, Reset, Close) */}
        <div className="flex justify-between items-center p-4 bg-[#1C1B1F] border-t border-[#222125] shrink-0">
          <button
            onClick={activeTab === 'properties' ? handleResetSettings : handleResetFilters}
            className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded border border-zinc-800 transition flex items-center gap-1.5 font-semibold cursor-pointer"
            title="Redefinir este bloco de volta aos padrões"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrões
          </button>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-505 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded uppercase tracking-wider transition hover:shadow active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Concluir Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
