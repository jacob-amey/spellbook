import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": projectRoot,
      "server-only": fileURLToPath(new URL("./node_modules/next/dist/compiled/server-only/empty.js", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: [
        "lib/backend-config.ts",
        "lib/card-filters.ts",
        "lib/deck-operations.ts",
        "lib/deck-analysis.ts",
        "lib/deck-serialization.ts",
        "lib/deck-storage.ts",
        "lib/scryfall.ts",
        "lib/scryfall-server.ts",
      ],
      reporter: ["text", "html"],
      thresholds: {
        branches: 80,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
  },
});
