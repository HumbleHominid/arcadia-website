import { NextResponse, NextRequest } from "next/server";
import { updateDbVideos } from "@/app/lib/actions";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	if (process.env.NODE_ENV === 'production' && req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({error: 'Unauthorized'}, {status: 401})
	}
	try {
		await updateDbVideos();
		revalidatePath('/[[...filter]]', 'page');
		return NextResponse.json({ok: true});
	}
	catch (e) {
		console.error('DB Videos cron failure:', e)
		return NextResponse.json({error: 'Unauthorized'}, {status: 500});
	}
}