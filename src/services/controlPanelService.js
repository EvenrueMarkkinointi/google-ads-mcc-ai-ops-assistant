export class ControlPanelService {
  constructor({ sheetsClient }) {
    this.sheetsClient = sheetsClient;
  }

  async getControlPanel() {
    const panel = await this.sheetsClient.readControlPanel();
    return {
      accounts: panel.accounts.filter((account) => account.active),
      checklist: panel.checklist.filter((item) => item.enabled),
      thresholds: panel.thresholds.filter((item) => item.enabled),
      recipients: panel.recipients.filter((recipient) => recipient.enabled)
    };
  }
}
