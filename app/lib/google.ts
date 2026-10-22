import { ExternalAccountClient } from "google-auth-library";
import { getVercelOidcToken } from "@vercel/functions/oidc";

// Only the fields actions.ts reads
export type YouTubeItem = {
  id?: string;
  snippet?: {
    title?: string;
    publishedAt?: string;
    tags?: string[];
    description?: string;
    customUrl?: string;
    resourceId?: { videoId?: string };
    thumbnails?: { default?: { url?: string } };
  };
  contentDetails?: {
    duration?: string;
    relatedPlaylists?: { uploads?: string };
  };
  status?: { privacyStatus?: string };
};

const env = process.env;
// Module-level so every call reuses it and the library's token caching/refresh applies.
// fromJSON only returns null for configs that aren't type "external_account", hence the `!`.
const authClient = ExternalAccountClient.fromJSON({
  type: "external_account",
  audience: `//iam.googleapis.com/projects/${env.GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${env.GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
  subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
  token_url: "https://sts.googleapis.com/v1/token",
  service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${env.GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
  subject_token_supplier: {
    // Use the Vercel OIDC token as the subject token
    getSubjectToken: getVercelOidcToken,
  },
  scopes: ["https://www.googleapis.com/auth/youtube.readonly"],
})!;

export async function youtube(
  resource: "channels" | "playlistItems" | "videos",
  params: Record<string, string>,
): Promise<{ items?: YouTubeItem[] }> {
  const { token } = await authClient.getAccessToken();
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/${resource}?${new URLSearchParams(params)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok)
    throw new Error(
      `YouTube ${resource} request failed: ${res.status} ${await res.text()}`,
    );
  return res.json();
}
