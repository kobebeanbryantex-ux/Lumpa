import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";

const artifacts = resolve("artifacts");
const trialData = resolve(process.argv[2] || "");
const folder = relative(artifacts, trialData);
if (!/^social-remote-test-[a-f0-9]{8}$/.test(folder) || isAbsolute(folder) || existsSync(trialData)) {
  throw new Error("The public preview requires a new, dedicated trial data directory.");
}
const tunnelPath = resolve(artifacts, "public-test-tools/cloudflared.exe");
const checksum = createHash("sha256").update(readFileSync(tunnelPath)).digest("hex");
if (checksum !== "d5c1d82031da6253dcdcff64c944cd0fe063016edeb2e4fd088075fc9bd52d0a") {
  throw new Error("The verified Cloudflare trial executable is required.");
}

mkdirSync(trialData);
const url = "http://127.0.0.1:4182";
const service = spawn(process.execPath, ["services/social/server.mjs"], {
  env: {
    ...process.env,
    LUMPA_SOCIAL_HOST: "127.0.0.1",
    LUMPA_SOCIAL_PORT: "4182",
    LUMPA_SOCIAL_DATA: trialData,
    LUMPA_SOCIAL_PUBLIC_TEST: "1",
    LUMPA_SOCIAL_ORIGINS: "",
  },
  stdio: ["inherit", "inherit", "inherit", "ipc"],
  windowsHide: true,
});
let tunnel;
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  if (tunnel && tunnel.exitCode === null) tunnel.kill();
  if (service.exitCode === null) service.kill();
}
const expiry = setTimeout(stop, 2 * 60 * 60 * 1000);
expiry.unref();
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
service.once("exit", stop);

try {
  const ready = await new Promise((done, reject) => {
    const deadline = setTimeout(() => reject(new Error("Local trial did not start.")), 5000);
    service.once("message", payload => { clearTimeout(deadline); done(payload); });
    service.once("error", error => { clearTimeout(deadline); reject(error); });
    service.once("exit", () => { clearTimeout(deadline); reject(new Error("Local trial exited.")); });
  });
  if (ready.type !== "ready" || ready.port !== 4182 || !ready.publicTest) throw new Error("Unexpected preview process.");
  const responses = await Promise.all(["/social/health", "/index.html", "/friends.html"].map(path => fetch(url + path)));
  if (!responses[0].ok || responses[1].status !== 404 || !responses[2].ok) throw new Error("Preview route verification failed.");
  tunnel = spawn(tunnelPath, ["tunnel", "--no-autoupdate", "--protocol", "http2", "--url", url], {
    cwd: trialData,
    stdio: "inherit",
    windowsHide: true,
  });
  tunnel.once("error", error => { console.error(error); stop(); });
  tunnel.once("exit", stop);
} catch (error) {
  stop();
  throw error;
}
