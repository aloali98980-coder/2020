import { handleCloudApi } from "./cloudHandler.js";

export function cloudApiPlugin() {
  return {
    name: "vite-plugin-clubowner-cloud",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const handled = await handleCloudApi(req, res);
        if (!handled) next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const handled = await handleCloudApi(req, res);
        if (!handled) next();
      });
    },
  };
}
