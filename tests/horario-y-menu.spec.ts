import { test, expect, abrir, esMovil, modos } from "./ayudas";

test.describe("Horario en hora de Bolivia", () => {
  test.use({ reducedMotion: "reduce" });

  for (const [momento, esperado] of [
    ["2026-11-02T10:00", "Abierto ahora, cierra a las 20:00"],
    ["2026-11-02T19:30", "Abierto, cierra pronto: a las 20:00"],
    ["2026-11-01T15:00", "Cerrado, abre mañana, lunes, a las 7:00"],
    ["2026-11-07T06:00", "Cerrado, abre hoy a las 8:00"],
  ] as const) {
    test(`${momento}: «${esperado}»`, async ({ page }) => {
      await abrir(page, `?ahora=${momento}`);
      await expect(page.locator("[data-estado-texto]")).toHaveText(esperado);
      await expect(page.locator("tr.es-hoy")).toHaveCount(1);
    });
  }
});

for (const modo of modos) {
  test.describe(`Menú del móvil (${modo.nombre})`, () => {
    test.use({ reducedMotion: modo.reducedMotion });

    test("abre, lleva a una sección y abre la reserva", async ({ page }) => {
      test.skip(!esMovil(page), "solo por debajo de 960 px");
      await abrir(page);
      const menu = page.locator("[data-menu]");
      const boton = page.locator("[data-menu-abrir]");

      await boton.click();
      await expect(menu).toHaveAttribute("open", "");
      await expect(boton).toHaveAttribute("aria-expanded", "true");
      await expect(menu.locator("nav a")).toHaveCount(4);

      await menu.locator("a[href='#historia']").click();
      await expect(menu).not.toHaveAttribute("open", "");
      await expect(boton).toHaveAttribute("aria-expanded", "false");
      await expect.poll(() => page.evaluate(() => Math.abs(document.querySelector("#historia")!.getBoundingClientRect().top)), { timeout: 4000 }).toBeLessThan(120);

      // Tras bajar a la sección la cabecera se oculta; al subir un poco vuelve.
      await page.mouse.wheel(0, -300);
      await boton.click();
      await menu.locator("[data-abrir-reserva]").click();
      await expect(menu).not.toHaveAttribute("open", "");
      await expect(page.locator("[data-reserva]")).toHaveAttribute("open", "");
    });

    test("Escape cierra el menú", async ({ page }) => {
      test.skip(!esMovil(page), "solo por debajo de 960 px");
      await abrir(page);
      await page.locator("[data-menu-abrir]").click();
      await page.keyboard.press("Escape");
      await expect(page.locator("[data-menu]")).not.toHaveAttribute("open", "");
    });
  });
}
