import { loadConfig } from "./config.js";
import { GoogleOAuthRefreshTokenAuth } from "./lib/googleAuth.js";
import { GitHubFileControlPanelClient } from "./collectors/githubFileControlPanelClient.js";
import { GoogleAdsCollector } from "./collectors/googleAdsClient.js";
import { ResendEmailClient } from "./collectors/resendClient.js";
import { OpenAiWeeklyAnalysisProvider } from "./reporting/openaiProvider.js";
import { createRepository } from "./storage/repository.js";
import { ControlPanelService } from "./services/controlPanelService.js";
import { JobService } from "./services/jobs.js";
import { MockAnalysisProvider, MockEmailClient } from "./services/mockImplementations.js";
import { loadEnvFile } from "./lib/loadEnv.js";

export function createApp(env = process.env) {
  loadEnvFile();
  const config = loadConfig(env);
  const auth = new GoogleOAuthRefreshTokenAuth({
    clientId: config.googleOauthClientId,
    clientSecret: config.googleOauthClientSecret,
    refreshToken: config.googleOauthRefreshToken
  });

  const controlPanelClient = new GitHubFileControlPanelClient({
    controlPanelPath: config.controlPanelPath
  });

  const controlPanelService = new ControlPanelService({ controlPanelClient });
  const googleAdsCollector = new GoogleAdsCollector({
    auth,
    developerToken: config.googleAdsDeveloperToken,
    loginCustomerId: config.googleAdsLoginCustomerId
  });

  const repository = createRepository(config);
  const analysisProvider = config.openAiApiKey
    ? new OpenAiWeeklyAnalysisProvider({ apiKey: config.openAiApiKey, model: config.openAiModel })
    : new MockAnalysisProvider();

  const emailClient = config.resendApiKey
    ? new ResendEmailClient({ apiKey: config.resendApiKey, from: config.emailFrom })
    : new MockEmailClient();

  const jobService = new JobService({
    controlPanelService,
    googleAdsCollector,
    analysisProvider,
    emailClient,
    repository,
    appBaseUrl: config.appBaseUrl
  });

  return { config, jobService };
}
