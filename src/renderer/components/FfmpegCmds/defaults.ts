export const nothing = {};
export const defaultOpts = {
  io: {
    input: 'input.mp4',
    output: 'output.mp4',
  },
  format: {
    container: 'mp4',
    clip: false,
    startTime: '',
    stopTime: '',
  },
  video: {
    codec: 'copy',
    preset: 'none',
    pass: '1',
    crf: 23,
    bitrate: '',
    minrate: '',
    maxrate: '',
    bufsize: '',
    gopsize: '',
    pixel_format: 'auto',
    frame_rate: 'auto',
    speed: 'auto',
    tune: 'none',
    profile: 'none',
    level: 'none',
    faststart: false,
    size: 'source',
    width: '1080', // unused?
    height: '1920', // unused?
    format: 'widescreen', // unused?
    aspect: 'auto',
    scaling: 'auto',
    codec_options: '',
  },
  audio: {
    codec: 'copy',
    channel: 'source',
    quality: 'auto',
    sampleRate: 'auto',
    volume: 100,
  },
  filters: {
    deband: false,
    deshake: false,
    deflicker: false,
    dejudder: false,
    denoise: 'none',
    deinterlace: 'none',
    brightness: 0,
    contrast: 0,
    saturation: 0,
    gamma: 0,

    acontrast: 33,
  },
  options: {
    extra: [],
    loglevel: 'none',
  },
};
