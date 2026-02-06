const AUTH_URL = 'https://management.umbracocompose.com/v1/auth/token';
const COMPOSE_CLIENT_ID = process.env.COMPOSE_CLIENT_ID;
const COMPOSE_CLIENT_SECRET = process.env.COMPOSE_CLIENT_SECRET;

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function getAccessToken(): Promise<string | null> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }

  if (!COMPOSE_CLIENT_ID || !COMPOSE_CLIENT_SECRET) {
    console.error('Missing COMPOSE_CLIENT_ID or COMPOSE_CLIENT_SECRET');
    return null;
  }

  try {
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: COMPOSE_CLIENT_ID,
        client_secret: COMPOSE_CLIENT_SECRET,
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
