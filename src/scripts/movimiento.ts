// Movimiento de toda la página, con CSS y unas pocas líneas de JavaScript.
//
// - Revelados: cada [data-revelar] recibe .es-visible la primera vez que entra
//   en pantalla; movimiento.css define cada tipo (subir, desde un lado, la
//   lámpara, las barras, las filas del horario).
// - Profundidad: [data-profundidad] se desplaza un poco al hacer scroll y
//   [data-acercar] se acerca mientras se lee. Solo desde 900 px de ancho.
// - Cabecera: se oculta al bajar y vuelve al subir.
// - La temperatura del hero baja una vez de 100 a 87 °C.
//
// Con movimiento reducido (html sin .motion), todo está visible desde el
// principio y nada se mueve: este archivo solo deja la cabecera funcionando.

const raiz = document.documentElement;
const conMovimiento = () => raiz.classList.contains("motion");

function revelados() {
  const elementos = [...document.querySelectorAll<HTMLElement>("[data-revelar]")];
  if (!("IntersectionObserver" in window)) {
    elementos.forEach((e) => e.classList.add("es-visible"));
    return;
  }
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.add("es-visible");
        observador.unobserve(entrada.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
  );
  elementos.forEach((e) => observador.observe(e));
}

function profundidad() {
  const ancho = matchMedia("(min-width: 900px)");
  const capas = [...document.querySelectorAll<HTMLElement>("[data-profundidad]")];
  const acercar = [...document.querySelectorAll<HTMLElement>("[data-acercar]")];
  let pendiente = false;

  const pintar = () => {
    pendiente = false;
    const activo = ancho.matches && conMovimiento();
    const alto = innerHeight;
    for (const capa of capas) {
      if (!activo) {
        capa.style.transform = "";
        continue;
      }
      const r = capa.getBoundingClientRect();
      if (r.bottom < -200 || r.top > alto + 200) continue;
      // -1 cuando su centro está abajo del todo, 1 cuando está arriba.
      const avance = (alto / 2 - (r.top + r.height / 2)) / alto;
      const factor = Number(capa.dataset.profundidad) || 0.06;
      capa.style.transform = `translate3d(0, ${(avance * factor * r.height).toFixed(1)}px, 0)`;
    }
    for (const el of acercar) {
      if (!activo) {
        el.style.transform = "";
        continue;
      }
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > alto) continue;
      const avance = Math.min(1, Math.max(0, (alto - r.top) / (alto + r.height)));
      el.style.transform = `scale(${(1.14 - avance * 0.14).toFixed(4)})`;
    }
  };
  const pedir = () => {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(pintar);
    }
  };
  addEventListener("scroll", pedir, { passive: true });
  addEventListener("resize", pedir);
  ancho.addEventListener("change", pedir);
  pintar();
}

function cabecera() {
  const cab = document.querySelector<HTMLElement>("[data-cabecera]");
  if (!cab) return;
  let anterior = scrollY;
  let pendiente = false;
  const pintar = () => {
    pendiente = false;
    const y = scrollY;
    cab.classList.toggle("con-fondo", y > 24);
    // Oculta al bajar (pasado el primer tramo); visible al subir o arriba del todo.
    if (Math.abs(y - anterior) > 6) {
      cab.classList.toggle("oculta", y > anterior && y > 160);
      anterior = y;
    }
  };
  addEventListener("scroll", () => {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(pintar);
    }
  }, { passive: true });
  // Con el foco dentro (teclado), la cabecera se queda visible.
  cab.addEventListener("focusin", () => cab.classList.remove("oculta"));
  pintar();
}

function temperatura() {
  const cifra = document.querySelector<HTMLElement>("[data-temperatura]");
  if (!cifra || !conMovimiento()) return;
  // Empieza cuando termina la entrada del titular (movimiento.css: 1,1 s).
  const desde = 100;
  const hasta = 87;
  const duracion = 1800;
  cifra.textContent = String(desde);
  window.setTimeout(() => {
    const inicio = performance.now();
    const paso = (t: number) => {
      const p = Math.min(1, (t - inicio) / duracion);
      const suave = 1 - Math.pow(1 - p, 3);
      cifra.textContent = String(Math.round(desde - (desde - hasta) * suave));
      if (p < 1) requestAnimationFrame(paso);
      else cifra.closest(".hero-temperatura")?.classList.add("es-final");
    };
    requestAnimationFrame(paso);
  }, 1100);
}

export function iniciarMovimiento() {
  cabecera();
  if (!conMovimiento()) return;
  revelados();
  profundidad();
  temperatura();
  // Si el visitante activa «reducir movimiento» con la página abierta: todo
  // visible y quieto al instante.
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) => {
    if (!e.matches) return;
    raiz.classList.remove("motion");
    document.querySelectorAll<HTMLElement>("[data-profundidad], [data-acercar]").forEach((el) => (el.style.transform = ""));
    const cifra = document.querySelector<HTMLElement>("[data-temperatura]");
    if (cifra) cifra.textContent = "87";
  });
}
