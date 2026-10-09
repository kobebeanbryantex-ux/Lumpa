import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { PetJob } from "./types.js";

const idPattern = /^[a-f0-9]{32}$/;
const extensions = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;

export class JobStore {
  public constructor(private readonly root: string) {}

  public async init() { await mkdir(this.root, { recursive: true }); }
  public isValidId(id: string) { return idPattern.test(id); }
  private directory(id: string) { return path.join(this.root, id); }
  private metadataPath(id: string) { return path.join(this.directory(id), "job.json"); }

  public async create(input: { style: PetJob["style"]; mime: PetJob["sourceMime"]; source: Buffer }): Promise<PetJob> {
    const id = randomUUID().replaceAll("-", "");
    const now = new Date().toISOString();
    const job: PetJob = {
      id,
      state: "queued",
      style: input.style,
      sourceMime: input.mime,
      sourceFilename: `source.${extensions[input.mime]}`,
      createdAt: now,
      updatedAt: now,
      message: "任务已进入生成队列。",
    };
    await mkdir(this.directory(id), { recursive: false });
    await writeFile(path.join(this.directory(id), job.sourceFilename), input.source, { mode: 0o600 });
    await this.save(job);
    return job;
  }

  public async get(id: string): Promise<PetJob | null> {
    if (!this.isValidId(id)) return null;
    try { return JSON.parse(await readFile(this.metadataPath(id), "utf8")) as PetJob; }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }

  public async save(job: PetJob) {
    const next = { ...job, updatedAt: new Date().toISOString() };
    await writeFile(this.metadataPath(job.id), JSON.stringify(next), { encoding: "utf8", mode: 0o600 });
    return next;
  }

  public sourcePath(job: PetJob) { return path.join(this.directory(job.id), job.sourceFilename); }
  public async remove(id: string) { if (this.isValidId(id)) await rm(this.directory(id), { recursive: true, force: true, maxRetries: 2 }); }
}
