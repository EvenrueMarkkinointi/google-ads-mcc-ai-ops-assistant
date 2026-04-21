import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { loadEnvFile } from "../src/lib/loadEnv.js";

async function testLoadEnvFileParsesValues() {
  const dir = await mkdtemp(path.join(tmpdir(), "ads-ops-env-"));
  const envPath = path.join(dir, ".env.test");

  delete process.env.TEST_ENV_ALPHA;
  delete process.env.TEST_ENV_BETA;

  await writeFile(envPath, "TEST_ENV_ALPHA=one\nTEST_ENV_BETA=\"two words\"\n");
  loadEnvFile(envPath);

  assert.equal(process.env.TEST_ENV_ALPHA, "one");
  assert.equal(process.env.TEST_ENV_BETA, "two words");
}

export async function run() {
  await testLoadEnvFileParsesValues();
}
