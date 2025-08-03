import type { MetadataRoute } from "next";
import { fetchMemberHandles } from "@/app/lib/data";
import { FilterType } from "@/app/lib/definitions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const filterTypes = [FilterType.All, FilterType.Arcadia, FilterType.Latest];
  const out: MetadataRoute.Sitemap = [
    {
      url: "/privacy",
      lastModified: new Date(),
    },
  ];
  filterTypes.forEach((filter) => {
    out.push({
      url: `/${filter}`,
      lastModified: new Date(),
    });
  });
  const members = await fetchMemberHandles();
  out.push(
    ...members.map((member) => ({
      url: `/members/${member.handle}`,
      lastModified: new Date(),
    })),
  );

  return out;
}
