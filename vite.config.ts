import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      registerType: "autoUpdate",
      pwaAssets: {
        disabled: true,
      },
      srcDir: "src",
      filename: "sw.ts",
      injectRegister: false,
      // PWA は使用しないので、manifest は不要
      manifest: false,
      injectManifest: {
        injectionPoint: undefined,
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
  base: process.env.GITHUB_PAGES ? "/ClockNotify/" : "./",
});
