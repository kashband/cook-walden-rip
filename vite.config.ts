import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative base so the build works at any mount point (GitHub Pages serves
  // this as /cook-walden-rip/). Safe here because routing is hash-based.
  base: "./",
  plugins: [react()],
});
