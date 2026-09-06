import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "json-summary"],
      reportOnFailure: true,
      include: ["src/domain/**", "src/use-cases/**"],
      // *.prisma.ts são adaptadores finos de banco: cobertos pelos testes de
      // integração da seam primária (ticket 06+), não por teste unitário.
      exclude: ["src/**/*.test.ts", "src/**/*.prisma.ts"],
      thresholds: {
        "src/domain/**": {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  },
});
