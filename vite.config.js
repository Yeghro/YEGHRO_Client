import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
  },
  resolve: {
    alias: {
      // Add aliases if needed
    },
  },
  optimizeDeps: {
    include: ["nostr-dev-kit"], // Include nostr-dev-kit for dependency pre-bundling
  },
});
