import { google } from "googleapis";
import { getVercelOidcToken } from "@vercel/functions/oidc";

export function getYouTube() {
  const env = process.env;
  const authClient = google.auth.ExternalAccountClient.fromJSON({
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
  });

  // fromJSON only returns null for non-external_account configs; this narrows the type
  if (!authClient)
    throw new Error(
      "Failed to create an external account client with vercel OIDC",
    );
  return google.youtube({ version: "v3", auth: authClient });
}
