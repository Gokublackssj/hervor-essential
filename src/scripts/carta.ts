// Pestañas de la carta (patrón ARIA de pestañas con activación automática):
// clic o toque, flechas izquierda y derecha, Inicio y Fin. Al cambiar, la foto
// de la categoría se funde encima, el indicador se desliza bajo la pestaña y
// los productos entran en cascada.

export function iniciarCarta() {
  const lista = document.querySelector<HTMLElement>("[role='tablist']");
  if (!lista) return;
  const pestanas = [...lista.querySelectorAll<HTMLButtonElement>("[role='tab']")];
  const indicador = lista.querySelector<HTMLElement>("[data-indicador]");
  const fotos = [...document.querySelectorAll<HTMLElement>("[data-foto]")];
  const paneles = [...document.querySelectorAll<HTMLElement>("[data-panel]")];

  const moverIndicador = (pestana: HTMLElement) => {
    if (!indicador) return;
    indicador.style.width = `${pestana.offsetWidth}px`;
    indicador.style.transform = `translateX(${pestana.offsetLeft}px)`;
  };

  const elegir = (pestana: HTMLButtonElement, foco = false) => {
    const id = pestana.dataset.pestana!;
    if (pestana.getAttribute("aria-selected") === "true") return;
    for (const p of pestanas) {
      const activa = p === pestana;
      p.setAttribute("aria-selected", String(activa));
      p.tabIndex = activa ? 0 : -1;
    }
    if (foco) pestana.focus();
    // Quien elige una categoría ya está mirando la carta: si su revelado aún no
    // había ocurrido (pantallas bajas), se completa ahora.
    document.querySelectorAll("#carta [data-revelar]").forEach((e) => e.classList.add("es-visible"));
    // Si la fila de pestañas desborda (pantallas estrechas), la elegida queda a la vista.
    pestana.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    moverIndicador(pestana);
    for (const f of fotos) f.classList.toggle("es-activa", f.dataset.foto === id);
    for (const panel of paneles) {
      const activo = panel.dataset.panel === id;
      panel.hidden = !activo;
      if (activo) {
        // Forzar un reflow entre quitar y poner la clase reinicia la animación.
        panel.classList.remove("entrando");
        void panel.offsetWidth;
        panel.classList.add("entrando");
      }
    }
  };

  lista.addEventListener("click", (e) => {
    const pestana = (e.target as Element).closest<HTMLButtonElement>("[role='tab']");
    if (pestana) elegir(pestana);
  });

  lista.addEventListener("keydown", (e) => {
    const actual = pestanas.findIndex((p) => p === document.activeElement);
    if (actual < 0) return;
    const destino = { ArrowRight: actual + 1, ArrowLeft: actual - 1, Home: 0, End: pestanas.length - 1 }[e.key];
    if (destino === undefined) return;
    e.preventDefault();
    elegir(pestanas[(destino + pestanas.length) % pestanas.length]!, true);
  });

  const activa = () => pestanas.find((p) => p.getAttribute("aria-selected") === "true")!;
  moverIndicador(activa());
  new ResizeObserver(() => moverIndicador(activa())).observe(lista);
  document.fonts?.ready.then(() => moverIndicador(activa()));
  lista.classList.add("con-indicador");
}
