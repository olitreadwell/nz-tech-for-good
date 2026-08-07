import type { Config } from "tailwindcss";
import baseConfig from "@olitreadwell/config-tailwind";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [baseConfig],
} satisfies Config;
