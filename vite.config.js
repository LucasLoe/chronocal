import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isPackageBuild = command === "build" && mode !== "demo";

  return {
    plugins: [react()],
    publicDir: isPackageBuild ? false : "public",
    build: isPackageBuild
      ? {
          lib: {
            entry: "src/components/calendar/index.js",
            formats: ["es"],
            fileName: "index",
          },
          rollupOptions: {
            external: [
              "@emotion/react",
              "@emotion/styled",
              "@mui/material",
              "dayjs",
              "dayjs/locale/de",
              "dayjs/plugin/isoWeek",
              "dayjs/plugin/localizedFormat",
              "dayjs/plugin/timezone",
              "dayjs/plugin/utc",
              "react",
              "react/jsx-runtime",
              "react-dom",
            ],
          },
        }
      : undefined,
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./tests/setup.js",
    },
  };
});
