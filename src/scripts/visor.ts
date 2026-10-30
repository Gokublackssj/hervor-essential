// Visor sencillo de la galería: un <dialog> modal con la foto grande, su
// descripción, «2 de 4», anterior y siguiente (botones, flechas del teclado o
// deslizando con el dedo) y cierre con Escape, el botón o un toque en el
// fondo. Al cerrar, el foco vuelve a la foto desde la que se abrió.
import { abrirModal, cerrarModal, prepararModal } from "./modal";

export function iniciarVisor() {
  const visor = document.querySelector<HTMLDialogElement>("[data-visor]");
  const enlaces = [...document.querySelectorAll<HTMLAnchorElement>("[data-visor-abrir]")];
  if (!visor || !enlaces.length) return;
  const imagen = visor.querySelector<HTMLImageElement>("[data-visor-imagen]")!;
  const texto = visor.querySelector<HTMLElement>("[data-visor-texto]")!;
  const contador = visor.querySelector<HTMLElement>("[data-visor-contador]")!;
  let actual = 0;
  let origen: HTMLElement | null = null;

  const mostrar = (i: number) => {
    actual = (i + enlaces.length) % enlaces.length;
    const e = enlaces[actual]!;
    imagen.classList.add("cargando");
    imagen.onload = () => imagen.classList.remove("cargando");
    imagen.srcset = e.dataset.srcset ?? "";
    imagen.src = e.dataset.grande ?? e.href;
    imagen.alt = e.dataset.alt ?? "";
    texto.textContent = e.dataset.alt ?? "";
    contador.textContent = `${actual + 1} de ${enlaces.length}`;
    if (imagen.complete) imagen.classList.remove("cargando");
  };

  prepararModal(visor, () => origen?.focus());

  enlaces.forEach((e, i) =>
    e.addEventListener("click", (ev) => {
      ev.preventDefault();
      origen = e;
      mostrar(i);
      abrirModal(visor);
      visor.querySelector<HTMLButtonElement>("[data-visor-siguiente]")?.focus();
    }),
  );
  visor.querySelector("[data-visor-cerrar]")?.addEventListener("click", () => cerrarModal(visor));
  visor.querySelector("[data-visor-anterior]")?.addEventListener("click", () => mostrar(actual - 1));
  visor.querySelector("[data-visor-siguiente]")?.addEventListener("click", () => mostrar(actual + 1));
  visor.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") mostrar(actual - 1);
    if (e.key === "ArrowRight") mostrar(actual + 1);
  });

  // Deslizar: un gesto horizontal de más de 50 px cambia de foto.
  let inicioX: number | null = null;
  const figura = visor.querySelector<HTMLElement>(".visor-figura")!;
  figura.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") inicioX = e.clientX;
  });
  figura.addEventListener("pointerup", (e) => {
    if (inicioX === null) return;
    const dx = e.clientX - inicioX;
    inicioX = null;
    if (Math.abs(dx) > 50) mostrar(actual + (dx < 0 ? 1 : -1));
  });
  figura.addEventListener("pointercancel", () => (inicioX = null));
}
