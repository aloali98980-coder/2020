import { defineConfig } from "vite";
import { cloudApiPlugin } from "./server/viteCloudPlugin.js";

export default defineConfig({
  server: { host: "0.0.0.0", allowedHosts: true },
  preview: { host: "0.0.0.0", allowedHosts: true },
  plugins: [cloudApiPlugin()],
});
