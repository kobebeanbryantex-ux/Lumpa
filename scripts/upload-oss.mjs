import { createHash, createHmac } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";
import { request } from "node:https";

const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
};
const root = resolve(process.argv[2] || "artifacts/release/oss");
const endpoint = new URL(required("OSS_ENDPOINT"));
if (endpoint.protocol !== "https:") throw new Error("OSS_ENDPOINT must use HTTPS.");
const bucket = required("OSS_BUCKET");
const accessKeyId = required("OSS_ACCESS_KEY_ID");
const accessKeySecret = required("OSS_ACCESS_KEY_SECRET");
const prefix = (process.env.OSS_PREFIX || "lumpa/updates").replace(/^\/+|\/+$/g, "");
const host = endpoint.hostname.startsWith(`${bucket}.`) ? endpoint.hostname : `${bucket}.${endpoint.hostname}`;

const mediaTypes = new Map([
  [".json", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".sig", "text/plain; charset=utf-8"],
  [".exe", "application/vnd.microsoft.portable-executable"],
  [".zip", "application/zip"],
]);

async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await files(path)));
    else if (entry.isFile()) result.push(path);
  }
  return result;
}

function send(method, key, body = Buffer.alloc(0), contentType = "") {
  return new Promise((resolveRequest, reject) => {
    const date = new Date().toUTCString();
    const contentMd5 = body.length ? createHash("md5").update(body).digest("base64") : "";
    const canonicalResource = `/${bucket}/${key}`;
    const stringToSign = `${method}\n${contentMd5}\n${contentType}\n${date}\n${canonicalResource}`;
    const signature = createHmac("sha1", accessKeySecret).update(stringToSign).digest("base64");
    const req = request({
      protocol: "https:",
      hostname: host,
      port: endpoint.port || 443,
      method,
      path: `/${key.split("/").map(encodeURIComponent).join("/")}`,
      headers: {
        Authorization: `OSS ${accessKeyId}:${signature}`,
        Date: date,
        ...(contentType ? { "Content-Type": contentType } : {}),
        "Content-Length": body.length,
        ...(contentMd5 ? { "Content-MD5": contentMd5 } : {}),
      },
      timeout: 60_000,
    }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        if ((response.statusCode || 500) >= 200 && (response.statusCode || 500) < 300) resolveRequest(response);
        else reject(new Error(`OSS ${method} failed for ${key}: HTTP ${response.statusCode} (${Buffer.concat(chunks).toString("utf8").slice(0, 500)})`));
      });
    });
    req.on("timeout", () => req.destroy(new Error(`OSS ${method} timed out for ${key}.`)));
    req.on("error", reject);
    if (body.length) req.write(body);
    req.end();
  });
}

const uploadFiles = await files(root);
if (!uploadFiles.length) throw new Error(`No release files found under ${root}.`);
for (const file of uploadFiles) {
  const relativePath = relative(root, file).replaceAll("\\", "/");
  const key = `${prefix}/${relativePath}`;
  const body = await readFile(file);
  const contentType = mediaTypes.get(extname(file).toLowerCase()) || "application/octet-stream";
  await send("PUT", key, body, contentType);
  const remote = await send("HEAD", key);
  const metadata = await stat(file);
  if (metadata.size !== body.length) throw new Error(`File changed during upload: ${file}`);
  if (Number(remote.headers["content-length"]) !== body.length) {
    throw new Error(`OSS size verification failed for ${key}.`);
  }
}
console.log(`Uploaded and verified ${uploadFiles.length} OSS objects without redirects.`);
