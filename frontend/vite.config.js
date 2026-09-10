import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Locally this is http://localhost:5000. Inside Docker Compose it's
  // http://backend:5000 (the service name), set via VITE_API_PROXY_TARGET.
  const proxyTarget = env.VITE_API_PROXY_TARGET || "http://localhost:5000";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        "/api": proxyTarget,
      },
    },
  };
});
