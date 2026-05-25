import React, { useState } from 'react';
import { Scene } from '../types';
import { Plus, Check, Trash2, Edit2, Layout, LayoutGrid, MonitorPlay, Presentation } from 'lucide-react';

interface ScenesPanelProps {
  scenes: Scene[];
  activeSceneId: string;
  onSelectScene: (id: string) => void;
  onCreateScene: (name: string, layout: 'grid' | 'pip' | 'focused' | 'split' | 'vertical_only') => void;
  onDeleteScene: (id: string) => void;
}

export default function ScenesPanel({
  scenes,
  activeSceneId,
  onSelectScene,
  onCreateScene,
  onDeleteScene,
}: ScenesPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSceneName, setNewSceneName] = useState('');
  const [newLayout, setNewLayout] = useState<'grid' | 'pip' | 'focused' | 'split' | 'vertical_only'>('grid');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSceneName.trim()) return;
    onCreateScene(newSceneName.trim(), newLayout);
    setNewSceneName('');
    setIsAdding(false);
  };

  const getLayoutIcon = (type: string) => {
    switch (type) {
      case 'grid': return <LayoutGrid className="w-3.5 h-3.5" />;
      case 'pip': return <Layout className="w-3.5 h-3.5" />;
      case 'focused': return <MonitorPlay className="w-3.5 h-3.5" />;
      case 'split': return <Presentation className="w-3.5 h-3.5" />;
      default: return <Layout className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex flex-col bg-[#0F0F0F] border-r border-[#1F1F1F] h-full overflow-hidden">
      {/* Header with picture matching look */}
      <div className="bg-[#141414] border-b border-[#1F1F1F] px-4 py-2 flex justify-between items-center text-xs font-semibold text-zinc-400 uppercase tracking-widest">
        <span>Cenas</span>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="hover:text-indigo-500 text-zinc-500 transition-colors p-0.5 rounded cursor-pointer"
          title="Adicionar Nova Cena"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Adding Sub-form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-3 bg-[#141414] border-b border-[#1F1F1F] flex flex-col gap-2">
          <input
            type="text"
            required
            value={newSceneName}
            onChange={(e) => setNewSceneName(e.target.value)}
            placeholder="Nome da cena..."
            className="w-full bg-[#0A0A0A] text-white text-xs px-2 py-1.5 rounded border border-[#1F1F1F] focus:outline-none focus:border-indigo-500"
          />
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Layout Base:</span>
            <select
              value={newLayout}
              onChange={(e) => setNewLayout(e.target.value as any)}
              className="bg-[#0A0A0A] text-white border border-[#1F1F1F] rounded px-1.5 py-0.5 text-[11px] focus:outline-none"
            >
              <option value="focused">Foco Principal</option>
              <option value="grid">Grelha Quad</option>
              <option value="split">Lado a Lado</option>
              <option value="pip">Picture in Picture</option>
              <option value="vertical_only">Apenas Reels/Vertical</option>
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
              className="bg-indigo-600 text-white font-semibold text-[10px] px-2.5 py-1 rounded transition-all hover:bg-indigo-700"
            >
              Criar
            </button>
          </div>
        </form>
      )}

      {/* List of Scenes */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 select-none">
        {scenes.map((scene) => {
          const isActive = scene.id === activeSceneId;
          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all border ${
                isActive
                  ? 'bg-indigo-950/40 border-indigo-500/50 text-white'
                  : 'bg-[#141414] border-transparent text-zinc-400 hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`flex h-2 w-2 rounded-full ${isActive ? 'bg-indigo-500' : 'bg-transparent'}`} />
                <span className="text-xs font-semibold truncate leading-none pb-0.5">{scene.name}</span>
              </div>

              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-zinc-500 font-medium px-1 bg-[#0A0A0A] rounded border border-[#1F1F1F] flex items-center gap-1">
                  {getLayoutIcon(scene.layoutType)}
                </span>
                {scenes.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteScene(scene.id);
                    }}
                    className="p-1 hover:text-red-400 text-zinc-500 rounded transition"
                    title="Excluir Cena"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
