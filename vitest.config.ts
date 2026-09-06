import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    teardownTimeout: 30_000,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.int.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          environment: "node",
          include: ["src/**/*.int.test.ts"],
          globalSetup: ["./test/global-setup.ts"],
          testTimeout: 20_000,
          hookTimeout: 30_000,
          pool: "forks",
          poolOptions: { forks: { singleFork: true } },
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "json-summary"],
      reportOnFailure: true,
      include: ["src/domain/**", "src/use-cases/**"],
      // *.prisma.ts são adaptadores finos de banco: cobertos pelos testes de
      // integração da seam primária, não por teste unitário.
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
