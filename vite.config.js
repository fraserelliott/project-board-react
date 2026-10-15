import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import process from "node:process";
const host = process.env.TAURI_DEV_HOST;
import path from "node:path";

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || "127.0.0.1",
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve("src"),
      "@contexts": path.resolve("src/contexts"),
      "@components": path.resolve("src/components"),
      "@util": path.resolve("src/util"),
      "@styles": path.resolve("src/styles"),
      "@pages": path.resolve("src/pages"),
      "@assets": path.resolve("src/assets"),
      "@hooks": path.resolve("src/hooks"),
      "@services": path.resolve("src/services"),
      "@models": path.resolve("src/models"),
    },
  },
}));
