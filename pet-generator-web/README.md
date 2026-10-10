# Lumpa Pet Studio

An English-language product and interaction prototype for custom Windows desktop companions.

## Current behavior

- Select a JPG, PNG, or WebP image and preview it locally in the browser.
- Choose Pixel Studio, Storybook, or Plush Buddy using stable IDs `pixel`, `storybook`, and `plush`.
- Try the draggable demo companion, including keyboard activation with Enter or Space.
- Explore proposed plans and a demo checkout. Prices remain in CNY; payment, reservations, licenses, and downloads are not implemented.
- No selected image is uploaded or turned into a custom pet by this page. The hero image is concept art.

## Local preview and validation

```powershell
python -m http.server 4190 --bind 127.0.0.1 --directory dist
node scripts/check-english.mjs
```

Production files are in `dist/`. Preserve the existing `.openai/hosting.json` project ID and audience when updating this Site.

## Backend integration

The separate desktop repository includes the self-hosted `services/pet-studio` task API. It is not connected to this hosted prototype yet. Public API errors and job messages are now in English, including status responses for older saved jobs. No payment or inference capability is implied by this language update.
