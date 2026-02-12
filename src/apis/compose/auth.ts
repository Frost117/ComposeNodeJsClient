import { TokenResponse } from "../../schema/types.js";
import { buildAuthUrl } from "./helpers/urls.js";
import config from "../../config.js";

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function getAccessToken(): Promise<string | null> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }


  const authUrl = buildAuthUrl();

  try {
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.COMPOSE_CLIENT_ID,
        client_secret: config.COMPOSE_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      console.error(`Failed to get access token: ${response.statusText}`);
      return null;
    }

    const data: TokenResponse = await response.json();
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);

    console.log('Successfully obtained access token');
    return cachedToken;
  } catch (error) {
    console.error(`Error getting access token: ${error}`);
    return null;
  }
}
