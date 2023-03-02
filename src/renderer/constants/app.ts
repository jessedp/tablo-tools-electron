import { SearchAlert } from './types';

export const ON = 1;
export const OFF = 0;

export const YES = 1;
export const NO = 0;

export const SERIES = 'episode';
export const MOVIE = 'movie';
export const EVENT = 'event';
export const PROGRAM = 'program';

export const EXP_WAITING = 1;
export const EXP_WORKING = 2;
export const EXP_DONE = 3;
export const EXP_CANCEL = 4;
export const EXP_FAIL = 5;
export const EXP_DELETE = 6;

export const DUPE_OVERWRITE = 'OVERWRITE';
export const DUPE_SKIP = 'SKIP';
export const DUPE_INC = 'INCREMENT';
export const DUPE_ADDID = 'ADDID';

export const FFMPEG_DEFAULT_PROFILE = 'basic';

export const beginTimemark = '00:00 / 00:00';

export const EMPTY_SEARCHALERT: SearchAlert = {
  type: '',
  text: '',
  matches: [],
};

export const versionUpdateTestMessage2 = {
  available: true,
  info: {
    info: {
      version: '0.3.6',

      files: [
        {
          url: 'TabloTools-0.1.5-alpha.1.AppImage',
          sha512:
            'UXe1WqXe+xxc+jVc1bWAFvd3w1w8jNej/Dg0PkyhieyRZOcKYne0GmoiKnv2Nio0H0JcHW4bb99RtPzkRh3zZw==',
          size: 126827108,
          blockMapSize: 133752,
        },
      ],
    },
    path: 'TabloTools-0.1.5-alpha.1.AppImage',
    sha512:
      'UXe1WqXe+xxc+jVc1bWAFvd3w1w8jNej/Dg0PkyhieyRZOcKYne0GmoiKnv2Nio0H0JcHW4bb99RtPzkRh3zZw==',
    releaseDate: '2020-04-13T14:56:04.632Z',
    releaseName: '0.1.5-alpha.1',
    releaseNotes:
      '<p>Fix one for loading Airings where the data is physically missing.</p>',
  },
  tag_name: 'v0.3.6',
  published_at: '2022-10-23 12:00:00',
  html_url:
    'https://github.com/jessedp/tablo-tools-electron/releases/tag/v0.3.6',
  body: 'fake release notes',
};

export const VIEW_GRID = 'grid';
export const VIEW_SELECTED = 'selected';
export const VIEW_LIST = 'list';

export type ViewType = 'grid' | 'selected' | 'list';

// Build states
export const STATE_WAITING = 0;
export const STATE_START = 1;
export const STATE_LOADING = 2;
export const STATE_FINISH = 3;
export const STATE_ERROR = 4;
