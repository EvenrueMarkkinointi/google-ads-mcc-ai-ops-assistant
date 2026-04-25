import assert from "node:assert/strict";
import { GoogleAdsCollector } from "../src/collectors/googleAdsClient.js";

function createAuthStub() {
  return {
    async getAccessToken() {
      return "access-token";
    }
  };
}

async function testIncludesLoginCustomerHeaderWhenProvided() {
  const originalFetch = global.fetch;
  const calls = [];

  global.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      async text() {
        return JSON.stringify([{ results: [] }]);
      }
    };
  };

  try {
    const collector = new GoogleAdsCollector({
      auth: createAuthStub(),
      developerToken: "dev-token",
      loginCustomerId: "1234567890"
    });

    await collector.search("1112223333", "SELECT customer.id FROM customer");
    assert.equal(calls.length, 1);
    assert.equal(calls[0].options.headers["login-customer-id"], "1234567890");
    assert.equal(calls[0].options.headers["developer-token"], "dev-token");
  } finally {
    global.fetch = originalFetch;
  }
}

async function testOmitsLoginCustomerHeaderWhenNotProvided() {
  const originalFetch = global.fetch;
  const calls = [];

  global.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      async text() {
        return JSON.stringify([{ results: [] }]);
      }
    };
  };

  try {
    const collector = new GoogleAdsCollector({
      auth: createAuthStub(),
      developerToken: "dev-token",
      loginCustomerId: ""
    });

    await collector.search("1112223333", "SELECT customer.id FROM customer");
    assert.equal(calls.length, 1);
    assert.equal("login-customer-id" in calls[0].options.headers, false);
  } finally {
    global.fetch = originalFetch;
  }
}

async function testOmitsLoginCustomerHeaderWhenWhitespaceOnly() {
  const originalFetch = global.fetch;
  const calls = [];

  global.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      async text() {
        return JSON.stringify([{ results: [] }]);
      }
    };
  };

  try {
    const collector = new GoogleAdsCollector({
      auth: createAuthStub(),
      developerToken: "dev-token",
      loginCustomerId: "   "
    });

    await collector.search("1112223333", "SELECT customer.id FROM customer");
    assert.equal(calls.length, 1);
    assert.equal("login-customer-id" in calls[0].options.headers, false);
    assert.equal(calls[0].options.headers["developer-token"], "dev-token");
  } finally {
    global.fetch = originalFetch;
  }
}

export async function run() {
  await testIncludesLoginCustomerHeaderWhenProvided();
  await testOmitsLoginCustomerHeaderWhenNotProvided();
  await testOmitsLoginCustomerHeaderWhenWhitespaceOnly();
}
