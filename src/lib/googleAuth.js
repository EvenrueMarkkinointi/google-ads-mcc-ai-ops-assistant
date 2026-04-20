import crypto from "node:crypto";
import { requestJson } from "./http.js";

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export class GoogleServiceAccountAuth {
  constructor({ clientEmail, privateKey }) {
    this.clientEmail = clientEmail;
    this.privateKey = privateKey.replace(/\\n/g, "\n");
    this.cache = new Map();
  }

  async getAccessToken(scopes) {
    const cacheKey = scopes.sort().join(" ");
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now() + 60_000) {
      return cached.accessToken;
    }

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "RS256", typ: "JWT" };
    const payload = {
      iss: this.clientEmail,
      scope: cacheKey,
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now
    };

    const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
    const signature = crypto.createSign("RSA-SHA256").update(unsigned).end().sign(this.privateKey);
    const assertion = `${unsigned}.${base64Url(signature)}`;

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion
      })
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to get Google access token: ${JSON.stringify(json)}`);
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
