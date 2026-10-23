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

// starts_at/ends_at are ISO 'YYYY-MM-DDTHH:MM:SSZ' strings in UTC; a null ends_at never ends.
// The image itself is served from /api/announcements/[id]/image when has_image is true.
export type Announcement = {
  id: number;
  starts_at: string;
  ends_at: string | null;
  title: string;
  text: string;
  has_image: boolean;
};

export enum FilterType {
  Latest = "",
  All = "all",
  Arcadia = "arcadia",
}
