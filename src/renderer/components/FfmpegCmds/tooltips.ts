const tooltips = [
  { value: 'ffmpeg', tip: 'Command used to run FFmpeg.' },

  // Options.
  { value: '-i', tip: 'Input file.' },
  { value: '-c:v', tip: 'Selects a video codec.' },
  { value: '-c:a', tip: 'Selects an audio codec.' },
  { value: '-ss', tip: 'Specify a start timestamp.' },
  { value: '-to', tip: 'Specify a stop timestamp.' },
  {
    value: '-preset',
    tip: 'A preset is a collection of options that will provide a certain encoding speed to compression ratio.',
  },
  {
    value: '-hwaccel',
    tip: 'Use hardware acceleration to decode the matching stream(s).',
  },
  {
    value: '-crf',
    tip: 'Constant Rate Factor (CRF). Use this rate control if you want to keep the best quality and care less about the file size.',
  },
  {
    value: '-pass',
    tip: 'Select the pass number (1 or 2). It is used to do two-pass video encoding.',
  },
  {
    value: '-b:v',
    tip: 'Specifies the target (average) bit rate for the encoder to use.',
  },
  {
    value: '-b:a',
    tip: 'Specifies the target (average) bit rate for the encoder to use.',
  },
  { value: '-minrate', tip: 'Specifies a minimum tollerance to be used.' },
  {
    value: '-maxrate',
    tip: 'Specifies a maximum tolerance. This is only used in conjuction with -bufsize.',
  },
  {
    value: '-bufsize',
    tip: 'Specifies the decoder buffer size, which determines the variability of the output bitrate.',
  },
  {
    value: '-g',
    tip: 'Specifies the GOP (Group of Pictures) size. This option is currently only supported by the x264 encoder.',
  },
  {
    value: '-pix_fmt',
    tip: 'Set pixel format. Use -pix_fmts to show all the supported pixel formats.',
  },
  { value: '-r', tip: 'Set frame rate (Hz value, fraction or abbreviation).' },
  {
    value: '-tune',
    tip: 'Use -tune to change settings based upon the specifics of your input.',
  },
  {
    value: '-profile:v',
    tip: 'The -profile:v option limits the output to a specific H.264 profile. Some devices (mostly very old or obsolete) only support the more limited Constrained Baseline or Main profiles. You can set these profiles with -profile:v baseline or -profile:v main.',
  },
  { value: '-level', tip: 'Set the -profile:v level for h.264.' },
  {
    value: '-movflags faststart',
    tip: 'Move the index (moov atom) to the beginning of the file. This operation can take a while, and will not work in various situations such as fragmented output, thus it is not enabled by default.',
  },
  {
    value: '-aspect',
    tip: 'Set the video display aspect ratio specified by aspect.',
  },
  {
    value: '-x264-params',
    tip: 'Set optional x264 parameters to the encoder.',
  },
  {
    value: '-x265-params',
    tip: 'Set optional x265 parameters to the encoder.',
  },
  {
    value: '-vf',
    tip: 'Create the filtergraph specified by <em>filtergraph</em> and use it to filter the stream. This is an alias for <code>-filter:v</code>, see the <a href="https://ffmpeg.org/ffmpeg.html#filter_005foption">-filter option.</a>',
  },
  {
    value: '-af',
    tip: 'Create the filtergraph specified by <em>filtergraph</em> and use it to filter the stream. This is an alias for <code>-filter:a</code>, see the <a href="https://ffmpeg.org/ffmpeg.html#filter_005foption">-filter option.</a>',
  },
  {
    value: '-rematrix_maxval',
    tip: 'Set maximum output value for rematrixing. This can be used to prevent clipping vs. preventing volume reduction. A value of 1.0 prevents clipping.',
  },
  {
    value: '-ac',
    tip: 'Set the number of audio channels. For output streams it is set by default to the number of input audio channels. For input streams this option only makes sense for audio grabbing devices and raw demuxers and is mapped to the corresponding demuxer options.',
  },
  {
    value: '-ar',
    tip: 'Set the audio sampling frequency. For output streams it is set by default to the frequency of the corresponding input stream. For input streams this option only makes sense for audio grabbing devices and raw demuxers and is mapped to the corresponding demuxer options.',
  },
  { value: '-f', tip: 'Force output file format.' },
  { value: '-y', tip: 'Overwrite output files without asking.' },
  {
    value: '-n',
    tip: 'Do not overwrite output files, and exit immediately if a specified output file already exists.',
  },
  { value: '-progress', tip: 'Send program-friendly progress information.' },
  { value: '-hide_banner', tip: 'Suppress printing banner.' },
  {
    value: '-report',
    tip: 'Dump full command line and log output to a file named program-YYYYMMDD-HHMMSS.log in the current directory.',
  },
  {
    value: '-loglevel',
    tip: 'Set logging level and flags used by the library.',
  },

  // Values.
  {
    value: 'copy',
    tip: 'Skip the decoding and encoding step for the specified stream, so it does only demuxing and muxing.',
  },
  { value: 'libx264', tip: 'H.264/AVC Encoder.' },
  { value: 'libx265', tip: 'H.265/HEVC Encoder.' },
  { value: 'h264_nvenc', tip: 'NVIDIA NVENC H.264 encoder.' },
  { value: 'hevc_nvenc', tip: 'NVIDIA NVENC hevc encoder.' },

  // Filters.
  {
    value: 'scale',
    tip: 'Scale (resize) the input video, using the libswscale library.',
  },
  {
    value: 'deband',
    tip: 'Remove banding artifacts from input video. It works by replacing banded pixels with average value of referenced pixels.',
  },
  { value: 'deflicker', tip: 'Remove temporal frame luminance variations.' },
  {
    value: 'deshake',
    tip: 'Attempt to fix small changes in horizontal and/or vertical shift. This filter helps remove camera shake from hand-holding a camera, bumping a tripod, moving on a vehicle, etc. ',
  },
  {
    value: 'dejudder',
    tip: 'Remove judder produced by partially interlaced telecined content.',
  },
  {
    value: 'removegrain',
    tip: 'The removegrain filter is a spatial denoiser for progressive video. ',
  },
  {
    value: 'vaguedenoiser',
    tip: 'Apply a wavelet based denoiser. It transforms each frame from the video input into the wavelet domain, using Cohen-Daubechies-Feauveau 9/7. Then it applies some filtering to the obtained coefficients. It does an inverse wavelet transform after. Due to wavelet properties, it should give a nice smoothed result, and reduced noise, without blurring picture features.',
  },
  {
    value: 'yadif',
    tip: 'Deinterlace the input video ("yadif" means "yet another deinterlacing filter"). ',
  },
  {
    value: 'volume',
    tip: 'Set audio volume expression. <code>output_volume = volume * input_volume</code>',
  },
  {
    value: 'acontrast',
    tip: 'Simple audio dynamic range compression/expansion filter.',
  },
];

export default tooltips;
