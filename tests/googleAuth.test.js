import assert from "node:assert/strict";
import { GoogleOAuthRefreshTokenAuth } from "../src/lib/googleAuth.js";

async function testRefreshTokenAuthRequestsAccessToken() {
  const calls = [];
  const originalFetch = global.fetch;

  global.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      async json() {
        return {
          access_token: "access-token-123",
          expires_in: 3600
        };
      }
    };
  };

  try {
    const auth = new GoogleOAuthRefreshTokenAuth({
      clientId: "client-id",
      clientSecret: "client-secret",
      refreshToken: "refresh-token"
    });

    const token = await auth.getAccessToken();
    assert.equal(token, "access-token-123");
    assert.equal(calls.length, 1);
    assert.match(String(calls[0].url), /oauth2\.googleapis\.com\/token/);
    assert.match(String(calls[0].options.body), /grant_type=refresh_token/);
    assert.match(String(calls[0].options.body), /client_id=client-id/);
  } finally {
    global.fetch = originalFetch;
  }
}

export async function run() {
  await testRefreshTokenAuthRequestsAccessToken();
}
