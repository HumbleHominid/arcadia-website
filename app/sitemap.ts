import type { MetadataRoute } from "next";
import { fetchMembers } from "@/app/lib/data";
import { FilterType } from "@/app/lib/definitions";
import { siteUrl } from "@/app/lib/external-sites";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const filters = [FilterType.All, FilterType.Arcadia, FilterType.Latest];
  const members = await fetchMembers();
  return [
    { url: `${siteUrl}/privacy`, lastModified },
    ...filters.map((filter) => ({ url: `${siteUrl}/${filter}`, lastModified })),
    ...members.map((member) => ({
      url: `${siteUrl}/member/${member.handle}`,
      lastModified,
    })),
  ];
}
