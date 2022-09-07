export type TabloImage = {
  image_id: number;
  has_title: boolean;
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
