import Debug from 'debug';
import { merge, find } from 'lodash';

import getConfig from '../../utils/config';
import { Option } from '../../constants/types';
import defaultOptions from './form';
import codecMap from './codecs';
import { buildFlags } from './ffmpeg';
import { presetOptions, presetData, IPresetOption } from './presets';
import { defaultOpts } from './defaults';
import {
  IBuildOptions,
  IDefaultOption,
  PresetKeyType,
} from './defaultOptionsType';

const debug = Debug('tablo-tools:FfmpegCmds/util.ts');

// Transforms the form options to ffmpeg build options.
function transform(formData: IDefaultOption): IBuildOptions {
  const { io, format, video, audio, filters, options } = formData;

  const vcodec = video?.codec as keyof typeof codecMap;
  const acodec = audio?.codec as keyof typeof codecMap;

  const opt = {
    input: io?.input,
    output: io?.output,

    // Format.
    container: format?.container,
    clip: format?.clip,
    startTime: format?.startTime,
    stopTime: format?.stopTime,

    // Video.
    vcodec: codecMap[vcodec],
    preset: video?.preset,
    pass: video?.pass,
    crf: video?.crf,
    bitrate: video?.bitrate,
    minrate: video?.minrate,
    maxrate: video?.maxrate,
    bufsize: video?.bufsize,
    gopsize: video?.gopsize,
    pixelFormat: video?.pixel_format,
    frameRate: video?.frame_rate,
    speed: video?.speed,
    tune: video?.tune,
    profile: video?.profile,
    level: video?.level,
    faststart: video?.faststart,
    size: video?.size,
    width: video?.width,
    height: video?.height,
    format: video?.format,
    aspect: video?.aspect,
    scaling: video?.scaling,
    codecOptions: video?.codec_options,

    // Audio.
    acodec: codecMap[acodec],
    channel: audio?.channel,
    quality: audio?.quality,
    // audioBitrate: audio?.bitrate,
    sampleRate: audio?.sampleRate,
    volume: audio?.volume,

    // Filters.
    deband: filters?.deband,
    deshake: filters?.deshake,
    deflicker: filters?.deflicker,
    dejudder: filters?.dejudder,
    denoise: filters?.denoise,
    deinterlace: filters?.deinterlace,
    brightness: filters?.brightness,
    contrast: filters?.contrast,
    saturation: filters?.saturation,
    gamma: filters?.gamma,
    acontrast: filters?.acontrast,

    // Options.
    extra: options?.extra,
    loglevel: options?.loglevel,
  };

  return opt;
}

function transformToJSON(formData: any) {
  const { format, video, audio, filters } = formData;
  const vcodec = video.codec as keyof typeof codecMap;
  const acodec = audio.codec as keyof typeof codecMap;

  const json = {
    format: {
      container: format.container,
      clip: format.clip,
      startTime: format.startTime,
      stopTime: format.stopTime,
    },
    video: {
      codec: codecMap[vcodec],
      preset: video.preset,
      pass: video.pass,
      crf: video.crf,
      bitrate: video.bitrate,
      minrate: video.minrate,
      maxrate: video.maxrate,
      bufsize: video.bufsize,
      gopsize: video.gopsize,
      pixel_format: video.pixel_format,
      frame_rate: video.frame_rate,
      speed: video.speed,
      tune: video.tune,
      profile: video.profile,
      level: video.level,
      faststart: video.faststart,
      size: video.size,
      width: video.width,
      height: video.height,
      format: video.format,
      aspect: video.aspect,
      scaling: video.scaling,
      codec_options: video.codec_options,
    },
    audio: {
      codec: codecMap[acodec],
      channel: audio.channel,
      quality: audio.quality,
      bitrate: audio.bitrate,
      sampleRate: audio.sampleRate,
      volume: audio.volume.toString(),
    },
    filter: {
      deband: filters.deband,
      deshake: filters.deshake,
      deflicker: filters.deflicker,
      dejudder: filters.dejudder,
      denoise: filters.denoise,
      deinterlace: filters.deinterlace,
      brightness: (filters.brightness / 100).toString(),
      contrast: (filters.contrast / 100 + 1).toString(),
      saturation: filters.saturation.toString(),
      gamma: (filters.gamma / 10).toString(),
      acontrast: filters.acontrast.toString(),
    },
  };
  return json;
}

