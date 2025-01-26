export type Social = {
	type: string; // We handle the conversion in the db query
	url: string;
}

export type Video = {
	title: string;
	video_id: string;
	publish_date: string;
	uploader: string;
	is_arcadia_video: boolean;
}

export type Member = {
	name: string;
	ytId: string;
	socials: Array<Social>;
	videos: Array<Video>;
}

export enum FilterType {
	Latest = "",
	All = "all",
	Arcadia = "arcadia"
}

// DB Tables
export type MembersTable = {
	id: number;
	name: string;
}

export type VideosTable = {
	id: number;
	member_id: number;
	title: string;
	video_id: string;
	publish_date: string;
	arcadia_video: boolean;
}

export type SocialTypesTable = {
	id: number;
	name: string;
}

export type SocialsTable = {
	id: number;
	social_type_id: number;
	member_id: number;
	url: string;
}