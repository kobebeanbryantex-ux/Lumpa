import { readFile } from "node:fs/promises";
import type { PetStudioConfig } from "./config.js";
import type { JobStore } from "./storage.js";
import type { PetJob } from "./types.js";
import { jobMessages } from "./messages.js";

type InferenceResponse = { state: "succeeded" | "failed"; message?: string; previewUrl?: string; bundleUrl?: string; errorCode?: string };

function asSafeUrl(value: unknown) {
  if (typeof value !== "string") return undefined;
  const url = new URL(value);
  return url.protocol === "https:" ? url.toString() : undefined;
}

export async function runInference(config: PetStudioConfig, store: JobStore, current: PetJob) {
  if (config.inference.mode === "disabled" || !config.inference.url) {
    return store.save({ ...current, state: "awaiting_model", message: jobMessages.awaiting_model, errorCode: "MODEL_NOT_CONFIGURED" });
  }

  const processing = await store.save({ ...current, state: "processing", message: jobMessages.processing });
  try {
    const source = await readFile(store.sourcePath(processing));
    const form = new FormData();
    form.set("jobId", processing.id);
    form.set("style", processing.style);
    form.set("image", new Blob([source], { type: processing.sourceMime }), processing.sourceFilename);
    const response = await fetch(config.inference.url, {
      method: "POST",
      headers: { accept: "application/json", ...(config.inference.token ? { authorization: `Bearer ${config.inference.token}` } : {}) },
      body: form,
      signal: AbortSignal.timeout(125_000),
    });
    if (!response.ok) throw new Error(`inference returned ${response.status}`);
    const body = await response.json() as InferenceResponse;
    if (body.state !== "succeeded") {
      return store.save({ ...processing, state: "failed", message: jobMessages.failed, errorCode: body.errorCode || "INFERENCE_FAILED" });
    }
    const previewUrl = asSafeUrl(body.previewUrl);
    const bundleUrl = asSafeUrl(body.bundleUrl);
    return store.save({
      ...processing,
      state: "succeeded",
      message: jobMessages.succeeded,
      ...(previewUrl ? { previewUrl } : {}),
      ...(bundleUrl ? { bundleUrl } : {}),
    });
  } catch {
    return store.save({ ...processing, state: "failed", message: jobMessages.failed, errorCode: "INFERENCE_UNAVAILABLE" });
  }
}
