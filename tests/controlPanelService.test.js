import assert from "node:assert/strict";
import { ControlPanelService } from "../src/services/controlPanelService.js";

async function testControlPanelFiltering() {
  const service = new ControlPanelService({
    controlPanelClient: {
      async readControlPanel() {
        return {
          accounts: [
            { customerId: "1", active: true },
            { customerId: "2", active: false }
          ],
          checklist: [
            { checkId: "a", enabled: true },
            { checkId: "b", enabled: false }
          ],
          thresholds: [
            { metric: "costMicros", enabled: true },
            { metric: "clicks", enabled: false }
          ],
          recipients: [
            { recipientEmail: "a@example.com", enabled: true },
            { recipientEmail: "b@example.com", enabled: false }
          ]
        };
      }
    }
  });

  const panel = await service.getControlPanel();
  assert.equal(panel.accounts.length, 1);
  assert.equal(panel.checklist.length, 1);
  assert.equal(panel.thresholds.length, 1);
  assert.equal(panel.recipients.length, 1);
}

export async function run() {
  await testControlPanelFiltering();
}
