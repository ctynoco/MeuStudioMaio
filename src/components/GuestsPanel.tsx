import React, { useState } from 'react';
import { Guest } from '../types';
import { Plus, Mic, MicOff, Video, VideoOff, Wifi, WifiOff, Users, ArrowUpRight, Trash2 } from 'lucide-react';
import MaracanauLogo from './MaracanauLogo';

interface GuestsPanelProps {
  guests: Guest[];
  onToggleVideo: (id: string) => void;
  onToggleAudio: (id: string) => void;
  onAddGuest: (name: string, role: Guest['role']) => void;
  onRemoveGuest: (id: string) => void;
  onInviteLink: () => void;
}

export default function GuestsPanel({
  guests,
  onToggleVideo,
  onToggleAudio,
  onAddGuest,
  onRemoveGuest,
  onInviteLink,
}: GuestsPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestRole, setGuestRole] = useState<Guest['role']>('Convidado');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    onAddGuest(guestName.trim(), guestRole);
    setGuestName('');
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col bg-[#0F0F0F] border-l border-[#1F1F1F] h-full overflow-hidden">
      {/* Header bar matching look in screenshot */}
      <div className="bg-[#141414] border-b border-[#1F1F1F] px-4 py-2 flex justify-between items-center text-xs font-semibold text-zinc-400 uppercase tracking-widest">
        <span>Convidados</span>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="hover:text-indigo-500 text-zinc-500 transition-colors p-0.5 rounded text-xs flex items-center gap-1 font-semibold normal-case cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Convidar
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="p-3 bg-[#141414] border-b border-[#1F1F1F] flex flex-col gap-2">
          <input
            type="text"
            required
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Nome do orador..."
            className="w-full bg-[#0A0A0A] text-white text-xs px-2 py-1.5 rounded border border-[#1F1F1F] focus:outline-none focus:border-indigo-500"
          />
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Papel:</span>
            <select
              value={guestRole}
              onChange={(e) => setGuestRole(e.target.value as any)}
              className="bg-[#0A0A0A] text-white border border-[#1F1F1F] rounded px-1.5 py-0.5 text-[11px]"
            >
              <option value="Convidado">Convidado</option>
              <option value="Apresentador">Apresentador</option>
              <option value="Moderador">Moderador (Presidente)</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end mt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[10px] text-zinc-400 hover:text-white px-2 py-0.5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white font-semibold text-[10px] px-2.5 py-1 rounded transition-all"
            >
              Convidar
            </button>
          </div>
        </form>
      )}

      {/* Double Column Grid, matching original image look exactly */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-2">
          {guests.map((g) => {
            const isOnline = g.status === 'online';
            return (
              <div
                key={g.id}
                className={`relative flex flex-col justify-between aspect-video rounded-lg overflow-hidden border group transition-all ${
                  isOnline
                    ? (g.isSpeaking ? 'bg-emerald-950/20 border-emerald-500' : 'bg-[#141414] border-[#1F1F1F]')
                    : 'bg-[#0A0A0A]/60 border-[#1F1F1F] border-dashed opacity-60'
                }`}
              >
                {/* Visual Thumbnail of avatar or TV logo placeholder */}
                <div className="flex-1 flex items-center justify-center p-2 relative">
                  {isOnline ? (
                    <div className="relative">
                      {/* Avatar from SVG generator API */}
                      <img
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${g.avatarSeed}`}
                        alt={g.name}
                        className={`w-10 h-10 rounded-full bg-[#0A0A0A] border ${
                          g.isSpeaking ? 'border-emerald-400 p-0.5 ring-2 ring-emerald-400/20 shadow-lg' : 'border-[#1F1F1F]'
                        }`}
                        referrerPolicy="no-referrer"
                      />
                      {/* Connection status light */}
                      <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-slate-900 ${
                        g.isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-green-500'
                      }`} />
                    </div>
                  ) : (
                    <MaracanauLogo variant="simple" className="scale-[0.3] -my-4 origin-center opacity-40" />
                  )}

                  {/* Absolute positioning of control pads on Hover */}
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1.5 px-2">
                    {isOnline && (
                      <>
                        <button
                          onClick={() => onToggleAudio(g.id)}
                          className={`p-1 rounded text-white cursor-pointer ${g.audioActive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-650 bg-red-600 hover:bg-red-700'}`}
                          title={g.audioActive ? 'Mutar Microfone' : 'Ativar Microfone'}
                        >
                          {g.audioActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onToggleVideo(g.id)}
                          className={`p-1 rounded text-white cursor-pointer ${g.videoActive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-650 bg-red-600 hover:bg-red-700'}`}
                          title={g.videoActive ? 'Desativar Câmera' : 'Ativar Câmera'}
                        >
                          {g.videoActive ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onRemoveGuest(g.id)}
                      className="p-1 rounded bg-[#1F1F1F] text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remover Participante"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtitle bottom row exactly modeled as 'Ver. 01' */}
                <div className="bg-[#0F0F0F] px-1.5 py-1.5 border-t border-[#1F1F1F] flex justify-between items-center text-[8px] text-zinc-400">
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold truncate uppercase text-zinc-200 leading-tight">{g.name}</span>
                    <span className="text-[7px] text-zinc-500 font-mono tracking-tight leading-none">{g.role}</span>
                  </div>
                  <span className="font-mono text-zinc-600 shrink-0">Ver.01</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invitation Info Box footer */}
      <div className="p-3 bg-[#141414] border-t border-[#1F1F1F] text-[10px] text-zinc-400">
        <div className="flex items-center justify-between font-mono pb-1 border-b border-[#1F1F1F] mb-1.5 text-zinc-200">
          <span>Sala Virtual</span>
          <span>WebRTC-9206</span>
        </div>
        <p className="leading-snug mb-2 select-none text-zinc-400">
          Compartilhe este link com vereadores ou cidadãos para incluí-los na transmissão:
        </p>
        <button
          onClick={onInviteLink}
          className="w-full bg-[#1F1F1F] hover:bg-[#2A2A2A] border border-[#2A2A2A] text-white font-semibold py-1.5 px-2 rounded-full flex items-center justify-center gap-1.5 transition text-[9px] uppercase tracking-wider cursor-pointer font-bold"
        >
          <ArrowUpRight className="w-3 h-3 text-indigo-400 font-bold" />
          Copiar Convite Legislativo
        </button>
      </div>
    </div>
  );
}