function transformFromQueryParams(form: any, query: any) {
  const { format, video, audio, filters } = form;

  format.container = query['format.container'] || format.container;
  format.clip = query['format.clip'] || format.clip;
  format.startTime = query['format.startTime'] || format.startTime;
  format.stopTime = query['format.stopTime'] || format.stopTime;

  video.codec = query['video.codec'] || video.codec;
  video.preset = query['video.preset'] || video.preset;
  video.pass = query['video.pass'] || video.pass;
  video.crf = query['video.crf'] || video.crf;
  video.bitrate = query['video.bitrate'] || video.bitrate;
  video.minrate = query['video.bitrate'] || video.minrate;
  video.maxrate = query['video.maxrate'] || video.maxrate;
  video.bufsize = query['video.bufsize'] || video.bufsize;
  video.gopsize = query['video.gopsize'] || video.gopsize;
  video.pixel_format = query['video.pixel_format'] || video.pixel_format;
  video.frame_rate = query['video.frame_rate'] || video.frame_rate;
  video.speed = query['video.speed'] || video.speed;
  video.tune = query['video.tune'] || video.tune;
  video.profile = query['video.profile'] || video.profile;
  video.level = query['video.level'] || video.level;
  video.faststart = query['video.faststart'] || video.faststart;
  video.size = query['video.size'] || video.size;
  video.width = query['video.width'] || video.width;
  video.height = query['video.height'] || video.height;
  video.format = query['video.format'] || video.format;
  video.aspect = query['video.aspect'] || video.aspect;
  video.scaling = query['video.scaling'] || video.scaling;
  video.codec_options = query['video.codec_options']
    ? atob(query['video.codec_options'])
    : video.codec_options;

  audio.codec = query['audio.codec'] || audio.codec;
  audio.channel = query['audio.channel'] || audio.channel;
  audio.quality = query['audio.quality'] || audio.quality;
  audio.sampleRate = query['audio.sample_rate'] || audio.sampleRate;
  audio.volume = query['audio.volume'] || audio.volume;

  filters.deband = query['filters.deband'] || filters.deband;
  filters.deflicker = query['filters.deflicker'] || filters.deflicker;
  filters.deshake = query['filters.deshake'] || filters.deshake;
  filters.dejudder = query['filters.dejudder'] || filters.dejudder;
  filters.denoise = query['filters.denoise'] || filters.denoise;
  filters.deinterlace = query['filters.deinterlace'] || filters.deinterlace;
  filters.contrast = query['filters.contrast'] || filters.contrast;
  filters.brightness = query['filters.brightness'] || filters.brightness;
  filters.saturation = query['filters.saturation'] || filters.saturation;
  filters.gamma = query['filters.gamma'] || filters.gamma;
  filters.acontrast = query['filters.acontrast'] || filters.acontrast;
}

function transformToQueryParams(form: any) {
  const { format, video, audio, filters } = form;
  const params = {
    ...(format.container !== 'mp4' && { 'format.container': format.container }),
    ...(format.clip && { 'format.clip': format.clip }),
    ...(format.startTime && { 'format.startTime': format.startTime }),
    ...(format.stopTime && { 'format.stopTime': format.stopTime }),

    ...(video.codec !== 'x264' && { 'video.codec': video.codec }),
    ...(video.preset !== 'none' && { 'video.preset': video.preset }),
    ...(video.pass !== '1' && { 'video.pass': video.pass }),
    ...(video.crf !== '0' &&
      video.pass === 'crf' && { 'video.crf': video.crf }),
    ...(video.bitrate && { 'video.bitrate': video.bitrate }),
    ...(video.minrate && { 'video.minrate': video.minrate }),
    ...(video.maxrate && { 'video.maxrate': video.maxrate }),
    ...(video.bufsize && { 'video.bufsize': video.bufsize }),
    ...(video.gopsize && { 'video.gopsize': video.gopsize }),
    ...(video.pixel_format !== 'auto' && {
      'video.pixel_format': video.pixel_format,
    }),
    ...(video.frame_rate !== 'auto' && {
      'video.frame_rate': video.frame_rate,
    }),
    ...(video.speed !== 'auto' && { 'video.speed': video.speed }),
    ...(video.tune !== 'none' && { 'video.tune': video.tune }),
    ...(video.profile !== 'none' && { 'video.profile': video.profile }),
    ...(video.level !== 'none' && { 'video.level': video.level }),
    ...(video.faststart && { 'video.faststart': video.faststart }),
    ...(video.size !== 'source' && { 'video.size': video.size }),
    ...(video.width !== '0' &&
      video.size === 'custom' && { 'video.width': video.width }),
    ...(video.height !== '0' &&
      video.size === 'custom' && { 'video.height': video.height }),
    ...(video.format !== 'widescreen' && { 'video.format': video.format }),
    ...(video.aspect !== 'auto' && { 'video.aspect': video.aspect }),
    ...(video.scaling !== 'auto' && { 'video.scaling': video.scaling }),
    ...(video.codec_options && {
      'video.codec_options': btoa(video.codec_options),
    }),

    ...(audio.codec !== 'copy' && { 'audio.codec': audio.codec }),
    ...(audio.channel !== 'source' && { 'audio.channel': audio.channel }),
    ...(audio.quality !== 'auto' && { 'audio.quality': audio.quality }),
    ...(audio.sampleRate !== 'auto' && {
      'audio.sample_rate': audio.sampleRate,
    }),
    ...(audio.volume !== 100 && { 'audio.volume': audio.volume }),

    ...(filters.deband && { 'filters.deband': filters.deband }),
    ...(filters.deflicker && { 'filters.deflicker': filters.deflicker }),
    ...(filters.deshake && { 'filters.deshake': filters.deshake }),
    ...(filters.dejudder && { 'filters.dejudder': filters.dejudder }),
    ...(filters.denoise !== 'none' && { 'filters.denoise': filters.denoise }),
    ...(filters.deinterlace !== 'none' && {
      'filters.deinterlace': filters.deinterlace,
    }),
    ...(parseInt(filters.contrast, 10) !== 0 && {
      'filters.contrast': filters.contrast,
    }),
    ...(parseInt(filters.brightness, 10) !== 0 && {
      'filters.brightness': filters.brightness,
    }),
    ...(parseInt(filters.saturation, 10) !== 0 && {
      'filters.saturation': filters.saturation,
    }),
    ...(parseInt(filters.gamma, 10) !== 0 && {
      'filters.gamma': filters.gamma,
    }),
    ...(parseInt(filters.acontrast, 10) !== 33 && {
      'filters.acontrast': filters.acontrast,
    }),
  };
  return params;
}

