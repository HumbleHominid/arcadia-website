import { bluesky } from "@/app/lib/socials/bluesky";
import { twitter } from "@/app/lib/socials/twitter";

// To add a platform: write a module exporting a Platform (its name must match SocialTypes.name) and list it here.
export const PLATFORMS = [bluesky, twitter];
