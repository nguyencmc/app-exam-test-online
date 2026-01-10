import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Initialize Sentry for error tracking
// Create a project at https://sentry.io and get your DSN
if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,
        // Performance monitoring
        tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        // Session replay for debugging
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration(),
        ],
    });
}

createRoot(document.getElementById("root")!).render(
    <Sentry.ErrorBoundary fallback={<ErrorBoundary><div /></ErrorBoundary>}>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </Sentry.ErrorBoundary>
);
