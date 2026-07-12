import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config: no incremental cache override needed (no heavy ISR usage).
export default defineCloudflareConfig({});
