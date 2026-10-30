// Común a los tres <dialog> modales (menú, visor y reserva): bloquear el
// desplazamiento de la página mientras están abiertos, cerrar al pulsar el
// fondo y animar la salida antes de cerrar de verdad.
const reducido = () => !document.documentElement.classList.contains("motion");

// La salida en curso de cada diálogo, para cancelarla si se vuelve a abrir.
const salidas = new WeakMap<HTMLDialogElement, () => void>();

export function abrirModal(dialogo: HTMLDialogElement) {
  salidas.get(dialogo)?.();
  document.documentElement.classList.add("con-modal");
  dialogo.classList.remove("saliendo");
  if (!dialogo.open) dialogo.showModal();
}

export function cerrarModal(dialogo: HTMLDialogElement) {
  if (!dialogo.open || dialogo.classList.contains("saliendo")) return;
  if (reducido()) return dialogo.close();

  // La salida dura unos 200 ms (movimiento.css). Termina con el fin de la
  // animación del propio diálogo (no de sus hijos) o, si esa no llega, con el
  // temporizador; las dos vías se limpian para no cerrar una apertura posterior.
  const alTerminar = (e: AnimationEvent) => {
    if (e.target === dialogo) terminar();
  };
  const temporizador = window.setTimeout(() => terminar(), 280);
  const limpiar = () => {
    window.clearTimeout(temporizador);
    dialogo.removeEventListener("animationend", alTerminar);
    salidas.delete(dialogo);
  };
  const terminar = () => {
    limpiar();
    dialogo.classList.remove("saliendo");
    dialogo.close();
  };
  salidas.set(dialogo, () => {
    limpiar();
    dialogo.classList.remove("saliendo");
  });
  dialogo.addEventListener("animationend", alTerminar);
  dialogo.classList.add("saliendo");
}

export function prepararModal(dialogo: HTMLDialogElement, alCerrar?: () => void) {
  // Escape: la salida animada en lugar del cierre inmediato.
  dialogo.addEventListener("cancel", (e) => {
    e.preventDefault();
    cerrarModal(dialogo);
  });
  // Los clics en el fondo llegan al propio <dialog>, no a su contenido.
  dialogo.addEventListener("click", (e) => {
    if (e.target === dialogo) cerrarModal(dialogo);
  });
  dialogo.addEventListener("close", () => {
    if (!document.querySelector("dialog[open]")) document.documentElement.classList.remove("con-modal");
    alCerrar?.();
  });
}
