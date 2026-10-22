export type Social = {
  type: string; // We handle the conversion in the db query
  url: string;
};

export type Video = {
  title: string;
  video_id: string;
  publish_date: string;
  uploader_name: string;
  uploader_handle: string;
  uploader_id: string;
  is_arcadia_video: boolean;
  duration: string;
};

export type Member = {
  name: string;
  handle: string;
  yt_id: string;
  yt_pfp_url: string;
  uploads_playlist: string;
  description: string;
};

export enum FilterType {
  Latest = "",
  All = "all",
  Arcadia = "arcadia",
}
