import { test, expect, abrir, modos } from "./ayudas";

for (const modo of modos) {
  test.describe(`Galería (${modo.nombre})`, () => {
    test.use({ reducedMotion: modo.reducedMotion });

    test("abre, navega en círculo, cierra con Escape y devuelve el foco", async ({ page }) => {
      await abrir(page);
      const visor = page.locator("[data-visor]");
      const contador = page.locator("[data-visor-contador]");
      await page.locator("[data-visor-abrir='1']").click();
      await expect(visor).toHaveAttribute("open", "");
      await expect(contador).toHaveText("2 de 4");
      await expect(page.locator("[data-visor-imagen]")).toHaveAttribute("alt", /.{10,}/);
      await expect(page.locator("html")).toHaveClass(/con-modal/);

      await page.locator("[data-visor-siguiente]").click();
      await page.keyboard.press("ArrowRight");
      await expect(contador).toHaveText("4 de 4");
      await page.keyboard.press("ArrowRight");
      await expect(contador).toHaveText("1 de 4");
      await page.locator("[data-visor-anterior]").click();
      await expect(contador).toHaveText("4 de 4");

      await page.keyboard.press("Escape");
      await expect(visor).not.toHaveAttribute("open", "");
      await expect(page.locator("[data-visor-abrir='1']")).toBeFocused();
      await expect(page.locator("html")).not.toHaveClass(/con-modal/);
    });

    test("el botón visible también cierra", async ({ page }) => {
      await abrir(page);
      await page.locator("[data-visor-abrir='0']").click();
      await page.locator("[data-visor-cerrar]").click();
      await expect(page.locator("[data-visor]")).not.toHaveAttribute("open", "");
    });
  });
}
