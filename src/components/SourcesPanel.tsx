import React, { useState } from 'react';
import { Source } from '../types';
import { Plus, Eye, EyeOff, Film, Camera, Image, FileText, Palette, Trash2, Sliders, Mic, Gamepad2, Monitor, Volume2, Radio, Music, Layers, Play, Globe, Type, Lock, Unlock, ArrowUp, ArrowDown, Settings } from 'lucide-react';
import SourcePropertiesModal from './SourcePropertiesModal';

interface SourcesPanelProps {
  sources: Source[];
  onToggleVisibility: (id: string) => void;
  onModifySource: (id: string, updates: Partial<Source>) => void;
  onAddSource: (name: string, type: Source['type'], additional?: any) => void;
  onDeleteSource: (id: string) => void;
  onMoveSource?: (id: string, direction: 'up' | 'down') => void;
}

export default function SourcesPanel({
  sources,
  onToggleVisibility,
  onModifySource,
  onAddSource,
  onDeleteSource,
  onMoveSource,
}: SourcesPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState<Source['type']>('image');
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;
    onAddSource(newSourceName.trim(), newSourceType);
    setNewSourceName('');
    setIsAdding(false);
  };

  const getSourceIcon = (type: Source['type']) => {
    switch (type) {
      case 'webcam': return <Camera className="w-4 h-4 text-emerald-400" />;
      case 'video': return <Film className="w-4 h-4 text-sky-400" />;
      case 'image': return <Image className="w-4 h-4 text-amber-500" />;
      case 'screen': return <FileText className="w-4 h-4 text-purple-400" />;
      case 'color_solid': return <Palette className="w-4 h-4 text-pink-400" />;
    }
  };

  return (
    <div className="flex flex-col bg-[#0F0F0F] border-r border-[#1F1F1F] h-full overflow-hidden">
      {/* Header matching look in the reference image */}
      <div className="bg-[#141414] border-b border-[#1F1F1F] px-4 py-2 flex justify-between items-center text-xs font-semibold text-zinc-400 uppercase tracking-widest">
        <span>Fontes</span>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="hover:text-indigo-500 text-zinc-500 transition-colors p-0.5 rounded cursor-pointer"
          title="Adicionar Fonte de Mídia"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="p-3 bg-[#141414] border-b border-[#1F1F1F] flex flex-col gap-2">
          <input
            type="text"
            required
            value={newSourceName}
            onChange={(e) => setNewSourceName(e.target.value)}
            placeholder="Nome da fonte..."
            className="w-full bg-[#0A0A0A] text-white text-xs px-2 py-1.5 rounded border border-[#1F1F1F] focus:outline-none focus:border-indigo-500"
          />
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Tipo:</span>
            <select
              value={newSourceType}
              onChange={(e) => setNewSourceType(e.target.value as any)}
              className="bg-[#0A0A0A] text-white border border-[#1F1F1F] rounded px-1.5 py-0.5 text-[11px] focus:outline-none w-2/3"
            >
              <option value="webcam">Câmera Local / WebRTC</option>
              <option value="image">Logotipo / Imagem Estática</option>
              <option value="video">Vídeo Clip Legislativo</option>
              <option value="screen">Captura de Tela</option>
              <option value="color_solid">Fundo Sólido</option>
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[10px] px-2.5 py-1 rounded transition-all"
            >
              Adicionar
            </button>
          </div>
        </form>
      )}

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sources.map((source) => {
          const isSelected = selectedSourceId === source.id;
          return (
            <div key={source.id} className="flex flex-col bg-[#141414] rounded-lg border border-[#1F1F1F] overflow-hidden">
              <div
                onClick={() => setSelectedSourceId(isSelected ? null : source.id)}
                className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                  isSelected ? 'bg-indigo-950/20' : 'hover:bg-[#1A1A1A]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {getSourceIcon(source.type)}
                  <span className={`text-[11px] font-semibold truncate ${source.visible ? 'text-zinc-200' : 'text-zinc-500 line-through'}`}>
                    {source.name}
                  </span>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onModifySource(source.id, { locked: !source.locked })}
                    className={`p-1 rounded transition-colors ${
                      source.locked ? 'text-red-400 hover:bg-red-950/40' : 'text-zinc-650 hover:bg-zinc-800'
                    }`}
                    title={source.locked ? 'Desbloquear Posição (OBS)' : 'Bloquear Posição (OBS)'}
                  >
                    {source.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => onToggleVisibility(source.id)}
                    className={`p-1 rounded transition-colors ${
                      source.visible ? 'text-indigo-400 hover:bg-indigo-950/40' : 'text-zinc-650 hover:bg-zinc-800'
                    }`}
                    title={source.visible ? 'Ocultar Matriz' : 'Exibir Matriz'}
                  >
                    {source.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => onDeleteSource(source.id)}
                    className="p-1 hover:text-red-400 text-zinc-500 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Source parameters drawer */}
              {isSelected && (
                <div className="px-3 pb-3 pt-1.5 bg-[#0A0A0A] border-t border-[#1F1F1F] text-[10px] text-zinc-400 space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono">
                      <span>Opacidade</span>
                      <span>{Math.round(source.opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={source.opacity}
                      onChange={(e) => onModifySource(source.id, { opacity: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-600 bg-[#1F1F1F] h-1 rounded-sm appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-mono">
                      <span>Escala</span>
                      <span>{Math.round(source.scale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.05"
                      value={source.scale}
                      onChange={(e) => onModifySource(source.id, { scale: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-600 bg-[#1F1F1F] h-1 rounded-sm appearance-none cursor-pointer"
                    />
                  </div>

                  {source.type === 'video' && (
                    <div className="flex gap-2 items-center justify-between pt-1">
                      <span>Mudo:</span>
                      <button
                        onClick={() => onModifySource(source.id, { muted: !source.muted })}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          source.muted ? 'bg-red-950/40 border border-red-800 text-red-400' : 'bg-emerald-950/40 border border-emerald-800 text-emerald-400'
                        }`}
                      >
                        {source.muted ? 'Sem Áudio' : 'Áudio Ativo'}
                      </button>
                    </div>
                  )}

                  <div className="text-[9px] text-zinc-500 leading-snug border-t border-[#1F1F1F]/50 pt-1.5 flex flex-wrap gap-x-2 items-center justify-between">
                    <div>
                      <span>Pos: {Math.round(source.position.x)}, {Math.round(source.position.y)}</span>
                      <span className="ml-2">Tipo: {source.type.toUpperCase()}</span>
                    </div>
                    <button
                      onClick={() => setIsPropertiesOpen(true)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[8.5px] font-bold px-2 py-0.5 rounded transition-all flex items-center gap-1"
                    >
                      <Settings className="w-2.5 h-2.5 text-indigo-400 animate-spin [animation-duration:8s]" />
                      Propriedades (OBS)
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* OBS-style Bottom Toolbar Panel */}
      <div className="bg-[#141414] border-t border-[#1F1F1F] px-3 py-1.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          {/* Add Button */}
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`p-1 rounded transition-colors ${isAdding ? 'bg-indigo-650 text-white bg-indigo-600' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            title="Adicionar Fonte (OBS +)"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          {/* Remove Selected Button */}
          <button
            onClick={() => selectedSourceId && onDeleteSource(selectedSourceId)}
            disabled={!selectedSourceId}
            className={`p-1 rounded transition-colors ${selectedSourceId ? 'text-zinc-400 hover:text-red-400 hover:bg-zinc-800' : 'text-zinc-700 cursor-not-allowed'}`}
            title="Remover Fonte Selecionada"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Move Up */}
          <button
            onClick={() => selectedSourceId && onMoveSource && onMoveSource(selectedSourceId, 'up')}
            disabled={!selectedSourceId || !onMoveSource}
            className={`p-1 rounded transition-colors ${(selectedSourceId && onMoveSource) ? 'text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800' : 'text-zinc-700 cursor-not-allowed'}`}
            title="Mover para Cima (Subir Camada)"
          >
            <ArrowUp className="w-4 h-4" />
          </button>

          {/* Move Down */}
          <button
            onClick={() => selectedSourceId && onMoveSource && onMoveSource(selectedSourceId, 'down')}
            disabled={!selectedSourceId || !onMoveSource}
            className={`p-1 rounded transition-colors ${(selectedSourceId && onMoveSource) ? 'text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800' : 'text-zinc-700 cursor-not-allowed'}`}
            title="Mover para Baixo (Descer Camada)"
          >
            <ArrowDown className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="w-[1px] h-3.5 bg-zinc-800 mx-0.5" />

          {/* Properties Button */}
          <button
            onClick={() => selectedSourceId && setIsPropertiesOpen(true)}
            disabled={!selectedSourceId}
            className={`p-1 rounded transition-colors ${selectedSourceId ? 'text-zinc-450 hover:text-indigo-400 hover:bg-zinc-800' : 'text-zinc-700 cursor-not-allowed'}`}
            title="Propriedades / Filtros OBS"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Source Properties Overlay Modal */}
      {isPropertiesOpen && (
        <SourcePropertiesModal
          isOpen={isPropertiesOpen}
          onClose={() => setIsPropertiesOpen(false)}
          source={sources.find((s) => s.id === (selectedSourceId || '')) || null}
          onModifySource={onModifySource}
        />
      )}
    </div>
  );
}