function extname(filename: string) {
  const i = filename.lastIndexOf('.');
  return i < 0 ? '' : filename.substring(i);
}

export const getSelectOpts = (
  key: keyof typeof defaultOptions,
  filter?: string
) => {
  const options = defaultOptions[key];
  // console.log(key, options);
  const newOpts: any[] = [];
  if (!Array.isArray(options)) {
    type OptKeyType = keyof typeof options;
    const optKeys = Object.keys(options) as OptKeyType[];

    optKeys.forEach((optKey: OptKeyType) => {
      const subOpts: any = [];
      // console.log(key, Object.keys(key));
      const subOptKeys = Object.keys(options[optKey]);

      subOptKeys.forEach((subKey) => {
        const opt = options[optKey][subKey];
        // console.log(subKey, options[key][subKey]);
        subOpts.push({ label: opt['name'], value: opt['value'] });
      });
      newOpts.push({ label: `${optKey} ${key}`, options: subOpts });
    });
  } else if (filter) {
    const filteredOpts = options.filter(
      (o: any) => !o.supported || o.supported.includes(filter)
    );
    filteredOpts.forEach((item: any) => {
      newOpts.push({ label: item['name'], value: item['value'] });
    });
  } else {
    options.forEach((item: any) => {
      newOpts.push({ label: item['name'], value: item['value'] });
    });
  }
  // console.log('newOpts', newOpts);
  return newOpts;
};

export const getCodecSelectOpts = (
  key: keyof typeof defaultOptions.codecs,
  container: string
) => {
  let options = defaultOptions.codecs[key];
  if (container) {
    options = options.filter(
      (o) => !o.supported || o.supported.includes(container)
    );
  }
  const newOpts: Option[] = [];
  options.forEach((item: any) => {
    newOpts.push({ label: item['name'], value: item['value'] });
  });
  return newOpts;
};

export const getLabel = (selectOpts: any, value: any) => {
  if (selectOpts[0].options && Array.isArray(selectOpts[0].options)) {
    let result = '???';
    selectOpts.forEach((option: any) => {
      const found = find(option.options, (item) => {
        if (item.value === value) {
          return true;
        }
        return false;
      });

      if (found) {
        result = found.label;
      }
    });
    return result;
  }
  const found = find(selectOpts, (item) => {
    if (item.value === value) {
      return true;
    }
    return false;
  });
  if (found) return found.label;
  return '';
};

export function buildFlagsForExport(opt: IDefaultOption) {
  debug('opt', opt);
  debug('util.transform(opt)', transform(opt));
  const flags = buildFlags(transform(opt), true);
  debug('flags', flags);
  return flags;
}

export function build(opt: IBuildOptions) {
  return buildFlags(opt).join(' ');
}

export function fixOutput(newOpts: any) {
  const { format, io } = newOpts;

  // jankily fix the file name
  const ext = extname(io.output);
  if (ext) {
    newOpts.io.output = `${newOpts.io.output.replace(
      ext,
      `.${format.container}`
    )}`;
  }
  return null;
}

export async function loadFfmpegProfleOptions() {
  const { ffmpegProfile } = getConfig();
  let ffmpegFlags;
  let name = '';
  if (ffmpegProfile.startsWith('custom')) {
    const rec = await window.db.findOneAsync('FfmpegDb', {
      id: ffmpegProfile,
    });
    name = rec.name;
    ffmpegFlags = rec.options;
  } else {
    ffmpegFlags = presetData[ffmpegProfile as PresetKeyType];
    const general = presetOptions[0];
    if (general.data) {
      name = general.data.find((x) => x.value === ffmpegProfile)?.name || '';
    }
  }
  const newOpts = merge({}, defaultOpts, ffmpegFlags);
  const output = fixOutput(newOpts);
  if (output) {
    newOpts.io.output = output;
  }
  const presetKey: IPresetOption = { id: ffmpegProfile, name };
  console.log('newOpts', newOpts);
  return { presetKey, options: newOpts };
}

export default {
  transform,
  transformToJSON,
  transformFromQueryParams,
  transformToQueryParams,
  extname,
};
