import React, { useState } from 'react';
import { X, Globe, Video, Settings, Sliders, Volume2, Sparkles, HelpCircle } from 'lucide-react';
import { StudioConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StudioConfig;
  onSave: (newConfig: StudioConfig) => void;
}

export default function SettingsModal({ isOpen, onClose, config, onSave }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'stream' | 'video' | 'ticker' | 'audio'>('stream');
  const [streamTitle, setStreamTitle] = useState(config.streamTitle);
  const [streamUrl, setStreamUrl] = useState(config.streamUrl);
  const [streamKey, setStreamKey] = useState(config.streamKey);
  const [bitrate, setBitrate] = useState(config.bitrate);
  const [fps, setFps] = useState(config.fps);
  const [aspectRatio, setAspectRatio] = useState(config.aspectRatio);
  const [tickerText, setTickerText] = useState(config.tickerText);
  const [tickerSpeed, setTickerSpeed] = useState(config.tickerSpeed);
  const [activeBannerText, setActiveBannerText] = useState(config.activeBannerText);
  const [bannerColor, setBannerColor] = useState(config.bannerColor);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...config,
      streamTitle,
      streamUrl,
      streamKey,
      bitrate,
      fps,
      aspectRatio,
      tickerText,
      tickerSpeed,
      activeBannerText,
      bannerColor,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-[#12161A] border border-[#232D37] rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#181F26] border-b border-[#232D37]">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-[#FFAE19]" />
            <h2 className="text-xl font-bold text-white tracking-tight">Configurações do MeuStudio</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Navigation Tabs (Sidebar Layout inside modal) */}
          <div className="w-1/4 bg-[#151B21] border-r border-[#232D37] p-3 flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('stream')}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                activeTab === 'stream'
                  ? 'bg-[#FFAE19] text-[#12161A]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              Transmissão / RTMP
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                activeTab === 'video'
                  ? 'bg-[#FFAE19] text-[#12161A]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              Codificação de Vídeo
            </button>
            <button
              onClick={() => setActiveTab('ticker')}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                activeTab === 'ticker'
                  ? 'bg-[#FFAE19] text-[#12161A]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Letreiro & Banners
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                activeTab === 'audio'
                  ? 'bg-[#FFAE19] text-[#12161A]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              Canais de Áudio
            </button>
            <div className="mt-auto p-2 bg-[#182129] rounded-lg border border-[#232D37]">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-[#FFAE19]" />
                <span className="font-semibold">Servidor Conectado</span>
              </div>
              <p className="text-[10px] text-slate-500 break-all leading-normal">
                https://ais-dev-pvzxa72...
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-[#12161A] text-slate-300">
            {activeTab === 'stream' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-[#232D37]">Serviço de Streaming</h3>
                
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Título da Transmissão</label>
                  <input
                    type="text"
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    className="w-full bg-[#181F26] border border-[#2d3a46] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFAE19]"
                    placeholder="Sessão Plenária Ordinária - Câmara de Maracanaú"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Servidor RTMP (URL)</label>
                    <input
                      type="text"
                      value={streamUrl}
                      onChange={(e) => setStreamUrl(e.target.value)}
                      className="w-full bg-[#181F26] border border-[#2d3a46] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFAE19]"
                      placeholder="rtmp://live.youtube.com/live2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Chave de Transmissão</label>
                    <input
                      type="password"
                      value={streamKey}
                      onChange={(e) => setStreamKey(e.target.value)}
                      className="w-full bg-[#181F26] border border-[#2d3a46] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFAE19]"
                      placeholder="•••••••••••••••••••••"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-950/30 border border-blue-900/50 rounded-lg text-xs leading-relaxed text-sky-200">
                  <p className="font-semibold mb-1">Dica Integrada:</p>
                  Configure a URL do servidor e sua chave de transmissão para direcionar a transmissão final do MeuStudio diretamente para o YouTube, Facebook Live, Restream ou servidores RTMP locais em sua rede legislativa.
                </div>
              </div>
            )}

            {activeTab === 'video' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-[#232D37]">Configurações da Saída de Vídeo</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Bitrate de Vídeo (Kbps)</label>
                    <select
                      value={bitrate}
                      onChange={(e) => setBitrate(Number(e.target.value))}
                      className="w-full bg-[#181F26] border border-[#2d3a46] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFAE19]"
                    >
                      <option value={2500}>2500 Kbps (720p - Recomendado)</option>
                      <option value={4500}>4500 Kbps (1080p Standard)</option>
                      <option value={6000}>6000 Kbps (1080p High Quality)</option>
                      <option value={9000}>9000 Kbps (High Dynamic Range)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">FPS (Quadros por Segundo)</label>
                    <select
                      value={fps}
                      onChange={(e) => setFps(Number(e.target.value))}
                      className="w-full bg-[#181F26] border border-[#2d3a46] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFAE19]"
                    >
                      <option value={30}>30 FPS (Padrão de TV)</option>
                      <option value={60}>60 FPS (Transmissão Fluida)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Modo de Visualização</label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value as any)}
                      className="w-full bg-[#181F26] border border-[#2d3a46] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFAE19]"
                    >
                      <option value="both">Duplo Monitor (16:9 + Vertical 9:16)</option>
                      <option value="16:9">Apenas Horizontal (16:9)</option>
                      <option value="9:16">Apenas Vertical (9:16)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <span className="text-xs font-semibold block text-slate-400 mb-1">Informações de Saída Codificada Múltipla</span>
                  <p className="text-xs text-slate-500 leading-normal">
                    Este estúdio processa simultaneamente duas saídas de renderização física. A saída horizontal de <strong className="text-xs text-[#FFAE19]">1920X1080</strong> para canais oficiais ou TVs fechadas e a saída inteligente vertical de <strong className="text-xs text-[#FFAE19]">1080X1920</strong> ideal para transmissões voltadas ao canais do TikTok e Instagram Reels.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'ticker' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-[#232D37]">Gerenciar Letreiro Rotativo & Banners</h3>
                
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Texto do Letreiro (Ticker Linha Direta)</label>
                  <textarea
                    rows={2}
                    value={tickerText}
                    onChange={(e) => setTickerText(e.target.value)}
                    className="w-full bg-[#181F26] border border-[#2d3a46] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFAE19]"
                    placeholder="Escreva as notícias, pauta da sessão ou avisos importantes que correrão na barra inferior..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 font-sans">Velocidade da Rolagem (s por ciclo)</label>
                    <input
                      type="number"
                      value={tickerSpeed}
                      onChange={(e) => setTickerSpeed(Number(e.target.value))}
                      className="w-full bg-[#181F26] border border-[#2d3a46] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFAE19]"
                      min="1"
                      max="60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Aviso / Banner Superior</label>
                    <input
                      type="text"
                      value={activeBannerText}
                      onChange={(e) => setActiveBannerText(e.target.value)}
                      className="w-full bg-[#181F26] border border-[#2d3a46] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFAE19]"
                      placeholder="REUNIÃO ORDINÁRIA"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Cor Temática de Letreiros</label>
                  <div className="flex gap-2">
                    {['#0b4e80', '#059669', '#dc2626', '#d97706', '#1e1b4b', '#111827'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setBannerColor(color)}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          bannerColor === color ? 'border-[#FFAE19] scale-110' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-[#232D37]">Configurações Físicas de Áudio</h3>
                <div className="space-y-4 text-xs text-slate-400 leading-normal">
                  <p>
                    O sistema de áudio opera com processamento de DSP de baixa latência. Cada canal possui suporte a compressão, equalização e controle dinâmico que pode ser integrado diretamente à sua mesa de som ou conexões virtuais.
                  </p>
                  
                  <div className="bg-[#151B21] border border-[#232D37] rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center text-white pb-1.5 border-b border-[#232D37]">
                      <span className="font-semibold">Mapeamento de Hardware</span>
                      <span className="text-[#FFAE19]">Ativo</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mesa de Som Master</span>
                      <span className="text-slate-300 font-mono">USB Audio CODEC ASIO</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Canais Virtuais de Convidados</span>
                      <span className="text-slate-300 font-mono">WebRTC AutoMix 48kHz</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delay de Sincronia de Vídeo</span>
                      <span className="text-emerald-400 font-mono">0ms (Alinhamento Automático)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 p-4 bg-[#181F26] border-t border-[#232D37]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-transparent text-slate-300 hover:text-white rounded-lg text-sm font-semibold hover:bg-white/5 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#FFAE19] hover:bg-[#e09812] text-[#12161A] font-bold rounded-lg text-sm transition-all"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
