import { defineConfig } from "astro/config";

// Sitio estático. Para GitHub Pages en una ruta de proyecto, se definen SITE y
// BASE al construir (ver README); en un dominio propio, solo SITE.
export default defineConfig({
  site: process.env.SITE ?? "https://example.com",
  base: process.env.BASE ?? "/",
  build: { inlineStylesheets: "always" },
  devToolbar: { enabled: false },
});
