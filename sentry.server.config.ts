// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://cf1c29490c3696531ea15f885c6b3b23@o4507029866086400.ingest.us.sentry.io/4510342156976128",
  integrations: [
    Sentry.vercelAIIntegration({
      recordInputs: true, // Whether to record AI inputs
      recordOutputs: true, // Whether to record AI outputs
    }),
    Sentry.consoleLoggingIntegration({
      levels: ["log", "error", "warn"], // Capture console.error and console.warn
    }),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
