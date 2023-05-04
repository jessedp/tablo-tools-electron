export interface DataEntity {
  name: string;
  value: string;
}

export interface IPresetOption {
  id: string;
  name: string;
  data?: DataEntity[] | null;
}
