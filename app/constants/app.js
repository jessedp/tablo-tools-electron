import { SearchAlert } from '../utils/types';

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

export const beginTimemark = '00:00 / 00:00';

export const EMPTY_SEARCHALERT: SearchAlert = {
  type: '',
  text: '',
  matches: []
};

export type ProgramData = {
  airing: Airing,
  airings: Array<Airing>,
  count: number,
  unwatched: number
};

export type NamingTemplateType = {
  type: string,
  slug: string,
  label: string,
  template: string
};

export type ExportLogRecordType = {
  server_id: string,
  object_id: number,
  startTime: Date,
  endTime: Date,
  status: string,
  atOnce: number,
  origPath: string,
  realPath: string,

  deleteOnFinish: boolean,
  dupeAction: string,

  result: string,
  ffmpeglog: Array<string>,
  airingData: Object
};

export const versionUpdateTestMessage2 = {
  available: true,
  info: {
    info: {
      version: '0.1.5-alpha.1',
      files: [
        {
          url: 'TabloTools-0.1.5-alpha.1.AppImage',
          sha512:
            'UXe1WqXe+xxc+jVc1bWAFvd3w1w8jNej/Dg0PkyhieyRZOcKYne0GmoiKnv2Nio0H0JcHW4bb99RtPzkRh3zZw==',
          size: 126827108,
          blockMapSize: 133752
        }
      ]
    },
    path: 'TabloTools-0.1.5-alpha.1.AppImage',
    sha512:
      'UXe1WqXe+xxc+jVc1bWAFvd3w1w8jNej/Dg0PkyhieyRZOcKYne0GmoiKnv2Nio0H0JcHW4bb99RtPzkRh3zZw==',
    releaseDate: '2020-04-13T14:56:04.632Z',
    releaseName: '0.1.5-alpha.1',
    releaseNotes:
      '<p>Fix one for loading Airings where the data is physically missing.</p>'
  }
};
