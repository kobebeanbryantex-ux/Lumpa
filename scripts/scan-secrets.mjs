import { closeSync, openSync, readSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(process.argv[2] || ".");
const ignoredDirectories = new Set([".git", "node_modules", "target", "dist"]);
const ignoredFiles = new Set([".env", ".env.local", ".env.gateway"]);
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
  /\bsk-[A-Za-z0-9_-]{20,}\b/g,
  /\bgh[oprsu]_[A-Za-z0-9]{30,}\b/g,
  /\bAKIA[A-Z0-9]{16}\b/g,
  /\bLTAI[A-Za-z0-9]{12,}\b/g,
  /\bAIza[0-9A-Za-z_-]{30,}\b/g,
  /(?:api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|password)\s*[:=]\s*["'][^"'\r\n]{20,}["']/gi,
];
const allowedMarkers = /(?:example|integration|test-|test_|dummy|redacted|process\.env|import\.meta\.env)/i;

function collect(directory) {
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    if (ignoredFiles.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...collect(path));
    else if (entry.isFile()) result.push(path);
  }
  return result;
}

const findings = [];
for (const path of collect(root)) {
  const size = statSync(path).size;
  if (size === 0) continue;
  const descriptor = openSync(path, "r");
  const chunk = Buffer.allocUnsafe(1024 * 1024);
  let carry = "";
  let offset = 0;
  try {
    while (offset < size) {
      const bytes = readSync(descriptor, chunk, 0, chunk.length, offset);
      if (!bytes) break;
      offset += bytes;
      const text = carry + chunk.subarray(0, bytes).toString("latin1");
      for (const pattern of patterns) {
        pattern.lastIndex = 0;
        for (const match of text.matchAll(pattern)) {
          if (!allowedMarkers.test(match[0])) {
            findings.push(`${relative(root, path)}:${Math.max(0, offset - bytes + match.index)}`);
            break;
          }
        }
      }
      carry = text.slice(-512);
    }
  } finally {
    closeSync(descriptor);
  }
}

if (findings.length) {
  console.error(`Secret scanner rejected ${new Set(findings).size} location(s):`);
  for (const finding of new Set(findings)) console.error(`- ${finding}`);
  process.exit(1);
}
console.log(`Secret scanner passed for ${root}.`);
