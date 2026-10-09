import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

function argumentsMap(values) {
  const result = new Map();
  for (let index = 0; index < values.length; index += 2) {
    const name = values[index];
    const value = values[index + 1];
    if (!name?.startsWith("--") || value == null) throw new Error(`Invalid argument near ${name || "end of command"}.`);
    result.set(name.slice(2), value);
  }
  return result;
}

function required(map, name) {
  const value = map.get(name)?.trim();
  if (!value) throw new Error(`--${name} is required.`);
  return value;
}

function httpsUrl(value, label) {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error(`${label} must use HTTPS.`);
  return url.toString();
}

const args = argumentsMap(process.argv.slice(2));
const version = required(args, "version").replace(/^v/, "");
const channel = required(args, "channel");
if (!/^(stable|beta)$/.test(channel)) throw new Error("--channel must be stable or beta.");
const packagePath = resolve(required(args, "package"));
const signaturePath = resolve(required(args, "signature"));
const output = resolve(required(args, "output"));
const packageName = basename(packagePath);
const signature = (await readFile(signaturePath, "utf8")).trim();
if (!signature) throw new Error("Updater signature file is empty.");

const notesPath = args.get("notes");
const notes = notesPath ? (await readFile(resolve(notesPath), "utf8")).trim().slice(0, 20_000) : `Lumpa ${version}`;
const common = {
  version,
  notes,
  pub_date: new Date().toISOString(),
};
const manifest = (downloadUrl) => ({
  ...common,
  platforms: {
    "windows-x86_64": {
      signature,
      url: httpsUrl(downloadUrl, "Updater package URL"),
    },
  },
});

const ossBase = httpsUrl(required(args, "oss-base"), "OSS public base").replace(/\/$/, "");
const githubBase = httpsUrl(required(args, "github-base"), "GitHub release base").replace(/\/$/, "");
await mkdir(`${output}/oss/${channel}`, { recursive: true });
await mkdir(`${output}/github`, { recursive: true });
await writeFile(
  `${output}/oss/${channel}/latest.json`,
  `${JSON.stringify(manifest(`${ossBase}/${channel}/${packageName}`), null, 2)}\n`,
  "utf8",
);
await writeFile(
  `${output}/github/${channel}-latest.json`,
  `${JSON.stringify(manifest(`${githubBase}/${packageName}`), null, 2)}\n`,
  "utf8",
);
