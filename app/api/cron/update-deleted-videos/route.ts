import { revalidatePath } from "next/cache";
import { updateDeletedVideos } from "@/app/lib/actions";
import { cronHandler } from "@/app/api/cron/cron-handler";

export const dynamic = "force-dynamic";

export const GET = cronHandler("Update Deleted DB Videos", async () => {
  await updateDeletedVideos();
  revalidatePath("/[[...filter]]", "page");
});
