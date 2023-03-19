import { FFMPEG_DEFAULT_PROFILE } from '../../constants/app';
import { defaultOpts } from './defaults';

export interface DataEntity {
  name: string;
  value: string;
}

export interface IPresetOptions {
  id: string;
  name: string;
  data?: DataEntity[] | null;
}

export const defaultPresetOptions: IPresetOptions = {
  id: FFMPEG_DEFAULT_PROFILE,
  name: 'Basic',
};

export const presetOptions: IPresetOptions[] = [
  {
    id: 'general',
    name: 'General',
    data: [
      { name: 'Basic', value: FFMPEG_DEFAULT_PROFILE },
      { name: 'H264 Very Fast 1080p30', value: 'h264-very-fast-1080p30' },
      { name: 'H264 Very Fast 720p30', value: 'h264-very-fast-720p30' },
      { name: 'H264 Very Fast 480p30', value: 'h264-very-fast-480p30' },
      { name: 'H264 Fast 1080p30', value: 'h264-fast-1080p30' },
      { name: 'H264 Fast 720p30', value: 'h264-fast-720p30' },
      { name: 'H264 Fast 480p30', value: 'h264-fast-480p30' },
      {
        name: 'H264 High Profile Level 4.2 6000K 1080p',
        value: 'h264-high-profile-level-4.2-6000-1080p',
      },
      {
        name: 'H264 Main Profile Level 4.0 3000K 720p',
        value: 'h264-main-profile-level-4.0-3000-720p',
      },
      {
        name: 'H264 Main Profile Level 3.1 1000K 480p',
        value: 'h264-main-profile-level-3.1-1000-480p',
      },
      {
        name: 'H264 Baseline Profile Level 3.0 600K 360p',
        value: 'h264-baseline-profile-level-3.0-600-360p',
      },
      { name: 'VP9 3000K 1080p', value: 'vp9-3000-1080p' },
      { name: 'VP9 1500K 720p', value: 'vp9-1500-720p' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    data: [{ name: 'Custom', value: 'custom' }],
  },
];

export const presetData = {
  default: defaultOpts,

  'h264-very-fast-1080p30': {
    format: {
      container: 'mp4',
    },
    video: {
      codec: 'x264',
      preset: 'veryfast',
      crf: 24,
      frame_rate: '30',
      size: '1920',
    },
    audio: {
      codec: 'copy',
    },
  },
  'h264-very-fast-720p30': {
    format: {
      container: 'mp4',
    },
    video: {
      codec: 'x264',
      preset: 'veryfast',
      crf: 23,
      frame_rate: '30',
      size: '1280',
    },
    audio: {
      codec: 'copy',
    },
  },
  'h264-very-fast-480p30': {
    format: {
      container: 'mp4',
    },
    video: {
      codec: 'x264',
      preset: 'veryfast',
      crf: 22,
      frame_rate: '30',
      size: '720',
    },
    audio: {
      codec: 'copy',
    },
  },
  'h264-fast-1080p30': {
    format: {
      container: 'mp4',
    },
    video: {
      codec: 'x264',
      preset: 'fast',
      crf: 22,
      frame_rate: '30',
      size: '1920',
    },
    audio: {
      codec: 'copy',
    },
  },
  'h264-fast-720p30': {
    format: {
      container: 'mp4',
    },
    video: {
      codec: 'x264',
      preset: 'fast',
      crf: 21,
      frame_rate: '30',
      size: '1280',
    },
    audio: {
      codec: 'copy',
    },
  },
  'h264-fast-480p30': {
    format: {
      container: 'mp4',
    },
    video: {
      codec: 'x264',
      preset: 'fast',
      crf: 20,
      frame_rate: '30',
      size: '720',
    },
    audio: {
      codec: 'copy',
    },
  },
  'h264-high-profile-level-4.2-6000-1080p': {
    format: {
      container: 'mp4',
    },
    video: {
      codec: 'x264',
      size: '1920',
      minrate: '6000K',
      maxrate: '6000K',
      bufsize: '6000K',
      bitrate: '6000K',
      profile: 'high',
      level: '4.2',
      codec_options: 'scenecut=0:open_gop=0:min-keyint=72:keyint=72',
    },
    audio: {
      codec: 'copy',
    },
  },
  'h264-main-profile-level-4.0-3000-720p': {
    format: {
      container: 'mp4',
    },
    video: {
      codec: 'x264',
      size: '1280',
      minrate: '3000K',
      maxrate: '3000K',
      bufsize: '3000K',
      bitrate: '3000K',
      profile: 'main',
      level: '4.0',
      codec_options: 'scenecut=0:open_gop=0:min-keyint=72:keyint=72',
    },
    audio: {
      codec: 'copy',
    },
  },
  'h264-main-profile-level-3.1-1000-480p': {
    format: {
      container: 'mp4',
    },
    video: {
      codec: 'x264',
      size: '768',
      minrate: '1000K',
      maxrate: '1000K',
      bufsize: '1000K',
      bitrate: '1000K',
      profile: 'main',
      level: '3.1',
      codec_options: 'scenecut=0:open_gop=0:min-keyint=72:keyint=72',
    },
    audio: {
      codec: 'copy',
    },
  },
  'h264-baseline-profile-level-3.0-600-360p': {
    format: {
      container: 'mp4',
    },
    video: {
      codec: 'x264',
      size: '480',
      minrate: '600K',
      maxrate: '600K',
      bufsize: '600K',
      bitrate: '600K',
      profile: 'baseline',
      level: '3.0',
      codec_options: 'scenecut=0:open_gop=0:min-keyint=72:keyint=72',
    },
    audio: {
      codec: 'copy',
    },
  },
  'vp9-3000-1080p': {
    format: {
      container: 'webm',
    },
    video: {
      codec: 'vp9',
      profile: 0,
      gopsize: 72,
      size: '1920',
      bitrate: '3000k',
    },
    audio: {
      codec: 'opus',
    },
  },
  'vp9-1500-720p': {
    format: {
      container: 'webm',
    },
    video: {
      codec: 'vp9',
      profile: 0,
      gopsize: 72,
      size: '1280',
      bitrate: '1500k',
    },
    audio: {
      codec: 'opus',
    },
  },
};
