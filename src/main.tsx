import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { logger } from "@sentry/react";
import { StrictMode } from "react";
import App from "./App";
import "./default.css";

const env = import.meta.env.VITE_ENV;
if (env === "production") {
  Sentry.init({
    dsn: "https://1f3157d1a4c16c0fcf969f738237a72c@o4510944413483008.ingest.us.sentry.io/4510944414990336",
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: [
      "localhost",
      "https://inventory-api-production-039e.up.railway.app/api",
    ],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.,
    // Enable logs to be sent to Sentry
    enableLogs: true,
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

window.addEventListener("vite:preloadError", (event) => {
  logger.info(JSON.stringify(event));
  window.location.reload();
});
