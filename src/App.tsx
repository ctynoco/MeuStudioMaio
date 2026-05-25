import React, { useState, useEffect } from 'react';
import { StudioConfig, Scene, Source, Guest, AudioChannel } from './types';
import MaracanauLogo from './components/MaracanauLogo';
import SettingsModal from './components/SettingsModal';
import ScenesPanel from './components/ScenesPanel';
import SourcesPanel from './components/SourcesPanel';
import BroadcastMonitor from './components/BroadcastMonitor';
import QuickFeeds from './components/QuickFeeds';
import GuestsPanel from './components/GuestsPanel';
import AudioMixer from './components/AudioMixer';
import { Settings, HelpCircle, Activity, ShieldCheck, Share2, Sparkles, LogOut, CheckCircle, AlertCircle } from 'lucide-react';

export default function App() {
  // 1. Core Config state
  const [config, setConfig] = useState<StudioConfig>({
    streamTitle: 'Sessão Plenária Ordinária',
    streamUrl: 'rtmp://live.youtube.com/live2',
    streamKey: 'x9s2-f6k1-w7e5-p2v9',
    bitrate: 4500,
    fps: 60,
    aspectRatio: 'both',
    tickerText: 'PAUTA DO DIA: Discussão e votação do Projeto de Lei Nº 402/2026 sobre mobilidade urbana sustentável • Pareceres das comissões técnicas aprovados por unanimidade • Canal direto com o cidadão de Maracanaú.',
    tickerSpeed: 20,
    logoText: 'tv Câmara de Maracanaú',
    activeBannerText: 'REUNIÃO ORDINÁRIA',
    bannerColor: '#0b4e80',
  });

  // 2. State for Scenes
  const [scenes, setScenes] = useState<Scene[]>([
    { id: 'sc_tv', name: 'Câmara Transmissão', sources: ['src_logo', 'src_ticker'], layoutType: 'focused' },
    { id: 'sc_split', name: 'Slide Dividido', sources: ['src_logo', 'src_share', 'src_ticker'], layoutType: 'split' },
    { id: 'sc_grid', name: 'Oradores Grelha', sources: ['src_webcam', 'src_ticker'], layoutType: 'grid' },
    { id: 'sc_video', name: 'Canal de Video', sources: ['src_video', 'src_ticker'], layoutType: 'focused' },
  ]);
  const [activeSceneId, setActiveSceneId] = useState<string>('sc_tv');

  // 3. State for Sources
  const [sources, setSources] = useState<Source[]>([
    { id: 'src_logo', name: 'Logo Oficial', type: 'image', visible: true, opacity: 1.0, scale: 1.0, position: { x: 0, y: 0 }, volume: 0, muted: true },
    { id: 'src_webcam', name: 'Câmera Local', type: 'webcam', visible: false, opacity: 1.0, scale: 1.0, position: { x: 0, y: 0 }, volume: 100, muted: false },
    { id: 'src_video', name: 'Vídeo Clipe', type: 'video', visible: false, opacity: 1.0, scale: 1.0, position: { x: 0, y: 0 }, volume: 80, muted: false },
    { id: 'src_share', name: 'Compart. Tela', type: 'screen', visible: false, opacity: 1.0, scale: 1.0, position: { x: 0, y: 0 }, volume: 0, muted: true },
  ]);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>('src_logo');

  // 4. State for Guests (Convidados)
  const [guests, setGuests] = useState<Guest[]>([
    { id: 'gst_1', name: 'Ver. José Silva', status: 'online', role: 'Moderador', videoActive: true, audioActive: true, volume: 85, avatarSeed: 'jose', isSpeaking: true },
    { id: 'gst_2', name: 'Dra. Ana Costa', status: 'online', role: 'Convidado', videoActive: true, audioActive: true, volume: 90, avatarSeed: 'ana', isSpeaking: false },
    { id: 'gst_3', name: 'Ver. Paulo Lima', status: 'online', role: 'Convidado', videoActive: true, audioActive: false, volume: 80, avatarSeed: 'paulo', isSpeaking: false },
    { id: 'gst_4', name: 'Sec. Maria Santos', status: 'online', role: 'Convidado', videoActive: true, audioActive: true, volume: 85, avatarSeed: 'maria', isSpeaking: false },
    { id: 'gst_5', name: 'Dr. Roberto Cruz', status: 'connecting', role: 'Convidado', videoActive: false, audioActive: false, volume: 0, avatarSeed: 'roberto', isSpeaking: false },
    { id: 'gst_6', name: 'Eng. Carla Dias', status: 'offline', role: 'Convidado', videoActive: false, audioActive: false, volume: 0, avatarSeed: 'carla', isSpeaking: false },
  ]);

  // 5. State for Audio Channels (matching screenshot's letters)
  const [audioChannels, setAudioChannels] = useState<AudioChannel[]>([
    { id: 'master', label: 'MASTER', type: 'master', volume: 85, muted: false, solo: false, routedToMaster: true, routedToA: true, routedToB: false, meterLevel: 0, peakValue: 0, compression: 15, bass: 0, mids: 0, treble: 0 },
    { id: 'chan_a', label: 'A', type: 'input', volume: 90, muted: false, solo: false, routedToMaster: true, routedToA: true, routedToB: false, meterLevel: 0, peakValue: 0, compression: 25, bass: 2, mids: -1, treble: 3 },
    { id: 'chan_b', label: 'B', type: 'guest', volume: 80, muted: false, solo: false, routedToMaster: true, routedToA: true, routedToB: true, meterLevel: 0, peakValue: 0, compression: 30, bass: 4, mids: 1, treble: -2 },
    { id: 'chan_c', label: 'C', type: 'input', volume: 75, muted: false, solo: false, routedToMaster: true, routedToA: false, routedToB: false, meterLevel: 0, peakValue: 0, compression: 0, bass: 0, mids: 0, treble: 0 },
    { id: 'chan_d', label: 'D', type: 'input', volume: 0, muted: true, solo: false, routedToMaster: false, routedToA: false, routedToB: false, meterLevel: 0, peakValue: 0, compression: 0, bass: 0, mids: 0, treble: 0 },
    { id: 'chan_e', label: 'E', type: 'input', volume: 50, muted: false, solo: false, routedToMaster: true, routedToA: false, routedToB: true, meterLevel: 0, peakValue: 0, compression: 20, bass: -2, mids: 3, treble: 1 },
    { id: 'chan_f', label: 'F', type: 'input', volume: 0, muted: true, solo: false, routedToMaster: false, routedToA: false, routedToB: false, meterLevel: 0, peakValue: 0, compression: 0, bass: 0, mids: 0, treble: 0 },
  ]);

  // 6. Streaming or Record status
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 7. Toast Alerts state
  const [toasts, setToasts] = useState<{ id: string; type: 'success' | 'info' | 'warn'; message: string }[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Run dynamic debate switcher logic (alternates active speaker randomly to simulate a real broadcast session)
  useEffect(() => {
    const speechRouter = setInterval(() => {
      const activeAttendees = guests.filter((g) => g.status === 'online' && g.audioActive);
      if (activeAttendees.length === 0) return;

      const speakerIndex = Math.floor(Math.random() * activeAttendees.length);
      const chosenSpeakerId = activeAttendees[speakerIndex].id;

      setGuests((prev) =>
        prev.map((g) => ({
          ...g,
          isSpeaking: g.id === chosenSpeakerId && Math.random() > 0.25,
        }))
      );
    }, 4500);

    return () => clearInterval(speechRouter);
  }, [guests]);

  // Interactive callbacks
  const handleSelectScene = (sceneId: string) => {
    setActiveSceneId(sceneId);
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) return;

    // Apply sources preset based on the scene to update composite monitor
    setSources((prev) =>
      prev.map((source) => {
        const isLogo = source.id === 'src_logo';
        const isTicker = source.id === 'src_ticker';
        
        if (scene.layoutType === 'grid') {
          return { ...source, visible: source.id === 'src_webcam' };
        } else if (scene.layoutType === 'split') {
          return { ...source, visible: source.id === 'src_share' || source.id === 'src_logo' };
        } else if (sceneId === 'sc_video') {
          return { ...source, visible: source.id === 'src_video' };
        }
        
        // Default focused fallback
        return { ...source, visible: isLogo || isTicker };
      })
    );
    addToast(`Cena alterada para: ${scene.name}`, 'info');
  };

  const handleCreateScene = (name: string, layout: any) => {
    const newId = `sc_${Date.now()}`;
    setScenes((prev) => [...prev, { id: newId, name, sources: [], layoutType: layout }]);
    addToast(`Cena "${name}" criada com sucesso!`, 'success');
  };

  const handleDeleteScene = (id: string) => {
    setScenes((prev) => prev.filter((s) => s.id !== id));
    if (activeSceneId === id) {
      setActiveSceneId(scenes[0]?.id || 'sc_tv');
    }
    addToast('Cena removida da grade do estúdio.', 'info');
  };

  const handleToggleSourceVisibility = (id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  };

  const handleModifySource = (id: string, updates: Partial<Source>) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleAddSource = (name: string, type: Source['type']) => {
    const newId = `src_${Date.now()}`;
    setSources((prev) => [
      ...prev,
      {
        id: newId,
        name,
        type,
        visible: true,
        opacity: 1.0,
        scale: 1.0,
        position: { x: 0, y: 0 },
        volume: 80,
        muted: false,
      },
    ]);
    addToast(`Nova fonte de mídia "${name}" acoplada!`, 'success');
  };

  const handleDeleteSource = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
    if (selectedSourceId === id) setSelectedSourceId(null);
    addToast('Fonte de mídia desconectada do canal.', 'warn');
  };

  const handleMoveSource = (id: string, direction: 'up' | 'down') => {
    setSources((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      
      const newIndex = direction === 'up' ? idx - 1 : idx + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const updated = [...prev];
      const temp = updated[idx];
      updated[idx] = updated[newIndex];
      updated[newIndex] = temp;
      return updated;
    });
  };

  // Audio Mixer modifiers
  const handleVolumeChange = (id: string, volume: number) => {
    setAudioChannels((prev) =>
      prev.map((chan) => (chan.id === id ? { ...chan, volume, muted: volume === 0 } : chan))
    );
  };

  const handleCompressionChange = (id: string, compression: number) => {
    setAudioChannels((prev) =>
      prev.map((chan) => (chan.id === id ? { ...chan, compression } : chan))
    );
  };

  const handleEqChange = (id: string, bands: { bass?: number; mids?: number; treble?: number }) => {
    setAudioChannels((prev) =>
      prev.map((chan) => {
        if (chan.id === id) {
          return {
            ...chan,
            bass: bands.bass !== undefined ? bands.bass : chan.bass ?? 0,
            mids: bands.mids !== undefined ? bands.mids : chan.mids ?? 0,
            treble: bands.treble !== undefined ? bands.treble : chan.treble ?? 0,
          };
        }
        return chan;
      })
    );
  };

  const handleToggleMute = (id: string) => {
    setAudioChannels((prev) =>
      prev.map((chan) => (chan.id === id ? { ...chan, muted: !chan.muted } : chan))
    );
  };

  const handleToggleSolo = (id: string) => {
    setAudioChannels((prev) =>
      prev.map((chan) => (chan.id === id ? { ...chan, solo: !chan.solo } : chan))
    );
  };

  const handleToggleRouting = (id: string, bus: 'M' | 'A' | 'B') => {
    setAudioChannels((prev) =>
      prev.map((chan) => {
        if (chan.id === id) {
          if (bus === 'M') return { ...chan, routedToMaster: !chan.routedToMaster };
          if (bus === 'A') return { ...chan, routedToA: !chan.routedToA };
          if (bus === 'B') return { ...chan, routedToB: !chan.routedToB };
        }
        return chan;
      })
    );
  };

  // Guest actions
  const handleToggleGuestVideo = (id: string) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, videoActive: !g.videoActive } : g))
    );
  };

  const handleToggleGuestAudio = (id: string) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, audioActive: !g.audioActive } : g))
    );
  };

  const handleAddGuest = (name: string, role: Guest['role']) => {
    const newId = `gst_${Date.now()}`;
    const avatarSeed = `guest_${Math.floor(Math.random() * 100)}`;
    setGuests((prev) => [
      ...prev,
      {
        id: newId,
        name,
        role,
        status: 'online',
        videoActive: true,
        audioActive: true,
        volume: 85,
        avatarSeed,
        isSpeaking: false,
      },
    ]);
    addToast(`${role} ${name} conectou-se à sala WebRTC.`, 'success');
  };

  const handleRemoveGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
    addToast('Participante excluído do barramento de convidados.', 'warn');
  };

  const handleCopyInviteLink = () => {
    const textToCopy = `Participe da transmissão legislativa do MeuStudio como convidado: https://ais-pre-pvzxa72nupvp7pjyc4aatd-92060252173.us-east1.run.app/join?room=WebRTC-9206`;
    navigator.clipboard.writeText(textToCopy);
    addToast('Link WebRTC copiado para a área de transferência!', 'success');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5E7EB] flex flex-col font-sans select-none overflow-hidden">
      
      {/* 1. Header Bar Area (Highly Customized to represent Elegant Dark design theme) */}
      <header className="bg-[#0A0A0A] border-b border-[#1F1F1F] px-6 py-2.5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-6 w-full">
          {/* Main customized Title matching Elegant Dark styling with indigo rotated logo */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <div className="w-3.5 h-3.5 bg-white rounded-sm rotate-45"></div>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white select-none leading-none py-1.5 transition-transform cursor-pointer">
              MeuStudio
            </h1>
          </div>

          {/* Central Connecting horizontal line detail mimic screenshot layout */}
          <div className="flex-1 hidden md:block h-[1px] bg-[#1F1F1F] mx-4" />
        </div>

        {/* Configurations selector click anchor on right */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1F1F1F] bg-[#141414] hover:bg-indigo-600 hover:border-indigo-600 hover:text-white font-semibold text-xs uppercase tracking-wider text-zinc-400 transition-all shadow-sm select-none"
          >
            <Settings className="w-3.5 h-3.5 animate-spin [animation-duration:12s]" />
            Configurações
          </button>
        </div>
      </header>

      {/* 2. Main Studio workspace grid split */}
      <main className="flex-1 flex flex-col xl:flex-row overflow-hidden min-h-0">
        
        {/* Left Side menu stack (CENAS + FONTES) */}
        <section className="w-full xl:w-56 flex flex-col shrink-0 border-r border-[#1F1F1F] bg-[#0F0F0F]">
          {/* Scenes panel block */}
          <div className="h-1/2 border-b border-[#1F1F1F]">
            <ScenesPanel
              scenes={scenes}
              activeSceneId={activeSceneId}
              onSelectScene={handleSelectScene}
              onCreateScene={handleCreateScene}
              onDeleteScene={handleDeleteScene}
            />
          </div>
          {/* Sources panel block */}
          <div className="h-1/2 bg-[#0F0F0F]">
            <SourcesPanel
              sources={sources}
              onToggleVisibility={handleToggleSourceVisibility}
              onModifySource={handleModifySource}
              onAddSource={handleAddSource}
              onDeleteSource={handleDeleteSource}
              onMoveSource={handleMoveSource}
            />
          </div>
        </section>

        {/* Center Live monitors screen + Quick feeds switcher row */}
        <section className="flex-1 flex flex-col min-h-0 bg-[#0A0A0A]">
          <div className="flex-1 flex flex-col">
            <BroadcastMonitor
              config={config}
              activeScene={scenes.find((s) => s.id === activeSceneId) || scenes[0]}
              sources={sources}
              guests={guests}
              isStreaming={isStreaming}
              isRecording={isRecording}
              onToggleStream={() => {
                setIsStreaming(!isStreaming);
                addToast(isStreaming ? 'Transmissão finalizada.' : 'Conectando ao servidor RTMP... Transmissão INICIADA!', isStreaming ? 'warn' : 'success');
              }}
              onToggleRecord={() => {
                setIsRecording(!isRecording);
                addToast(isRecording ? 'Gravação salva na pasta do estúdio.' : 'Gravação local iniciada.', isRecording ? 'info' : 'success');
              }}
            />
          </div>

          {/* Quick inputs mini display array */}
          <QuickFeeds
            sources={sources}
            activeSourceId={selectedSourceId}
            onSelectFeed={(id) => {
              setSelectedSourceId(id);
              addToast(`Canal ${sources.find((s) => s.id === id)?.name} selecionado para monitoramento.`, 'info');
            }}
            onQuickToggle={handleToggleSourceVisibility}
          />
        </section>

        {/* Right side remote WebRTC grid column ("CONVIDADOS") */}
        <section className="w-full xl:w-64 flex flex-col border-l border-[#1F1F1F] bg-[#0F0F0F] shrink-0">
          <GuestsPanel
            guests={guests}
            onToggleVideo={handleToggleGuestVideo}
            onToggleAudio={handleToggleGuestAudio}
            onAddGuest={handleAddGuest}
            onRemoveGuest={handleRemoveGuest}
            onInviteLink={handleCopyInviteLink}
          />
        </section>

      </main>

      {/* 3. Audio mixer footboard controls (replicating vMix board in picture bottom) */}
      <footer className="shrink-0">
        <AudioMixer
          channels={audioChannels}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          onToggleSolo={handleToggleSolo}
          onToggleRouting={handleToggleRouting}
          onCompressionChange={handleCompressionChange}
          onEqChange={handleEqChange}
        />
      </footer>

      {/* Settings Dialog Overlay Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={(newConf) => {
          setConfig(newConf);
          addToast('Configurações salvas e aplicadas aos servidores!', 'success');
        }}
      />

      {/* Sliding Toasts Banners container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border text-xs font-semibold animate-slide-in select-none ${
              t.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200'
                : t.type === 'warn'
                ? 'bg-red-950/95 border-red-500/50 text-red-200'
                : 'bg-zinc-900/95 border-sky-500/50 text-sky-200'
            }`}
          >
            {t.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : t.type === 'warn' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <Activity className="w-4 h-4 text-sky-400 shrink-0" />
            )}
            <p className="flex-1 leading-snug">{t.message}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
