import {
  getCachedAnnouncements,
  getCachedAnnouncementImage,
} from "@/app/lib/cache-methods";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return new Response("Not found", { status: 404 });

  // Only ids the cached list says have an image reach the DB, so random ids never wake it
  const known = (await getCachedAnnouncements()).some(
    (a) => a.id === Number(id) && a.has_image,
  );
  if (!known) return new Response("Not found", { status: 404 });

  const image = await getCachedAnnouncementImage(Number(id));
  if (!image) return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(image.data, "base64"), {
    headers: {
      "Content-Type": image.image_type,
      // Ids are never reused and the script only inserts, so an id's image never changes
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
