import { NextResponse } from "next/server";
import { updateDbVideos as updateMembers } from "@/app/lib/actions";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
	if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({error: 'Unauthorized'}, {status: 401})
	}
	try {
		await updateMembers();
		return NextResponse.json({ok: true});
	}
	catch (e) {
		console.error('DB Members cron failure:', e)
		return NextResponse.json({ok: false});
	}
}