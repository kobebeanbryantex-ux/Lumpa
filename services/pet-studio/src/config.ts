import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("127.0.0.1"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(8090),
  LUMPA_PET_STORAGE_DIR: z.string().min(1).default("./data/pet-studio"),
  LUMPA_PET_ALLOWED_ORIGINS: z.string().default(""),
  LUMPA_PET_MAX_UPLOAD_MB: z.coerce.number().int().min(1).max(24).default(12),
  LUMPA_PET_INFERENCE_MODE: z.enum(["disabled", "webhook"]).default("disabled"),
  LUMPA_PET_INFERENCE_URL: z.string().url().optional(),
  LUMPA_PET_INFERENCE_TOKEN: z.string().max(4096).optional(),
});

export type PetStudioConfig = {
  nodeEnv: "development" | "test" | "production";
  host: string;
  port: number;
  storageDir: string;
  allowedOrigins: Set<string>;
  maxUploadBytes: number;
  inference: {
    mode: "disabled" | "webhook";
    url?: string;
    token?: string;
  };
};

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): PetStudioConfig {
  const parsed = schema.safeParse(environment);
  if (!parsed.success) throw new Error(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "));
  const value = parsed.data;
  if (value.LUMPA_PET_INFERENCE_MODE === "webhook" && !value.LUMPA_PET_INFERENCE_URL) {
    throw new Error("LUMPA_PET_INFERENCE_URL is required when LUMPA_PET_INFERENCE_MODE=webhook.");
  }
  const allowedOrigins = new Set(value.LUMPA_PET_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean));
  return {
    nodeEnv: value.NODE_ENV,
    host: value.HOST,
    port: value.PORT,
    storageDir: value.LUMPA_PET_STORAGE_DIR,
    allowedOrigins,
    maxUploadBytes: value.LUMPA_PET_MAX_UPLOAD_MB * 1024 * 1024,
    inference: {
      mode: value.LUMPA_PET_INFERENCE_MODE,
      ...(value.LUMPA_PET_INFERENCE_URL ? { url: value.LUMPA_PET_INFERENCE_URL } : {}),
      ...(value.LUMPA_PET_INFERENCE_TOKEN ? { token: value.LUMPA_PET_INFERENCE_TOKEN } : {}),
    },
  };
}
