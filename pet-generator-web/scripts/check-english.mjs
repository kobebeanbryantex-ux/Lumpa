import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const html = readFileSync(fileURLToPath(new URL('../dist/index.html', import.meta.url)), 'utf8');
assert.match(html, /<html lang="en">/);
assert.doesNotMatch(html, /\p{Script=Han}/u, 'The shipped page must not contain Chinese product copy.');
assert.match(html, /No payments or downloads are enabled/);
assert.match(html, /CNY/);
for (const style of ['pixel', 'storybook', 'plush']) assert.match(html, new RegExp(`data-style="${style}"`));
for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Script(script[1]);
const manifest = JSON.parse(readFileSync(fileURLToPath(new URL('../.openai/hosting.json', import.meta.url)), 'utf8'));
assert.equal(manifest.static.directory, 'dist');
assert.equal(manifest.project_id, 'appgprj_6abd1ecc706c8191b953c7117884a7e7');
console.log('English copy, style IDs, JavaScript syntax, prototype disclosures, and Site identity checks passed.');
