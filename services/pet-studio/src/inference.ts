import { readFile } from "node:fs/promises";
import type { PetStudioConfig } from "./config.js";
import type { JobStore } from "./storage.js";
import type { PetJob } from "./types.js";

type InferenceResponse = { state: "succeeded" | "failed"; message?: string; previewUrl?: string; bundleUrl?: string; errorCode?: string };

function asSafeUrl(value: unknown) {
  if (typeof value !== "string") return undefined;
  const url = new URL(value);
  return url.protocol === "https:" ? url.toString() : undefined;
}

export async function runInference(config: PetStudioConfig, store: JobStore, current: PetJob) {
  if (config.inference.mode === "disabled" || !config.inference.url) {
    return store.save({ ...current, state: "awaiting_model", message: "生成服务尚未连接模型，任务未消耗额度。", errorCode: "MODEL_NOT_CONFIGURED" });
  }

  const processing = await store.save({ ...current, state: "processing", message: "正在由私有模型服务生成动作资源。" });
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
      return store.save({ ...processing, state: "failed", message: body.message || "模型没有返回可用的宠物资源。", errorCode: body.errorCode || "INFERENCE_FAILED" });
    }
    const previewUrl = asSafeUrl(body.previewUrl);
    const bundleUrl = asSafeUrl(body.bundleUrl);
    return store.save({
      ...processing,
      state: "succeeded",
      message: body.message || "宠物资源生成完成。",
      ...(previewUrl ? { previewUrl } : {}),
      ...(bundleUrl ? { bundleUrl } : {}),
    });
  } catch {
    return store.save({ ...processing, state: "failed", message: "私有模型服务暂时无法完成任务。", errorCode: "INFERENCE_UNAVAILABLE" });
  }
}
