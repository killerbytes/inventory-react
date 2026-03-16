import { viteStaticCopy } from "vite-plugin-static-copy";
import generateFile from "vite-plugin-generate-file";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  build: {
    minify: "terser",
    terserOptions: {
      format: {
        comments: false,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: "public/**/*", // source files
          dest: "public", // destination inside dist/
        },
      ],
    }),
    generateFile([
      {
        type: "json", // or 'text', 'asset'
        output: "./data.json", // Path relative to outDir
        data: { build: new Date().toISOString() },
      },
    ]),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5300,
  },
});
