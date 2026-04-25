import { spawn } from "node:child_process";

const port = Number(process.env.SMOKE_PORT ?? 8091);
const baseUrl = `http://127.0.0.1:${port}`;

async function waitForHealth(maxAttempts = 30, intervalMs = 200) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Server did not become healthy at ${baseUrl}/health`);
}

async function run() {
  const server = spawn(process.execPath, ["src/server.js"], {
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let stdout = "";
  let stderr = "";
  server.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForHealth();

    const health = await fetch(`${baseUrl}/health`);
    if (!health.ok) {
      throw new Error(`Health endpoint failed with ${health.status}`);
    }

    const daily = await fetch(`${baseUrl}/jobs/daily-health-check`, { method: "POST" });
    if (!daily.ok) {
      throw new Error(`Daily health endpoint failed with ${daily.status}`);
    }

    const dailyJson = await daily.json();
    if (!dailyJson.runId || !Array.isArray(dailyJson.results)) {
      throw new Error("Daily health response did not include expected run fields.");
    }

    console.log("Smoke test passed.");
    console.log(`runId=${dailyJson.runId} results=${dailyJson.results.length}`);
  } finally {
    if (!server.killed) {
      server.kill("SIGTERM");
    }
    await new Promise((resolve) => server.once("exit", resolve));
    if (stderr.trim()) {
      console.error(stderr.trim());
    }
    if (stdout.trim()) {
      console.log(stdout.trim());
    }
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
