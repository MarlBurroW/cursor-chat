import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true,
    open: false,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    allowedHosts: ["backend", "localhost", "frontend"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  preview: {
    host: true,
  },
});
