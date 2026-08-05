// @ts-check
import { defineConfig } from "astro/config";

// Project site on GitHub Pages: https://olitreadwell.github.io/nz-tech-for-good/
// `site` + `base` make all internal links and assets resolve under the repo
// subpath. If this ever moves to a custom domain, drop `base` and update `site`.
export default defineConfig({
  site: "https://olitreadwell.github.io",
  base: "/nz-tech-for-good",
  trailingSlash: "always",
  // Keep everything self-contained: no external CDN requests at runtime.
  build: {
    inlineStylesheets: "auto",
  },
});
