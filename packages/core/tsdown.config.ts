import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/architecture/index.ts", "src/interfaces/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  external: ["winston"],
});