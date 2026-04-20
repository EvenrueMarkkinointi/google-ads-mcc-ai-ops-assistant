export class ControlPanelService {
  constructor({ controlPanelClient }) {
    this.controlPanelClient = controlPanelClient;
  }

  async getControlPanel() {
    const panel = await this.controlPanelClient.readControlPanel();
    return {
      accounts: panel.accounts.filter((account) => account.active),
      checklist: panel.checklist.filter((item) => item.enabled),
      thresholds: panel.thresholds.filter((item) => item.enabled),
      recipients: panel.recipients.filter((recipient) => recipient.enabled)
    };
  }
}
