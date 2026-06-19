import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Plain client-side SPA build. Outputs static assets to dist/ for S3 + CloudFront.
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
