// Avisos breves en la parte inferior: los enlaces que en un sitio real irían a
// un mapa o a un teléfono explican que aquí están desactivados.
let temporizador = 0;

function avisar(texto: string) {
  const caja = document.querySelector<HTMLElement>("[data-aviso]");
  if (!caja) return;
  caja.textContent = texto;
  caja.classList.add("es-visible");
  window.clearTimeout(temporizador);
  temporizador = window.setTimeout(() => caja.classList.remove("es-visible"), 5000);
}

const mensajes: Record<string, string> = {
  mapa: "Demo: en un sitio real, este botón abriría la ubicación en el mapa. La dirección de Hervor es inventada.",
  llamar: "Demo: el teléfono de Hervor es inventado, así que no se marca ningún número.",
};

export function iniciarAvisos() {
  document.querySelectorAll<HTMLButtonElement>("[data-demo]").forEach((boton) =>
    boton.addEventListener("click", () => avisar(mensajes[boton.dataset.demo!] ?? "")),
  );
}
