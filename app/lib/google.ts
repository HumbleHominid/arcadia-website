import { google } from "googleapis";

export async function getAuth() {
	const auth = new google.auth.JWT({
		email: process.env.GOOGLE_CLIENT_EMAIL,
		key: process.env.GOOGLE_PRIVATE_KEY,
		scopes: ['https://www.googleapis.com/auth/youtube.readonly']
	});

	try {
		await auth.authorize();
		return auth;
	}
	catch (e) {
		console.error('getAuth Failed');
		throw e;
	}
}

export async function getYouTube() {
	try {
		const auth = await getAuth();
		return google.youtube({
			version: "v3",
			auth,
		});
	}
	catch (e) {
		console.error('getYouTube Failed');
		throw e;
	}
}