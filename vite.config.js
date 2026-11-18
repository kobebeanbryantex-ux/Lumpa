import { defineConfig } from "vite";

export default defineConfig({
  clearScreen: false,
  server: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
    proxy: {
      "/social": { target: "http://127.0.0.1:4180", ws: true },
    },
    headers: {
      "Content-Security-Policy": [
        "default-src 'self'",
        "base-uri 'none'",
        "connect-src 'self' ipc: http://ipc.localhost http: ws: https: wss:",
        "font-src 'self'",
        "frame-ancestors 'none'",
        "img-src 'self' data: blob:",
        "media-src 'self' data: blob:",
        "object-src 'none'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
      ].join("; "),
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  },
  build: {
    target: "es2022",
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: { input: { main: "index.html", friends: "friends.html", freePet: "free-pet.html", launcher: "launcher.html" } },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.js"],
    restoreMocks: true,
  },
});
