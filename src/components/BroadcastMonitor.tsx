import React, { useEffect, useRef, useState } from 'react';
import { StudioConfig, Source, Scene, Guest } from '../types';
import MaracanauLogo from './MaracanauLogo';
import { Play, Square, VideoOff, Wifi, Clock, MessageSquare, Flame } from 'lucide-react';

interface BroadcastMonitorProps {
  config: StudioConfig;
  activeScene: Scene;
  sources: Source[];
  guests: Guest[];
  isStreaming: boolean;
  isRecording: boolean;
  onToggleStream: () => void;
  onToggleRecord: () => void;
}

export default function BroadcastMonitor({
  config,
  activeScene,
  sources,
  guests,
  isStreaming,
  isRecording,
  onToggleStream,
  onToggleRecord,
}: BroadcastMonitorProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamTime, setStreamTime] = useState('00:00:00');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const secondsRef = useRef(0);

  // Monitor statistics
  const [droppedFrames, setDroppedFrames] = useState(0);
  const [kbps, setKbps] = useState(config.bitrate);

  // Manage WebRTC Webcam Feed
  useEffect(() => {
    // Check if webcam source is active is selected or required
    const webcamSource = sources.find(s => s.type === 'webcam' && s.visible);
    if (webcamSource) {
      navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true })
        .then((stream) => {
          setHasCameraPermission(true);
          setMediaStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Webcam feed access failed/denied:', err);
          setHasCameraPermission(false);
        });
    } else {
      // Clean up webcam track if turned off
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [sources]);

  // Sync Video Object Src if media stream changes
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  // Broadcast timer counter
  useEffect(() => {
    if (isStreaming) {
      secondsRef.current = 0;
      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        const hrs = String(Math.floor(secondsRef.current / 3600)).padStart(2, '0');
        const mins = String(Math.floor((secondsRef.current % 3600) / 60)).padStart(2, '0');
        const secs = String(secondsRef.current % 60).padStart(2, '0');
        setStreamTime(`${hrs}:${mins}:${secs}`);

        // Add some random stats fluctuations
        if (Math.random() > 0.8) {
          setDroppedFrames(prev => prev + Math.floor(Math.random() * 2));
        }
        setKbps(config.bitrate + Math.floor((Math.random() - 0.5) * 50));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setStreamTime('00:00:00');
      setDroppedFrames(0);
      setKbps(config.bitrate);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStreaming, config.bitrate]);

  // Active sources
  const visibleSources = sources.filter(s => s.visible);
  const showLogoSource = visibleSources.some(s => s.type === 'image' && s.name.toLowerCase().includes('logo'));
  const showWebcamSource = visibleSources.some(s => s.type === 'webcam');
  const showVideoSource = visibleSources.some(s => s.type === 'video');
  const showScreenSource = visibleSources.some(s => s.type === 'screen');

  // Render video preview mockup or real webcam stream
  const renderCompositeContent = (isVertical: boolean = false) => {
    // If layout is focused layout, render the prominent camera or speaker
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-radial from-[#153457] to-[#0a1829] overflow-hidden">
        {/* Animated Background Gradients or patterns for premium feel */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-sky-450/10 to-transparent pointer-events-none" />
        
        {/* Real Live Local WebRTC Stream rendering */}
        {showWebcamSource && hasCameraPermission && mediaStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute w-full h-full object-cover transition-all duration-300`}
            style={{ opacity: sources.find(s => s.type === 'webcam')?.opacity ?? 1 }}
          />
        ) : showWebcamSource ? (
          /* High-Fidelity Mock webcam standby visual */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 border-2 border-dashed border-sky-450/40 m-4 rounded-xl">
            <VideoOff className="w-10 h-10 text-slate-500 mb-2 animate-bounce" />
            <p className="text-xs font-semibold text-slate-300">Aguardando Webcam do Transmissor</p>
            <p className="text-[10px] text-slate-500 max-w-xs text-center mt-1">
              Ative a fonte "Câmera Local" e conceda as permissões de vídeo para renderização em tempo real.
            </p>
          </div>
        ) : null}

        {/* Video Clipe source mockup */}
        {showVideoSource && !showWebcamSource && (
          <div className="absolute inset-0 bg-[#0c1015] flex flex-col justify-center items-center">
            {/* Spinning radar track or mock play screen */}
            <div className="relative w-28 h-28 flex items-center justify-center rounded-full border border-sky-500/20">
              <div className="absolute inset-2 border-2 border-[#FFAE19]/30 rounded-full animate-ping" />
              <div className="absolute inset-4 border border-dashed border-sky-400/40 rounded-full animate-spin [animation-duration:10s]" />
              <FilmCoverArt />
            </div>
            <p className="text-xs font-bold text-slate-300 mt-3 uppercase tracking-wider animate-pulse">Vídeo Clipe Legislativo Ativo</p>
          </div>
        )}

        {/* Screenshare source mockup */}
        {showScreenSource && (
          <div className="absolute inset-6 bg-indigo-950/40 border border-indigo-700/50 rounded-lg p-3 flex flex-col justify-between">
            <div className="flex justify-between items-center bg-[#151b22] px-2 py-1 rounded">
              <span className="text-[10px] font-mono font-semibold text-emerald-400">PARECER_PROJETO_LEI_402.PDF</span>
              <span className="text-[9px] bg-indigo-900 text-indigo-200 px-1.5 rounded uppercase font-bold">Compartilhado</span>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-1.5 p-2 text-slate-300">
              <div className="h-2 w-3/4 bg-slate-700 rounded-sm" />
              <div className="h-2 w-1/2 bg-slate-700 rounded-sm" />
              <div className="h-2 w-5/6 bg-slate-700 rounded-sm" />
              <div className="h-2 w-2/3 bg-slate-700 rounded-sm" />
            </div>
            <div className="text-[9px] text-slate-500 text-right">Slide 03 de 12</div>
          </div>
        )}

        {/* Guest Speaker grid for layout splits */}
        {activeScene.layoutType === 'grid' && guests.filter(g => g.status === 'online').length > 0 && (
          <div className="absolute inset-0 p-4 grid grid-cols-2 gap-3 bg-black/60 backdrop-blur-[2px]">
            {guests.filter(g => g.status === 'online').slice(0, 4).map((g) => (
              <div key={g.id} className="relative bg-[#182129]/80 border border-sky-500/30 rounded-lg overflow-hidden flex flex-col justify-center items-center">
                <div className={`w-12 h-12 rounded-full bg-[#12161a] border-2 flex items-center justify-center overflow-hidden ${
                  g.isSpeaking ? 'border-emerald-400 scale-105 ring-4 ring-emerald-500/20' : 'border-[#2d3a46]'
                }`}>
                  <img
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${g.avatarSeed}`}
                    alt={g.name}
                    className="w-10 h-10"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute bottom-1.5 left-2 right-2 flex justify-between items-center text-[9px] bg-black/50 px-2 py-1 rounded">
                  <span className="truncate font-semibold text-white">{g.name}</span>
                  <span className={`${g.isSpeaking ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    {g.isSpeaking ? 'FALANDO' : 'MIC'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Render Primary Logo "tv Câmara de Maracanaú" as requested by image */}
        {showLogoSource && (
          <MaracanauLogo
            variant={isVertical ? 'simple' : 'full'}
            animated={isStreaming}
            className={`transition-all duration-500 ${isVertical ? 'scale-75' : 'scale-90 md:scale-100'}`}
          />
        )}

        {/* Lower Thirds graphic overlay details exactly like professional streams */}
        {config.activeBannerText && (
          <div className="absolute left-6 bottom-16 bg-gradient-to-r from-red-600 to-red-800 text-white font-extrabold px-3 py-1 rounded text-xs select-none shadow-md uppercase tracking-wider flex items-center gap-1.5 animate-bounce">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
            {config.activeBannerText}
          </div>
        )}

        {/* Subtle curve block at the bottom of the logo, exactly modeled after the screenshot */}
        {!isVertical && (
          <div className="absolute bottom-0 w-3/5 h-20 bg-gradient-to-t from-[#154a7c]/20 to-transparent flex items-end justify-center pb-2 pointer-events-none rounded-t-full">
            <div className="h-0.5 w-2/3 bg-slate-500/30 rounded" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 p-4 bg-[#0A0A0A] overflow-y-auto">
      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#0F0F0F] border border-[#1F1F1F] rounded-xl px-5 py-4 mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Status de transmissão</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`h-2.5 w-2.5 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`} />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              {isStreaming ? 'AO VIVO / NO AR' : 'STANDBY'}
            </h3>
            {isStreaming && (
              <span className="text-[10px] bg-red-950 border border-red-800/40 text-red-400 font-mono px-1.5 py-0.5 rounded ml-1 animate-pulse">
                RTMP CONECTADO
              </span>
            )}
          </div>
        </div>

        {/* Statistics Widgets */}
        <div className="flex gap-4 items-center">
          {isStreaming && (
            <div className="flex gap-4 text-xs select-none border-r border-[#1F1F1F] pr-4">
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-zinc-500 font-semibold uppercase">TEMPO</span>
                <span className="font-mono font-semibold text-indigo-400 text-sm">{streamTime}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-zinc-500 font-semibold uppercase">RENDER</span>
                <span className="font-mono text-[#E5E7EB]">60.0 fps</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-zinc-500 font-semibold uppercase">FPS DROP</span>
                <span className="font-mono text-red-500 font-semibold">{droppedFrames}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-zinc-500 font-semibold uppercase">UPLOAD</span>
                <span className="font-mono text-emerald-500 font-semibold">{(kbps / 1000).toFixed(1)} Mbps</span>
              </div>
            </div>
          )}

          {/* Action Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onToggleStream}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                isStreaming
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/10'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isStreaming ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-white text-white" />
                  PARAR STREAM
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                  INICIAR STREAM
                </>
              )}
            </button>

            <button
              onClick={onToggleRecord}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                isRecording
                  ? 'border-red-500 bg-red-950/20 text-red-400'
                  : 'border-[#1F1F1F] bg-[#141414] text-zinc-300 hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-zinc-500'}`} />
              {isRecording ? 'GRAVANDO' : 'GRAVAR LOCAL'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Double Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
        
        {/* LANDSCAPE PREVIEW (1920X1080) - Takes 3 Cols */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="relative aspect-video w-full bg-[#0F0F0F] rounded-xl overflow-hidden border border-[#1F1F1F] group shadow-xl">
            {compositeWatermark('1920X1080')}
            {renderCompositeContent(false)}

            {/* Scrolling News Ticker at bottom, exactly modeled after real broadcast TV */}
            <div
              className="absolute bottom-0 inset-x-0 h-10 flex items-center overflow-hidden border-t border-[#ffffff10] shadow-inner select-none"
              style={{ backgroundColor: config.bannerColor }}
            >
              <div className="relative h-full flex items-center bg-indigo-600 px-4 font-bold text-xs text-white tracking-wide uppercase shadow-lg z-10">
                <Wifi className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline ml-1.5">BOLETIM AO VIVO</span>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <div
                  className="absolute whitespace-nowrap text-xs font-medium text-white flex items-center gap-16 py-1 pr-10 animate-marquee"
                  style={{ animationDuration: `${config.tickerSpeed}s` }}
                >
                  <p>{config.tickerText}</p>
                  <p className="opacity-70">•</p>
                  <p className="text-zinc-200">Câmara Municipal de Maracanaú — Transmitindo com transparência legislativa e cidadania.</p>
                  <p className="opacity-70">•</p>
                  <p>{config.tickerText}</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono mt-1 px-1">
            Visualizador Master (Broadcast Padrão - 1920X1080) • Layout: {activeScene.layoutType.toUpperCase()}
          </p>
        </div>

        {/* PORTRAIT PREVIEW (1080X1920) - Takes 1 Col */}
        <div className="flex flex-col">
          <div className="relative aspect-[9/16] w-full bg-[#0F0F0F] rounded-xl overflow-hidden border border-[#1F1F1F] group shadow-xl">
            {compositeWatermark('1080X1920')}
            {renderCompositeContent(true)}

            {/* Vertical custom overlay (Shorts format) */}
            <div className="absolute bottom-4 left-3 right-3 bg-black/75 border border-white/10 p-2.5 rounded-lg text-[10px] text-zinc-300">
              <span className="font-semibold text-indigo-400 flex items-center gap-1 uppercase tracking-wider">
                <Flame className="w-3 h-3 text-indigo-450" />
                Câmara de Maracanaú
              </span>
              <p className="mt-1 line-clamp-2 leading-snug">
                Sessão ordinária ao vivo. Formato otimizado de curto alcance (Reels/TikTok).
              </p>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono mt-1 px-1">
            Visualizador Vertical Mobile (1080X1920, 9:16)
          </p>
        </div>

      </div>
    </div>
  );
}

function compositeWatermark(resolution: string) {
  return (
    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono font-bold text-[#E5E7EB] pointer-events-none z-20 select-none border border-[#1F1F1F] uppercase tracking-wide">
      {resolution}
    </div>
  );
}

function FilmCoverArt() {
  return (
    <svg viewBox="0 0 100 100" className="w-12 h-12 text-indigo-500">
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M 40 33 L 70 50 L 40 67 Z" fill="currentColor" />
    </svg>
  );
}
