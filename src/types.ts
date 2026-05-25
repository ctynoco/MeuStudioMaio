export interface Source {
  id: string;
  name: string;
  type: 'webcam' | 'screen' | 'image' | 'video' | 'color_solid';
  visible: boolean;
  opacity: number;
  scale: number;
  position: { x: number; y: number };
  volume: number; // For video or mic inputs
  muted: boolean;
  imageUrl?: string;
  videoUrl?: string;
  color?: string;
  locked?: boolean;
  // OBS-cloned properties
  selectedDevice?: string;
  resolution?: string;
  fps?: number;
  videoFormat?: string;
  captureCursor?: boolean;
  speedMultiplier?: number;
  loopVideo?: boolean;
  chromaKey?: boolean;
  chromaKeyColor?: 'green' | 'blue' | 'magenta' | 'custom';
  chromaKeySimilarity?: number;
  chromaKeySmoothness?: number;
  chromaKeySpillValue?: number;
  gainDb?: number;
  noiseSuppression?: boolean;
  noiseSuppressionMethod?: 'speex' | 'rnnoise';
  contrast?: number;
  brightness?: number;
  saturation?: number;
  gamma?: number;
}

export interface Scene {
  id: string;
  name: string;
  sources: string[]; // List of Source IDs active in this scene
  layoutType: 'grid' | 'pip' | 'focused' | 'split' | 'vertical_only';
}

export interface Guest {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'connecting';
  videoActive: boolean;
  audioActive: boolean;
  volume: number;
  avatarSeed: string; // for generating consistent avatars/visuals
  isSpeaking: boolean;
  role: 'Convidado' | 'Apresentador' | 'Moderador';
}

export interface AudioChannel {
  id: string;
  label: string; // Master, Audio Interface, A, B, C, D, E, F etc.
  type: 'master' | 'interface' | 'input' | 'guest';
  volume: number; // 0 to 100
  muted: boolean;
  solo: boolean;
  routedToMaster: boolean; // "M" button
  routedToA: boolean;      // "A" button
  routedToB: boolean;      // "B" button
  meterLevel: number;      // 0 to 100 (real-time dynamic bounce)
  peakValue: number;       // peak hold value
  compression?: number;    // compression dynamic value (0 to 100)
  bass?: number;           // EQ Bass: -12 to +12 (dB, default 0)
  mids?: number;           // EQ Mids: -12 to +12 (dB, default 0)
  treble?: number;         // EQ Treble: -12 to +12 (dB, default 0)
}

export interface StudioConfig {
  streamTitle: string;
  streamUrl: string;
  streamKey: string;
  bitrate: number; // Kbps
  fps: number;
  aspectRatio: '16:9' | '9:16' | 'both';
  tickerText: string;
  tickerSpeed: number;
  logoText: string;
  activeBannerText: string;
  bannerColor: string;
}
