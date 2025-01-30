import { google } from "googleapis";
import { ExternalAccountClient } from "google-auth-library";
import { getVercelOidcToken } from "@vercel/functions/oidc";

export function getYouTube() {
	const GCP_PROJECT_NUMBER = process.env.GCP_PROJECT_NUMBER;
	const GCP_SERVICE_ACCOUNT_EMAIL = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
	const GCP_WORKLOAD_IDENTITY_POOL_ID = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
	const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;

	const authClient = ExternalAccountClient.fromJSON({
		type: 'external_account',
		audience: `//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
		subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
		token_url: 'https://sts.googleapis.com/v1/token',
		service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
		subject_token_supplier: {
			// Use the Vercel OIDC token as the subject token
			getSubjectToken: getVercelOidcToken,
		},
		scopes: ['https://www.googleapis.com/auth/youtube.readonly']
	});

	if (!authClient) {
		const err = 'Failed to create an external account client with vercel OIDC';
		console.error(err);
		throw new Error(err);
	}

	try {
		return google.youtube({
			version: 'v3',
			auth: authClient,
		});
	}
	catch (e) {
		console.error('getYouTube Failed', e);
		throw e;
	}
}