import { requestJson } from "../lib/http.js";

export class ResendEmailClient {
  constructor({ apiKey, from }) {
    this.apiKey = apiKey;
    this.from = from;
  }

  async sendEmail({ to, subject, html, text }) {
    return requestJson("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        from: this.from,
        to,
        subject,
        html,
        text
      })
    });
  }
}
