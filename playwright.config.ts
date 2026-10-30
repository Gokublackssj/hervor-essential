import { defineConfig, devices } from "@playwright/test";

// Pruebas en el navegador sobre el sitio construido (npm run build) y servido
// con astro preview. Usan el Chrome instalado en el equipo (o el canal que
// indique PW_CHANNEL, por ejemplo "msedge"), sin descargar navegadores.
// Astro admite un solo preview por proyecto: si ya hay uno en este puerto, las
// pruebas lo reutilizan.
const puerto = 4322;

// Tipo mínimo de las variables de entorno que se leen aquí (evita añadir
// @types/node solo para esto).
declare const process: { env: Record<string, string | undefined> };

export default defineConfig({
  testDir: "tests",
  timeout: 45_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${puerto}/`,
    channel: process.env.PW_CHANNEL ?? "chrome",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "escritorio", use: { viewport: { width: 1440, height: 900 } } },
    { name: "movil", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
    { name: "movil-320", use: { ...devices["Pixel 7"], viewport: { width: 320, height: 640 } } },
  ],
  webServer: {
    command: `npm run preview -- --port ${puerto} --host 127.0.0.1`,
    url: `http://127.0.0.1:${puerto}/`,
    reuseExistingServer: !process.env.CI,
  },
});
