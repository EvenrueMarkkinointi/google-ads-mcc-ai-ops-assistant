import assert from "node:assert/strict";
import { parseStructuredOutput } from "../src/reporting/openaiProvider.js";

function testParseStructuredOutput() {
  const parsed = parseStructuredOutput({
    output: [
      {
        type: "message",
        content: [
          {
            type: "output_text",
            text: JSON.stringify({
              executiveSummary: "Stable",
              findings: [],
              risks: [],
              opportunities: [],
              nextActions: []
            })
          }
        ]
      }
    ]
  });

  assert.equal(parsed.executiveSummary, "Stable");
}

export async function run() {
  testParseStructuredOutput();
}
