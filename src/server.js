import http from "node:http";
import { createApp } from "./app.js";
import { jsonResponse, readJsonBody, summarizeError } from "./lib/utils.js";

const { config, jobService } = createApp(process.env);

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/health") {
      return jsonResponse(res, 200, { ok: true, service: "google-ads-mcc-ai-ops-assistant" });
    }

    if (req.method === "POST" && req.url === "/jobs/daily-health-check") {
      return jsonResponse(res, 200, await jobService.runDailyHealthCheck());
    }

    if (req.method === "POST" && req.url === "/jobs/weekly-review") {
      return jsonResponse(res, 200, await jobService.runWeeklyReview());
    }

    if (req.method === "POST" && req.url === "/jobs/run-account-review") {
      const body = await readJsonBody(req);
      return jsonResponse(res, 200, await jobService.runAccountReview(body.customerId));
    }

    if (req.method === "GET" && req.url?.startsWith("/reports/")) {
      const reportId = req.url.slice("/reports/".length);
      const report = await jobService.getReport(reportId);
      if (!report) {
        return jsonResponse(res, 404, { error: "Report not found" });
      }
      return jsonResponse(res, 200, report);
    }

    return jsonResponse(res, 404, { error: "Not found" });
  } catch (error) {
    return jsonResponse(res, 500, { error: summarizeError(error) });
  }
});

server.listen(config.port, () => {
  console.log(`Server listening on ${config.port}`);
});
