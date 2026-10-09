import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const distDir = resolve("dist");
const indexPath = resolve(distDir, "index.html");

if (!existsSync(indexPath)) {
  throw new Error("Missing dist/index.html. Run the Vite build before verifying its output.");
}

const html = readFileSync(indexPath, "utf8");
const sourceAssetReference = /(?:src|href)=["'](?:\.?\/?)*src\//i;
if (sourceAssetReference.test(html)) {
  throw new Error("Production HTML must not reference files from the source directory.");
}

const assetPaths = [...html.matchAll(/(?:src|href)=["'](\/assets\/[^"'?#]+)[^"']*["']/gi)]
  .map((match) => match[1]);

for (const assetPath of assetPaths) {
  const relativePath = assetPath.slice(1).replaceAll("/", "\\");
  if (!existsSync(resolve(distDir, relativePath))) {
    throw new Error(`Production HTML references a missing asset: ${assetPath}`);
  }
}

console.log(`Verified ${assetPaths.length} production asset reference(s).`);
