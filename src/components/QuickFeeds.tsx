import React from 'react';
import { Source } from '../types';
import MaracanauLogo from './MaracanauLogo';
import { Tv, Layout, Eye, Camera, HardDrive } from 'lucide-react';

interface QuickFeedsProps {
  sources: Source[];
  activeSourceId: string | null;
  onSelectFeed: (id: string) => void;
  onQuickToggle: (id: string) => void;
}

export default function QuickFeeds({
  sources,
  activeSourceId,
  onSelectFeed,
  onQuickToggle,
}: QuickFeedsProps) {
  return (
    <div className="bg-[#0A0A0A] p-2 border-t border-b border-[#1F1F1F] overflow-x-auto select-none">
      <div className="flex gap-2 min-w-max">
        {/* Render the sources and mock placeholders for active feeds */}
        {sources.map((feed, idx) => {
          const isActive = feed.id === activeSourceId;
          return (
            <div
              key={feed.id}
              onClick={() => onSelectFeed(feed.id)}
              className={`relative flex flex-col justify-between w-32 aspect-video rounded-lg cursor-pointer transition-all border group shadow-lg ${
                isActive 
                  ? 'bg-[#0A0A0A] border-indigo-500 ring-2 ring-indigo-500/20' 
                  : (feed.visible ? 'bg-[#141414] border-[#1F1F1F] hover:border-zinc-700' : 'bg-[#0A0A0A]/40 border-dashed border-[#1F1F1F] opacity-60')
              }`}
            >
              {/* Dynamic visual thumbnail representing layout or content */}
              <div className="flex-1 flex items-center justify-center p-1.5 overflow-hidden">
                {feed.type === 'webcam' ? (
                  <div className="flex flex-col items-center justify-center text-emerald-400 gap-0.5 animate-pulse">
                    <Camera className="w-5 h-5" />
                    <span className="text-[7px] font-mono">LIVE FEED</span>
                  </div>
                ) : feed.type === 'image' ? (
                  <MaracanauLogo variant="simple" className="scale-[0.4] origin-center -my-3" />
                ) : feed.type === 'video' ? (
                  <div className="flex flex-col items-center justify-center gap-0.5 text-sky-450">
                    <HardDrive className="w-5 h-5 text-indigo-400 animate-spin [animation-duration:8s]" />
                    <span className="text-[7px] font-mono">CLIPE.MP4</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-2 rounded bg-indigo-950/30 w-full h-full text-indigo-400">
                    <Layout className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Toggle Eye on thumbnail hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickToggle(feed.id);
                }}
                className="absolute right-1 top-1 bg-[#0A0A0A]/90 hover:bg-[#0A0A0A] p-0.5 rounded text-zinc-400 hover:text-white transition opacity-0 group-hover:opacity-100 cursor-pointer"
                title={feed.visible ? 'Ocultar' : 'Exibir'}
              >
                <Eye className="w-3 h-3" />
              </button>

              {/* Caption Bar replicating 'Ver. 01' with source labels */}
              <div className="bg-[#0F0F0F] px-2 py-0.5 border-t border-[#1F1F1F] flex justify-between items-center text-[8px] rounded-b-lg text-zinc-400">
                <span className="truncate max-w-[70px] select-none font-bold uppercase tracking-tight">{feed.name}</span>
                <span className="font-mono text-zinc-500">Ver.01</span>
              </div>
            </div>
          );
        })}

        {/* Generate constant mock layouts when sources are limited */}
        {Array.from({ length: Math.max(0, 8 - sources.length) }).map((_, i) => (
          <div
            key={`placeholder-${i}`}
            className="flex flex-col justify-between w-32 aspect-video rounded-lg bg-[#0F0F0F] border border-dashed border-[#1F1F1F] opacity-40 select-none cursor-default"
          >
            <div className="flex-1 flex items-center justify-center">
              <Tv className="w-4 h-4 text-zinc-800" />
            </div>
            <div className="bg-[#141414] px-2 py-0.5 flex justify-between text-[8px] text-zinc-500">
              <span>CANAL VAZIO</span>
              <span>Ver.01</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
