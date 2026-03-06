import { z } from "zod";

const ConfigSchema = z.object({
  apiToken: z.string().min(1, "GOLEM_API_TOKEN is required"),
  apiUrl: z
    .string()
    .url()
    .default("https://release.api.golem.cloud"),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const result = ConfigSchema.safeParse({
    apiToken: process.env.GOLEM_API_TOKEN,
    apiUrl: process.env.GOLEM_API_URL || "https://release.api.golem.cloud",
  });

  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Configuration error:\n${errors}`);
  }

  return result.data;
}
