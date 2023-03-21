export interface Io {
  input?: string;
  output?: string;
}

export interface Format {
  container?: string;
  clip?: boolean;
  startTime?: string;
  stopTime?: string;
}

export interface Video {
  codec?: string;
  preset?: string;
  pass?: string;
  crf?: number;
  bitrate?: string;
  minrate?: string;
  maxrate?: string;
  bufsize?: string;
  gopsize?: number | undefined;
  pixel_format?: string;
  frame_rate?: string;
  speed?: string;
  tune?: string;
  profile?: string;
  level?: string;
  faststart?: boolean;
  size?: string;
  width?: string;
  height?: string;
  format?: string;
  aspect?: string;
  scaling?: string;
  codec_options?: string;
}

export interface Audio {
  codec?: string;
  channel?: string;
  quality?: string;
  sampleRate?: string;
  volume?: number;
}

export interface Filters {
  deband?: boolean;
  deshake?: boolean;
  deflicker?: boolean;
  dejudder?: boolean;
  denoise?: string;
  deinterlace?: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  gamma?: number;
  acontrast?: number;
}

export interface Options {
  extra?: any[];
  loglevel?: string;
}

export interface IDefaultOption {
  io?: Io;
  format?: Format;
  video?: Video;
  audio?: Audio;
  filters?: Filters;
  options?: Options;
}

const allTypes = {
  default: true,
  'h264-very-fast-1080p30': true,
  'h264-very-fast-720p30': true,
  'h264-very-fast-480p30': true,
  'h264-fast-1080p30': true,
  'h264-fast-720p30': true,
  'h264-fast-480p30': true,
  'h264-high-profile-level-4.2-6000-1080p': true,
  'h264-main-profile-level-4.0-3000-720p': true,
  'h264-main-profile-level-3.1-1000-480p': true,
  'h264-baseline-profile-level-3.0-600-360p': true,
  'vp9-3000-1080p': true,
  'vp9-1500-720p': true,
};

export type presetKey = keyof typeof allTypes;

export type IPresetData = Record<presetKey, IDefaultOption>;
