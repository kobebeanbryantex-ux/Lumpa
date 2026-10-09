import { z } from "zod";

const booleanValue = z.string().transform((value) => value.toLowerCase() === "true");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  OTP_PEPPER: z.string().min(32),
  ACCESS_TOKEN_MINUTES: z.coerce.number().int().min(2).max(60).default(15),
  REFRESH_TOKEN_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  REGISTRATION_ENABLED: booleanValue.default(false),
  REGISTRATION_INVITE_CODE: z.string().default(""),
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(465),
  SMTP_SECURE: booleanValue.default(true),
  SMTP_USER: z.string().default(""),
  SMTP_PASSWORD: z.string().default(""),
  SMTP_FROM: z.string().default(""),
  MAIL_MODE: z.enum(["smtp", "memory"]).default("smtp"),
  UPSTREAM_BASE_URL: z.string().url(),
  UPSTREAM_API_KEY: z.string().min(1),
  CHAT_MODEL: z.string().min(1).default("gpt-5.4-mini"),
  SPEECH_MODEL: z.string().min(1).default("gpt-4o-mini-tts"),
  IMAGE_MODEL: z.string().min(1).default("gpt-image-2"),
  VIDEO_MODEL: z.string().min(1).default("grok-imagine-video"),
  CHAT_DAILY_LIMIT: z.coerce.number().int().min(0).default(50),
  SPEECH_DAILY_LIMIT: z.coerce.number().int().min(0).default(20),
  IMAGE_DAILY_LIMIT: z.coerce.number().int().min(0).default(3),
  VIDEO_DAILY_LIMIT: z.coerce.number().int().min(0).default(1),
});

export type GatewayConfig = z.infer<typeof schema>;

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): GatewayConfig {
  const parsed = schema.safeParse(environment);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Gateway configuration is invalid: ${details}`);
  }
  const url = new URL(parsed.data.UPSTREAM_BASE_URL);
  const loopback = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) {
    throw new Error("UPSTREAM_BASE_URL must use HTTPS, except an explicit loopback HTTP upstream.");
  }
  if (parsed.data.MAIL_MODE === "memory" && parsed.data.NODE_ENV !== "test") {
    throw new Error("MAIL_MODE=memory is restricted to NODE_ENV=test.");
  }
  if (parsed.data.MAIL_MODE === "smtp" && !parsed.data.SMTP_HOST) {
    throw new Error("SMTP_HOST is required when MAIL_MODE=smtp.");
  }
  return parsed.data;
}

export function quotaLimits(config: GatewayConfig) {
  return {
    chat: config.CHAT_DAILY_LIMIT,
    speech: config.SPEECH_DAILY_LIMIT,
    image: config.IMAGE_DAILY_LIMIT,
    video: config.VIDEO_DAILY_LIMIT,
  } as const;
}
