import { NextResponse, NextRequest } from "next/server";
import { updateDeletedVideos } from "@/app/lib/actions";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	if (process.env.NODE_ENV === 'production' && req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({error: 'Unauthorized'}, {status: 401})
	}
	try {
		await updateDeletedVideos();
		return NextResponse.json({ok: true});
	}
	catch (e) {
		console.error('Update Deleted DB Videos cron failure:', e)
		return NextResponse.json({error: 'Unauthorized'}, {status: 500});
	}
}