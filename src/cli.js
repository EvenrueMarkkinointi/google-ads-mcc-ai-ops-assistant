import { createApp } from "./app.js";

const { jobService } = createApp(process.env);
const [, , command, ...args] = process.argv;
const options = Object.fromEntries(
  args
    .filter((value) => value.startsWith("--"))
    .map((value) => value.slice(2).split("="))
);

async function main() {
  switch (command) {
    case "list_accounts":
      return jobService.listAccounts();
    case "run_daily_health_check":
      return jobService.runDailyHealthCheck();
    case "run_weekly_review":
      return jobService.runWeeklyReview();
    case "review_single_account":
      return jobService.runAccountReview(options["customer-id"]);
    case "get_latest_report":
      return jobService.getLatestReport(options.type ?? "weekly");
    default:
      throw new Error(
        "Unknown command. Use one of: list_accounts, run_daily_health_check, run_weekly_review, review_single_account, get_latest_report"
      );
  }
}

main()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
