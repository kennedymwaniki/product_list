import { defineConfig } from "vite";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  publicDir: "public", // Changed from src/public
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  base: "/",
});
