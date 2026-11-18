// Bundle the exact Node runtime and server used for local/LAN play. No server installation is required on the receiving PC.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve, join, sep } from "node:path";
import { execFileSync } from "node:child_process";
if (process.platform !== "win32" || process.arch !== "x64") throw new Error("This desktop runtime package targets Windows x64.");
const root = resolve(".");
const runtimeVersion=JSON.parse(readFileSync(join(root,"vendor/node-runtime-version.json"),"utf8"));
if(process.version!==runtimeVersion.nodeVersion) throw new Error(`Use Node ${runtimeVersion.nodeVersion} for this runtime bundle, or update the matching Node license and version manifest together.`);
if (!existsSync(join(root, "dist/friends.html"))) throw new Error("Build the web assets first.");
mkdirSync(join(root, "artifacts"), {recursive:true});
const stage = mkdtempSync(join(root, "artifacts/social-runtime-stage-"));
try {
  cpSync(process.execPath, join(stage,"node.exe"));
  const license=join(root,"vendor/node-runtime-LICENSE.txt");
  if(!existsSync(license)) throw new Error("Missing vendor/node-runtime-LICENSE.txt for the bundled Node version.");
  cpSync(license,join(stage,"NODE-LICENSE.txt"));
  for (const path of ["services/social/server.mjs", "src/social-games.js", "src/xiangqi.js", "src/park-layout.js", "node_modules/ws", "dist"]) {
    const target=join(stage,path);
    mkdirSync(resolve(target,".."),{recursive:true});
    cpSync(join(root,path),target,{recursive:true});
  }
  writeFileSync(join(stage,"package.json"),JSON.stringify({private:true,type:"module",version:JSON.parse(readFileSync("package.json")).version}));
  const archive=join(root,"src-tauri/social-runtime.zip");
  // bsdtar is included in current Windows installations; argument arrays preserve spaces and Unicode paths.
  execFileSync("tar.exe",["--format=zip","-cf",archive,"-C",stage,"."],{stdio:"inherit",windowsHide:true});
  console.log("Bundled LAN runtime: " + archive);
} finally {
  if (!stage.startsWith(join(root,"artifacts")+sep)) throw new Error("Invalid staging directory");
  rmSync(stage,{recursive:true,force:true});
}
