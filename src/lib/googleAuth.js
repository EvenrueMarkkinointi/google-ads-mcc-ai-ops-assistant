import { requestJson } from "./http.js";

export class GoogleOAuthRefreshTokenAuth {
  constructor({ clientId, clientSecret, refreshToken }) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.refreshToken = refreshToken;
    this.cache = new Map();
  }

  async getAccessToken() {
    const cacheKey = "google_oauth_access_token";
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now() + 60_000) {
      return cached.accessToken;
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: "refresh_token"
      })
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to refresh Google OAuth access token: ${JSON.stringify(json)}`);
    }

    this.cache.set(cacheKey, {
      accessToken: json.access_token,
      expiresAt: Date.now() + json.expires_in * 1000
    });

    return json.access_token;
  }
}

export async function fetchGoogleJson(auth, scopes, url, options = {}) {
  const accessToken = await auth.getAccessToken(scopes);
  return requestJson(url, {
    ...options,
    headers: {
      authorization: `Bearer ${accessToken}`,
      ...(options.headers ?? {})
    }
  });
}
