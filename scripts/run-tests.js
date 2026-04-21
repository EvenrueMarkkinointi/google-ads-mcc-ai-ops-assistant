import { run as runControlPanelTests } from "../tests/controlPanelService.test.js";
import { run as runGitHubFileControlPanelTests } from "../tests/githubFileControlPanelClient.test.js";
import { run as runGoogleAuthTests } from "../tests/googleAuth.test.js";
import { run as runHealthTests } from "../tests/healthChecks.test.js";
import { run as runLoadEnvTests } from "../tests/loadEnv.test.js";
import { run as runOpenAiTests } from "../tests/openaiProvider.test.js";
import { run as runRendererTests } from "../tests/renderers.test.js";

const tests = [
  ["controlPanelService", runControlPanelTests],
  ["githubFileControlPanelClient", runGitHubFileControlPanelTests],
  ["googleAuth", runGoogleAuthTests],
  ["healthChecks", runHealthTests],
  ["loadEnv", runLoadEnvTests],
  ["openaiProvider", runOpenAiTests],
  ["renderers", runRendererTests]
];

let passed = 0;

for (const [name, execute] of tests) {
  try {
    await execute();
    console.log(`PASS ${name}`);
    passed += 1;
  } catch (error) {
    console.error(`FAIL ${name}: ${error instanceof Error ? error.stack : error}`);
    process.exitCode = 1;
  }
}

if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
}

console.log(`All ${passed} test groups passed.`);
