import { requestJson } from "../lib/http.js";

export class OpenAiWeeklyAnalysisProvider {
  constructor({ apiKey, model }) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateWeeklyAccountAnalysis(input) {
    const schema = weeklyAnalysisSchema();
    const response = await requestJson("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text:
                  "You are a Google Ads portfolio analyst. Use only the provided facts. Produce concise, actionable output for an account manager."
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify(input)
              }
            ]
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "weekly_account_analysis",
            schema
          }
        }
      })
    });

    return parseStructuredOutput(response);
  }

  async generatePortfolioSummary(input) {
    const schema = portfolioSummarySchema();
    const response = await requestJson("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text:
                  "You are a portfolio manager writing a weekly report summary for a Google Ads account manager. Use only the provided facts."
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify(input)
              }
            ]
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "portfolio_summary",
            schema
          }
        }
      })
    });

    return parseStructuredOutput(response);
  }
}

export function parseStructuredOutput(response) {
  const item = response.output?.find((entry) => entry.type === "message");
  const text = item?.content?.find((entry) => entry.type === "output_text")?.text;
  if (!text) {
    throw new Error("OpenAI response did not contain structured output text.");
  }
  return JSON.parse(text);
}

function weeklyAnalysisSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      executiveSummary: { type: "string" },
      findings: { type: "array", items: { type: "string" } },
      risks: { type: "array", items: { type: "string" } },
      opportunities: { type: "array", items: { type: "string" } },
      nextActions: { type: "array", items: { type: "string" } }
    },
    required: ["executiveSummary", "findings", "risks", "opportunities", "nextActions"]
  };
}

function portfolioSummarySchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      executiveSummary: { type: "string" },
      topRisks: { type: "array", items: { type: "string" } },
      topOpportunities: { type: "array", items: { type: "string" } },
      managerActions: { type: "array", items: { type: "string" } }
    },
    required: ["executiveSummary", "topRisks", "topOpportunities", "managerActions"]
  };
}
