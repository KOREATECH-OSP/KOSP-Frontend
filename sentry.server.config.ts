// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://cd71a56d7f6c208ce7c4df4b7c1d7264@o4510837754101760.ingest.us.sentry.io/4510837772582912",

  // production, develop 환경에서만 Sentry 활성화
  enabled: process.env.SENTRY_ENVIRONMENT === "production" || process.env.SENTRY_ENVIRONMENT === "develop",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
