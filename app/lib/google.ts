import { google } from "googleapis";

export async function getAuth() {
	const scopes = ['https://www.googleapis.com/auth/youtube.readonly'];

	const auth = new google.auth.JWT({
		email: process.env.GOOGLE_CLIENT_EMAIL,
		key: process.env.GOOGLE_PRIVATE_KEY,
		scopes: scopes
	});

	await auth.authorize();
	return auth;
}

export async function getYouTube() {
	const auth = await getAuth();
	return google.youtube({
		version: "v3",
		auth,
	});
}