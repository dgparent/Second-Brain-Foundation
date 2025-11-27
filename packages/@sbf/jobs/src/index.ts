import { TriggerClient } from "@trigger.dev/sdk";

export const client = new TriggerClient({
  id: "second-brain-foundation",
  apiKey: process.env.TRIGGER_API_KEY,
  apiUrl: process.env.TRIGGER_API_URL,
});

// Export jobs
export * from "./jobs/ingest";
