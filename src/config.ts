import { z } from "zod";

/** Known Golem Cloud API origins. Custom URLs require GOLEM_ALLOW_CUSTOM_URL=true. */
const ALLOWED_ORIGINS = [
  "https://release.api.golem.cloud",
  "https://api.golem.cloud",
];

const ConfigSchema = z.object({
  apiToken: z.string().min(1, "GOLEM_API_TOKEN is required"),
  apiUrl: z
    .string()
    .url()
    .refine((u) => u.startsWith("https://"), "GOLEM_API_URL must use HTTPS")
    .default("https://release.api.golem.cloud"),
  allowCustomUrl: z.boolean().default(false),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const result = ConfigSchema.safeParse({
    apiToken: process.env.GOLEM_API_TOKEN,
    apiUrl: process.env.GOLEM_API_URL || "https://release.api.golem.cloud",
    allowCustomUrl: process.env.GOLEM_ALLOW_CUSTOM_URL === "true",
  });

  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Configuration error:\n${errors}`);
  }

  const config = result.data;

  // Prevent Bearer token exfiltration to non-Golem hosts
  const origin = new URL(config.apiUrl).origin;
  if (!ALLOWED_ORIGINS.includes(origin) && !config.allowCustomUrl) {
    throw new Error(
      `GOLEM_API_URL origin "${origin}" is not a known Golem Cloud endpoint. ` +
      `Allowed: ${ALLOWED_ORIGINS.join(", ")}. ` +
      `Set GOLEM_ALLOW_CUSTOM_URL=true to use a custom/self-hosted endpoint.`
    );
  }

  return config;
}
