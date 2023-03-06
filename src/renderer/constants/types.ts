export type StdObj = Record<string, any>;

export type ExportRecordType = {
  airing: StdObj;
  state: number;
  progress: Record<string, any>;
  startTime: Date | number;
  endTime: Date | number;
  ffmpegLog: Array<string>;
  isBulk: boolean;
};

export type ExportLogRecordType = {
  server_id: string;
  via: string;
  object_id: number;
  startTime: Date | string;
  endTime: Date | string;
  status: number;
  atOnce: number;
  origPath: string;
  realPath: string;
  deleteOnFinish: boolean;
  dupeAction: string;
  result: string;
  ffmpegLog: Array<string>;
  airingData: Record<string, any>;
};

export type FlashRecordType = {
  message: string;
  type?: string;
};

export type ShowCounts = {
  airing_count: number;
  unwatched_count: number;
  protected_count: number;
  watched_and_protected_count: number;
  failed_count: number;
};

export type QryStep = { type: string; value: any; text: any };

export type SearchAlert = {
  type: string;
  text: string;
  matches: QryStep[];
  stats?: Array<Record<string, any>>;
};

export type NamingTemplateType = {
  type: string;
  slug: string;
  label: string;
  template: string;
  _id?: string;
};

export type ShowStatRowType = {
  object_id: number;
  cover: number;
  show: any;
  count: string; // FIXME: BOO! used toLocalString() b/c there's no formatter option in chart library?
  duration: number;
  size: number;
  first: Date;
  last: Date;
};

export type Option = {
  value: string;
  label: string;
};

export type CmdFragment = {
  value: string;
  description: string;
  filters?: Array<CmdFragment>;
};
