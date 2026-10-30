import { test as base, expect, type Page } from "@playwright/test";

// Cada prueba falla si la página escribe un error en la consola o lanza una
// excepción.
export const test = base.extend<{ errores: string[] }>({
  errores: [
    async ({ page }, usar) => {
      const errores: string[] = [];
      page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
      page.on("pageerror", (e) => errores.push(e.message));
      await usar(errores);
      expect(errores, "errores en la consola").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** Abre la página y espera a que sus scripts hayan cargado. */
export async function abrir(page: Page, consulta = "") {
  await page.goto(consulta);
  await expect(page.locator("html")).toHaveAttribute("data-listo", "");
}

export const esMovil = (page: Page) => (page.viewportSize()?.width ?? 0) < 960;

/** Recorre la página entera, como haría un visitante, para que todo se revele. */
export async function recorrer(page: Page) {
  const alto = await page.evaluate(() => document.documentElement.scrollHeight);
  const paso = Math.round((page.viewportSize()?.height ?? 800) * 0.6);
  for (let y = 0; y < alto; y += paso) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
    await page.waitForTimeout(120);
  }
}

/** Los dos modos de movimiento con los que se repiten las pruebas. */
export const modos = [
  { nombre: "con movimiento", reducedMotion: "no-preference" },
  { nombre: "movimiento reducido", reducedMotion: "reduce" },
] as const;
