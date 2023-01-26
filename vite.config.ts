import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";
import { readdirSync } from "fs";

const absolutePathAliases: { [key: string]: string } = {};
// Root resources folder
const srcPath = path.resolve("./src/");
// Ajust the regex here to include .vue, .js, .jsx, etc.. files from the resources/ folder
const srcRootContent = readdirSync(srcPath, { withFileTypes: true }).map((dirent) => dirent.name.replace(/(\.ts){1}(x?)/, ""));
srcRootContent.forEach((directory) => {
  absolutePathAliases[directory] = path.join(srcPath, directory);
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  resolve: {
    alias: {
      ...absolutePathAliases,
    },
  },
  server: {
    https: true,
    watch: {
      usePolling: true,
    },
  },
  optimizeDeps: {
    disabled: false,
  },
  build: {
    commonjsOptions: { include: [] },
  },
});
