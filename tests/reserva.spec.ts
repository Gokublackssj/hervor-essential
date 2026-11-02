import { test, expect, abrir, modos } from "./ayudas";
import type { Page } from "@playwright/test";

const pie = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll(".reserva-pie .boton")]
      .filter((b) => getComputedStyle(b).display !== "none")
      .map((b) => b.textContent!.trim())
      .join("|"),
  );

for (const modo of modos) {
  test.describe(`Reserva (${modo.nombre})`, () => {
    test.use({ reducedMotion: modo.reducedMotion });

    test("el recorrido completo prepara el mensaje sin enviar nada", async ({ page, context }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      const peticiones: string[] = [];
      page.on("request", (r) => r.method() !== "GET" && peticiones.push(`${r.method()} ${r.url()}`));
      await abrir(page);
      const reserva = page.locator("[data-reserva]");
      const paso = page.locator("[data-reserva-paso]");

      await page.locator(".hero [data-abrir-reserva]").click();
      await expect(reserva).toHaveAttribute("open", "");
      await expect(paso).toHaveText("Paso 1 de 4");
      await expect(page.locator("[data-dias] input")).toHaveCount(7);
      await expect(page.locator(".reserva-demo")).toContainText("no se envía");
      expect(await pie(page)).toBe("Continuar");

      // Sin hora no se avanza.
      await page.locator("[data-reserva-siguiente]").click();
      await expect(page.locator("[data-error='hora']")).toHaveText("Elige una hora.");
      await expect(paso).toHaveText("Paso 1 de 4");

      // Mañana, la primera hora; las horas van de media en media hora.
      await page.locator("[data-dias] label").nth(1).click();
      const horas = await page.locator("[data-horas] input").evaluateAll((e) => e.map((i) => Number((i as HTMLInputElement).value)));
      expect(horas.length).toBeGreaterThan(0);
      for (const m of horas) expect(m % 30).toBe(0);
      await page.locator("[data-horas] label").first().click();

      // Personas: cada clic suma una, con tope de 8.
      const mas = page.locator("[data-personas='1']");
      const personas = page.locator("[data-personas-valor]");
      await expect(personas).toHaveValue("2");
      for (let n = 3; n <= 8; n++) {
        await mas.click();
        await expect(personas).toHaveValue(String(n));
      }
      await expect(mas).toBeDisabled();

      await page.locator("[data-reserva-siguiente]").click();
      await expect(paso).toHaveText("Paso 2 de 4");
      await expect(page.locator("#etapa-2")).toBeFocused();

      // Datos inválidos: errores junto a cada campo y foco en el primero.
      await page.locator("#reserva-nombre").fill("A");
      await page.locator("#reserva-contacto").fill("123");
      await page.locator("[data-reserva-siguiente]").click();
      await expect(page.locator("[data-error='nombre']")).toBeVisible();
      await expect(page.locator("[data-error='contacto']")).toBeVisible();
      await expect(page.locator("#reserva-nombre")).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("#reserva-nombre")).toBeFocused();
      await expect(paso).toHaveText("Paso 2 de 4");

      // Al corregir, los errores desaparecen.
      await page.locator("#reserva-nombre").fill("Ana Quispe");
      await page.locator("#reserva-contacto").fill("ana@correo.com");
      await expect(page.locator("[data-error='nombre']")).toBeHidden();
      await expect(page.locator("[data-error='contacto']")).toBeHidden();
      await page.locator("#reserva-notas").fill("Mesa junto a la ventana");

      await page.locator("[data-reserva-siguiente]").click();
      await expect(paso).toHaveText("Paso 3 de 4");
      await expect(page.locator("[data-resumen] dt")).toHaveText(["Día", "Hora", "Mesa para", "A nombre de", "Contacto", "Nota"]);
      await expect(page.locator("[data-resumen]")).toContainText("8 personas");
      // Solo el día empieza en mayúscula; el correo y los demás datos, tal como se escribieron.
      const mayuscula = await page.locator("[data-resumen] dd").evaluateAll((dds) =>
        dds.map((dd) => getComputedStyle(dd, "::first-letter").textTransform),
      );
      expect(mayuscula).toEqual(["uppercase", "none", "none", "none", "none", "none"]);
      await expect(page.locator("[data-resumen] dd").nth(4)).toHaveText("ana@correo.com");
      await expect(page.locator("[data-reserva-siguiente]")).toHaveText("Preparar el mensaje");

      // Atrás conserva los datos.
      await page.locator("[data-reserva-atras]").click();
      await expect(paso).toHaveText("Paso 2 de 4");
      await expect(page.locator("#reserva-nombre")).toHaveValue("Ana Quispe");
      await page.locator("[data-reserva-siguiente]").click();
      await page.locator("[data-reserva-siguiente]").click();

      await expect(paso).toHaveText("Paso 4 de 4");
      const mensaje = page.locator("[data-mensaje]");
      for (const parte of ["8 personas", "Ana Quispe", "ana@correo.com", "Mesa junto a la ventana"]) await expect(mensaje).toHaveValue(new RegExp(parte));
      expect(await pie(page)).toBe("Atrás|Copiar mensaje|Abrir WhatsApp");
      await expect(page.locator("[data-whatsapp]")).toBeDisabled();
      await expect(page.locator(".reserva-aviso")).toContainText("no hay ninguna reserva confirmada");

      await page.locator("[data-copiar]").click();
      await expect(page.locator("[data-copiado]")).toHaveText(/^Mensaje copiado/);
      expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("Ana Quispe");

      await page.keyboard.press("Escape");
      await expect(reserva).not.toHaveAttribute("open", "");
      await expect(page.locator("html")).not.toHaveClass(/con-modal/);
      expect(peticiones, "la reserva no envía datos").toEqual([]);
    });

    test("el contador de personas funciona con teclado y el foco no queda tapado", async ({ page }) => {
      // Lunes por la mañana: el martes tiene muchas horas y el contador queda
      // al fondo del formulario, junto al pie fijo.
      await abrir(page, "?ahora=2026-11-02T10:10");
      await page.locator(".hero [data-abrir-reserva]").click();
      await page.locator("[data-dias] label").nth(1).click();
      await page.locator("[data-horas] label").first().click();
      const personas = page.locator("[data-personas-valor]");
      const mas = page.locator("[data-personas='1']");
      // El elemento con foco se ve entero: nada (como el pie) lo cubre.
      const tapado = () =>
        page.evaluate(() => {
          const e = document.activeElement!;
          const r = e.getBoundingClientRect();
          const x = r.left + r.width / 2;
          return [r.top + 2, r.bottom - 2].some((y) => !e.contains(document.elementFromPoint(x, y)));
        });

      await page.keyboard.press("Tab");
      await expect(page.locator("[data-personas='-1']")).toBeFocused();
      expect(await tapado()).toBe(false);
      await page.keyboard.press("Tab");
      await expect(personas).toBeFocused();
      expect(await tapado()).toBe(false);
      await page.keyboard.press("Backspace");
      await page.keyboard.type("5");
      await page.keyboard.press("Tab");
      await expect(personas).toHaveValue("5");
      await expect(mas).toBeFocused();
      expect(await tapado()).toBe(false);
      for (let n = 6; n <= 8; n++) {
        await page.keyboard.press("Enter");
        await expect(personas).toHaveValue(String(n));
      }
      await expect(mas).toBeDisabled();

      // Escribir más del tope también se queda en 8.
      await personas.fill("12");
      await personas.press("Tab");
      await expect(personas).toHaveValue("8");
    });

    test("se puede reabrir después de cerrarla", async ({ page }) => {
      await abrir(page);
      const reserva = page.locator("[data-reserva]");
      const abrirReserva = page.locator(".hero [data-abrir-reserva]");
      await abrirReserva.click();
      await page.keyboard.press("Escape");
      await expect(reserva).not.toHaveAttribute("open", "");
      await abrirReserva.click();
      await page.waitForTimeout(500);
      await expect(reserva).toHaveAttribute("open", "");
    });
  });
}

test.describe("Reserva según el horario", () => {
  test.use({ reducedMotion: "reduce" });

  test("domingo a las 13:45: hoy no quedan horas y queda elegido mañana", async ({ page }) => {
    await abrir(page, "?ahora=2026-11-01T13:45");
    await page.locator(".hero [data-abrir-reserva]").click();
    await expect(page.locator("[data-dias] input").first()).toBeDisabled();
    await expect(page.locator("[data-dias] label").first()).toContainText("Sin horas");
    await expect(page.locator("[data-dias] input:checked")).toHaveValue("1");
  });

  test("hoy a las 10:10, la primera hora es 11:00 (media hora de antelación)", async ({ page }) => {
    await abrir(page, "?ahora=2026-11-02T10:10");
    await page.locator(".hero [data-abrir-reserva]").click();
    await expect(page.locator("[data-horas] input").first()).toHaveValue(String(11 * 60));
  });
});
