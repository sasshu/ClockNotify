import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
// import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // VitePWA({
    //   registerType: "autoUpdate",
    //   injectRegister: "script",
    //   workbox: {
    //     globPatterns: ["**/*.{js,css,html,ico,png,svg,mp3}"], // mp3 を追加
    //   },
    //   manifest: {
    //     name: "ClockNotify",
    //     short_name: "ClockNotify",
    //     theme_color: "#ffffff",
    //     icons: [
    //       {
    //         src: "logo.png",
    //         type: "image/png",
    //       },
    //     ],
    //   },
    // }),
  ],
  base: process.env.GITHUB_PAGES ? "/ClockNotify" : "./",
});
