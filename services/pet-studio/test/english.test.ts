import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildPetStudio } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { runInference } from "../src/inference.js";
import { jobMessages } from "../src/messages.js";

describe("English Pet Studio responses", () => {
  let directory: string;
  let studio: Awaited<ReturnType<typeof buildPetStudio>>;
  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), "lumpa-english-test-"));
    studio = await buildPetStudio(loadConfig({ NODE_ENV: "test", LUMPA_PET_STORAGE_DIR: directory }));
  });
  afterEach(async () => {
    vi.restoreAllMocks();
    await studio?.app.close();
    if (directory?.startsWith(path.join(tmpdir(), "lumpa-english-test-"))) await rm(directory, { recursive: true, force: true });
  });

  it("defines English copy for every generation state", () => {
    expect(Object.keys(jobMessages)).toHaveLength(5);
    for (const message of Object.values(jobMessages)) {
      expect(message).toMatch(/[A-Za-z]/);
      expect(message).not.toMatch(/\p{Script=Han}/u);
    }
  });

  it("returns an English missing-job error", async () => {
    const response = await studio.app.inject({ method: "GET", url: "/v1/pet-studio/jobs/missing" });
    expect(response.statusCode).toBe(404);
    expect(response.json().message).toBe("Generation job not found.");
  });

  it("returns English validation for an empty request", async () => {
    const response = await studio.app.inject({ method: "POST", url: "/v1/pet-studio/jobs", headers: { "content-type": "multipart/form-data; boundary=test" }, payload: "--test--\r\n" });
    expect(response.statusCode).toBe(400);
    expect(response.json().message).toBe("An image and a valid style are required.");
  });

  it("localizes older saved jobs without overwriting their data", async () => {
    const job = await studio.store.create({ style: "pixel", mime: "image/png", source: Buffer.from("test") });
    await studio.store.save({ ...job, state: "succeeded", message: "宠物资源生成完成。" });
    const response = await studio.app.inject({ method: "GET", url: `/v1/pet-studio/jobs/${job.id}` });
    expect(response.json().job.message).toBe(jobMessages.succeeded);
    expect(response.json().job.sourceFilename).toBeUndefined();
    expect((await studio.store.get(job.id))?.message).toBe("宠物资源生成完成。");
  });

  it("keeps the disabled-model response in English", async () => {
    const job = await studio.store.create({ style: "pixel", mime: "image/png", source: Buffer.from("test") });
    const result = await runInference(loadConfig({ NODE_ENV: "test", LUMPA_PET_STORAGE_DIR: directory }), studio.store, job);
    expect(result.state).toBe("awaiting_model");
    expect(result.message).toBe(jobMessages.awaiting_model);
  });

  it.each(["succeeded", "failed"] as const)("does not leak a provider's non-English %s message", async (state) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ state, message: "模型返回中文提示。", previewUrl: "https://example.com/preview.png" }), { status: 200 }));
    const job = await studio.store.create({ style: "pixel", mime: "image/png", source: Buffer.from("test") });
    const result = await runInference(loadConfig({ NODE_ENV: "test", LUMPA_PET_STORAGE_DIR: directory, LUMPA_PET_INFERENCE_MODE: "webhook", LUMPA_PET_INFERENCE_URL: "https://example.com/inference" }), studio.store, job);
    expect(result.state).toBe(state);
    expect(result.message).toBe(jobMessages[state]);
  });
});
