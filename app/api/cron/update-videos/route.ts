import { updateDbVideos } from "@/app/lib/actions";
import { cronHandler } from "@/app/api/cron/cron-handler";

export const dynamic = "force-dynamic";

export const GET = cronHandler("DB Videos", updateDbVideos);
