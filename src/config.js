export function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT ?? 8080),
    appBaseUrl: env.APP_BASE_URL ?? `http://localhost:${env.PORT ?? 8080}`,
    timezone: env.TIMEZONE ?? "Europe/Helsinki",
    controlPanelPath: env.CONTROL_PANEL_PATH ?? "config/control-panel.json",
    storageMode: env.STORAGE_MODE ?? "memory",
    postgresUrl: env.POSTGRES_URL ?? "",
    googleAdsDeveloperToken: env.GOOGLE_ADS_DEVELOPER_TOKEN ?? "",
    googleAdsLoginCustomerId: normalizeCustomerId(env.GOOGLE_ADS_LOGIN_CUSTOMER_ID ?? ""),
    googleOauthClientId: env.GOOGLE_OAUTH_CLIENT_ID ?? "",
    googleOauthClientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
    googleOauthRefreshToken: env.GOOGLE_OAUTH_REFRESH_TOKEN ?? "",
    openAiApiKey: env.OPENAI_API_KEY ?? "",
    openAiModel: env.OPENAI_MODEL ?? "gpt-5.4-mini",
    resendApiKey: env.RESEND_API_KEY ?? "",
    emailFrom: env.EMAIL_FROM ?? "ads-ops@example.com"
  };
}

function normalizeCustomerId(value) {
  return String(value).replace(/-/g, "").trim();
}
