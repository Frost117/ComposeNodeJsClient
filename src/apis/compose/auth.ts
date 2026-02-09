import config from "../../config.js";
import { TokenResponse } from "../../schema/types.js";

const AUTH_URL = `${config.COMPOSE_MANAGEMENT_URL}/v1/auth/token`;

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function getAccessToken(): Promise<string | null> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }

  try {
    const response = await fetch(AUTH_URL, {
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
