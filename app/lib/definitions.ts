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

export type VideoIDHandle = {
  video_id: string;
  uploader_id: string;
  uploader_handle: string;
};

export type MemberYouTube = {
  yt_id: string;
  uploads_playlist: string;
  handle: string;
};

export type Member = {
  name: string;
  handle: string;
  yt_id: string;
  yt_pfp_url: string;
  uploads_playlist: string;
  description: string;
};

export type MemberHandle = {
  handle: string;
};

export enum FilterType {
  Latest = "",
  All = "all",
  Arcadia = "arcadia",
}

// DB Tables
export type MembersTable = {
  id: number;
  name: string;
  handle: string;
  yt_id: string;
  yt_pfp_url: string;
  uploads_playlist: string;
  description: string;
};

export type VideosTable = {
  id: number;
  member_id: number;
  title: string;
  video_id: string;
  publish_date: string;
  arcadia_video: boolean;
  duration: string;
};

export type SocialTypesTable = {
  id: number;
  name: string;
};

export type SocialsTable = {
  id: number;
  social_type_id: number;
  member_id: number;
  url: string;
};
