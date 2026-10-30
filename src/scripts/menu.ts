// Menú del móvil: un <dialog> modal a pantalla completa. Se cierra con el
// botón, con Escape o al elegir una sección (y entonces la página va a ella).
import { abrirModal, cerrarModal, prepararModal } from "./modal";

export function iniciarMenu() {
  const menu = document.querySelector<HTMLDialogElement>("[data-menu]");
  const abrir = document.querySelector<HTMLButtonElement>("[data-menu-abrir]");
  if (!menu || !abrir) return;

  prepararModal(menu, () => abrir.setAttribute("aria-expanded", "false"));
  abrir.setAttribute("aria-expanded", "false");
  abrir.addEventListener("click", () => {
    abrir.setAttribute("aria-expanded", "true");
    abrirModal(menu);
  });
  menu.querySelector("[data-menu-cerrar]")?.addEventListener("click", () => cerrarModal(menu));

  // Un enlace: cerrar al instante (sin animación) y dejar que el ancla
  // desplace la página, que ya no está bloqueada.
  menu.querySelectorAll<HTMLAnchorElement>("a[href^='#']").forEach((enlace) =>
    enlace.addEventListener("click", () => menu.close()),
  );
  // En fase de captura, para que el menú se cierre antes de que se abra la reserva.
  menu.querySelector("[data-abrir-reserva]")?.addEventListener("click", () => menu.close(), { capture: true });

  matchMedia("(min-width: 960px)").addEventListener("change", (e) => {
    if (e.matches && menu.open) menu.close();
  });
}
