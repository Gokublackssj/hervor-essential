import { test, expect, abrir, esMovil, recorrer, modos } from "./ayudas";

for (const modo of modos) {
  test.describe(`Página (${modo.nombre})`, () => {
    test.use({ reducedMotion: modo.reducedMotion });

    test("carga completa, sin desbordamiento y con el aviso de demo", async ({ page }) => {
      await abrir(page);
      const g = await page.evaluate(() => ({
        motion: document.documentElement.classList.contains("motion"),
        desborde: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        h1: document.querySelectorAll("h1").length,
        ocultosVisibles: [...document.querySelectorAll("[hidden]")].filter((e) => getComputedStyle(e).display !== "none").length,
      }));
      expect(g.motion).toBe(modo.reducedMotion === "no-preference");
      expect(g.desborde).toBeLessThanOrEqual(0);
      expect(g.h1).toBe(1);
      expect(g.ocultosVisibles).toBe(0);
      await expect(page.locator(".demo-etiqueta")).toBeVisible();
      await expect(page.locator(".pie-demo")).toContainText("Hervor es un negocio ficticio");
    });

    test("todas las imágenes son locales, tienen alt y cargan", async ({ page }) => {
      await abrir(page);
      await page.evaluate(() => document.querySelectorAll("img").forEach((i) => (i.loading = "eager")));
      // El visor (<dialog>) no tiene imagen hasta que se abre.
      await page.waitForFunction(() =>
        [...document.querySelectorAll("img")].filter((i) => !i.closest("dialog")).every((i) => i.currentSrc && i.complete),
      );
      const img = await page.evaluate(() =>
        [...document.querySelectorAll("img")]
          .filter((i) => !i.closest("dialog"))
          .map((i) => ({ alt: i.hasAttribute("alt"), src: i.currentSrc, ancho: i.naturalWidth, dims: i.hasAttribute("width") && i.hasAttribute("height") })),
      );
      expect(img.length).toBe(13);
      for (const i of img) {
        expect(i.alt).toBe(true);
        expect(new URL(i.src).hostname).toBe("127.0.0.1");
        expect(i.src).toMatch(/\.(avif|webp)$/);
        expect(i.ancho).toBeGreaterThan(0);
        expect(i.dims).toBe(true);
      }
    });

    test("al recorrer la página, todo queda visible", async ({ page }) => {
      await abrir(page);
      await recorrer(page);
      await page.waitForTimeout(2000);
      const ocultos = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("[data-revelar]")]
          .filter((e) => {
            const recorteHijo = /^desde-/.test(e.dataset.revelar ?? "") && e.firstElementChild ? getComputedStyle(e.firstElementChild).clipPath : "none";
            return getComputedStyle(e).opacity !== "1" || (recorteHijo !== "none" && !recorteHijo.startsWith("inset(0"));
          })
          .map((e) => e.className || e.tagName),
      );
      expect(ocultos).toEqual([]);
    });

    test("la navegación lleva a cada sección", async ({ page }) => {
      await abrir(page);
      if (esMovil(page)) {
        await page.locator("[data-menu-abrir]").click();
        await page.locator("[data-menu] a[href='#visitanos']").click();
      } else {
        await page.locator(".nav a[href='#visitanos']").click();
      }
      await expect.poll(() => page.evaluate(() => Math.abs(document.querySelector("#visitanos")!.getBoundingClientRect().top)), { timeout: 4000 }).toBeLessThan(120);
    });

    test("«Cómo llegar» y «Llamar» explican que son de demo", async ({ page }) => {
      await abrir(page);
      await page.locator("[data-demo='mapa']").click();
      await expect(page.locator("[data-aviso]")).toContainText("La dirección de Hervor es inventada");
      await page.locator("[data-demo='llamar']").click();
      await expect(page.locator("[data-aviso]")).toContainText("teléfono de Hervor es inventado");
    });
  });
}
