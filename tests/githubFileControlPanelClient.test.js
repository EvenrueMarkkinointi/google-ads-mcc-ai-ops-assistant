import assert from "node:assert/strict";
import { GitHubFileControlPanelClient } from "../src/collectors/githubFileControlPanelClient.js";

async function testReadsVersionedControlPanelFile() {
  const client = new GitHubFileControlPanelClient({
    controlPanelPath: "config/control-panel.json",
    cwd: process.cwd()
  });

  const panel = await client.readControlPanel();
  assert.ok(panel.accounts.length > 0);
  assert.ok(panel.checklist.length > 0);
  assert.ok(panel.recipients.length > 0);
  assert.ok(panel.thresholds.length > 0);
}

export async function run() {
  await testReadsVersionedControlPanelFile();
}
