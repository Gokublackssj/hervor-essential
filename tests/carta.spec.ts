import { test, expect, abrir, modos } from "./ayudas";

for (const modo of modos) {
  test.describe(`Carta (${modo.nombre})`, () => {
    test.use({ reducedMotion: modo.reducedMotion });

    test.beforeEach(async ({ page }) => {
      await abrir(page);
      await page.locator("#carta").scrollIntoViewIfNeeded();
    });

    test("una categoría cambia pestaña, foto, productos y precios", async ({ page }) => {
      await page.getByRole("tab", { name: "Filtrados" }).click();
      await expect(page.getByRole("tab", { name: "Filtrados" })).toHaveAttribute("aria-selected", "true");
      await expect(page.locator("[data-panel]:not([hidden])")).toHaveAttribute("id", "panel-filtrados");
      await expect(page.locator(".carta-foto.es-activa")).toHaveAttribute("data-foto", "filtrados");
      const panel = page.locator("#panel-filtrados");
      await expect(panel.locator(".producto")).toHaveCount(4);
      await expect(panel.locator(".producto-nombre").first()).toHaveText("V60 del día");
      await expect(panel.locator(".producto-precio").first()).toHaveText("Bs 24");
      await expect(panel.locator(".producto").last()).toHaveCSS("opacity", "1");
    });

    test("las flechas del teclado recorren las pestañas en círculo", async ({ page }) => {
      await page.getByRole("tab", { name: "Filtrados" }).click();
      await page.keyboard.press("ArrowRight");
      await expect(page.getByRole("tab", { name: "Repostería" })).toBeFocused();
      await expect(page.getByRole("tab", { name: "Repostería" })).toHaveAttribute("aria-selected", "true");
      await page.keyboard.press("ArrowRight");
      await expect(page.getByRole("tab", { name: "Espresso" })).toHaveAttribute("aria-selected", "true");
      await page.keyboard.press("End");
      await expect(page.getByRole("tab", { name: "Repostería" })).toHaveAttribute("aria-selected", "true");
      await page.keyboard.press("Home");
      await expect(page.getByRole("tab", { name: "Espresso" })).toHaveAttribute("aria-selected", "true");
    });

    test("las cuatro pestañas caben a la vista", async ({ page }) => {
      const caben = await page.evaluate(() => {
        const lista = document.querySelector("[role=tablist]")!.getBoundingClientRect();
        return [...document.querySelectorAll("[role=tab]")].every((t) => {
          const r = t.getBoundingClientRect();
          return r.left >= lista.left - 1 && r.right <= lista.right + 1;
        });
      });
      expect(caben).toBe(true);
    });

    test("hay 16 productos con precio en bolivianos", async ({ page }) => {
      const precios = await page.locator(".producto-precio").allTextContents();
      expect(precios).toHaveLength(16);
      for (const p of precios) expect(p).toMatch(/^Bs \d+$/);
    });
  });
}
