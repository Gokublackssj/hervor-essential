// Reserva de demostración en cuatro pasos (marcado en Reserva.astro). Todo
// ocurre en el navegador: no se envía nada, y el mensaje final solo se puede
// copiar. Las horas salen del horario real de la demo, en hora de Bolivia.
import { horario, hhmm, reserva as reglas } from "../data/horario";
import { ahoraBolivia, diasSemana, meses, sumarDias, type Fecha } from "./bolivia";
import { abrirModal, cerrarModal, prepararModal } from "./modal";

type Dia = Fecha & { horas: number[] };

const PASOS = 4;

/** Las horas que se pueden reservar ese día; si es hoy, solo las que aún no han pasado. */
function horasDe(f: Fecha, hoy: boolean, ahoraMin: number): number[] {
  const { abre, cierra } = horario[f.dia]!;
  const horas: number[] = [];
  for (let m = abre; m <= cierra - reglas.margenCierre; m += reglas.intervalo) {
    if (!hoy || m >= ahoraMin + reglas.antelacionMinima) horas.push(m);
  }
  return horas;
}

/** Una ficha de opción (radio) con una o dos líneas de texto. */
function ficha(nombre: string, valor: number, lineas: [string, string?], opciones: { marcada: boolean; desactivada?: boolean; clase?: string }) {
  const etiqueta = document.createElement("label");
  etiqueta.className = opciones.clase ? `ficha ${opciones.clase}` : "ficha";
  const entrada = document.createElement("input");
  entrada.type = "radio";
  entrada.name = nombre;
  entrada.value = String(valor);
  entrada.checked = opciones.marcada;
  entrada.disabled = Boolean(opciones.desactivada);
  etiqueta.append(entrada);
  const [arriba, abajo] = lineas;
  const linea = (texto: string, clase?: string) => {
    const span = document.createElement("span");
    if (clase) span.className = clase;
    span.textContent = texto;
    etiqueta.append(span);
  };
  if (abajo === undefined) linea(arriba);
  else {
    linea(arriba, "ficha-arriba");
    linea(abajo, "ficha-abajo");
  }
  return etiqueta;
}

const fechaLarga = (f: Fecha) => `${diasSemana[f.dia]} ${f.d} de ${meses[f.m - 1]}`;
const esCorreo = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const esTelefono = (v: string) => /^[+()\d\s-]+$/.test(v) && v.replace(/\D/g, "").length >= 7 && v.replace(/\D/g, "").length <= 15;

export function iniciarReserva() {
  const dialogo = document.querySelector<HTMLDialogElement>("[data-reserva]");
  const form = document.querySelector<HTMLFormElement>("[data-reserva-form]");
  if (!dialogo || !form) return;

  const $ = <T extends Element>(sel: string) => form.querySelector<T>(sel)!;
  const etapas = [...form.querySelectorAll<HTMLElement>("[data-etapa]")];
  const cajaDias = $<HTMLElement>("[data-dias]");
  const cajaHoras = $<HTMLElement>("[data-horas]");
  const ayudaHoras = $<HTMLElement>("[data-horas-ayuda]");
  const personas = $<HTMLInputElement>("[data-personas-valor]");
  const nombre = $<HTMLInputElement>("[data-campo='nombre']");
  const contacto = $<HTMLInputElement>("[data-campo='contacto']");
  const notas = $<HTMLTextAreaElement>("[data-campo='notas']");
  const resumen = $<HTMLElement>("[data-resumen]");
  const mensaje = $<HTMLTextAreaElement>("[data-mensaje]");
  const copiado = $<HTMLElement>("[data-copiado]");
  const textoPaso = $<HTMLElement>("[data-reserva-paso]");
  const barra = $<HTMLElement>("[data-reserva-barra]");
  const atras = $<HTMLButtonElement>("[data-reserva-atras]");
  const siguiente = $<HTMLButtonElement>("[data-reserva-siguiente]");
  const copiar = $<HTMLButtonElement>("[data-copiar]");
  const whatsapp = $<HTMLButtonElement>("[data-whatsapp]");

  let paso = 1;
  let dias: Dia[] = [];
  let dia = -1;
  let hora = -1;

  // ---- Paso 1: días, horas y personas.
  const pintarDias = () => {
    const a = ahoraBolivia();
    dias = Array.from({ length: 7 }, (_, i) => {
      const f = sumarDias(a, i);
      return { ...f, horas: horasDe(f, i === 0, a.min) };
    });
    if (dia >= 0 && !dias[dia]?.horas.length) dia = -1;
    if (dia < 0) dia = dias.findIndex((d) => d.horas.length > 0);
    cajaDias.replaceChildren(
      ...dias.map((d, i) => {
        const nombreDia = i === 0 ? "Hoy" : i === 1 ? "Mañana" : diasSemana[d.dia]!.slice(0, 3);
        const sinHoras = d.horas.length === 0;
        const etiqueta = ficha("dia", i, [nombreDia, sinHoras ? "Sin horas" : `${d.d} ${meses[d.m - 1]!.slice(0, 3)}`], {
          marcada: i === dia,
          desactivada: sinHoras,
          clase: "ficha--dia",
        });
        etiqueta.style.setProperty("--i", String(i));
        return etiqueta;
      }),
    );
    pintarHoras();
  };

  const pintarHoras = () => {
    const d = dias[dia];
    if (!d) {
      cajaHoras.replaceChildren();
      ayudaHoras.textContent = "";
      return;
    }
    if (!d.horas.includes(hora)) hora = -1;
    const { abre, cierra } = horario[d.dia]!;
    ayudaHoras.textContent = `(abierto de ${hhmm(abre)} a ${hhmm(cierra)}; última reserva una hora antes de cerrar)`;
    cajaHoras.replaceChildren(
      ...d.horas.map((m, i) => {
        const etiqueta = ficha("hora", m, [hhmm(m)], { marcada: m === hora });
        etiqueta.style.setProperty("--i", String(Math.min(i, 12)));
        return etiqueta;
      }),
    );
    cajaHoras.classList.remove("entrando");
    void cajaHoras.offsetWidth;
    cajaHoras.classList.add("entrando");
  };

  cajaDias.addEventListener("change", (e) => {
    dia = Number((e.target as HTMLInputElement).value);
    pintarHoras();
  });
  cajaHoras.addEventListener("change", (e) => {
    hora = Number((e.target as HTMLInputElement).value);
    mostrarError("hora", "");
  });

  const fijarPersonas = (n: number) => {
    const valor = Math.min(reglas.personasMax, Math.max(1, Math.round(n) || 1));
    personas.value = String(valor);
    form.querySelector<HTMLButtonElement>("[data-personas='-1']")!.disabled = valor <= 1;
    form.querySelector<HTMLButtonElement>("[data-personas='1']")!.disabled = valor >= reglas.personasMax;
  };
  form.querySelectorAll<HTMLButtonElement>("[data-personas]").forEach((b) =>
    b.addEventListener("click", () => fijarPersonas(Number(personas.value) + Number(b.dataset.personas))),
  );
  personas.addEventListener("change", () => fijarPersonas(Number(personas.value)));

  // ---- Errores junto a cada campo.
  const mostrarError = (campo: string, texto: string) => {
    const caja = form.querySelector<HTMLElement>(`[data-error='${campo}']`)!;
    caja.textContent = texto;
    caja.hidden = !texto;
    const entrada = form.querySelector<HTMLInputElement>(`[data-campo='${campo}']`);
    if (entrada) {
      if (texto) entrada.setAttribute("aria-invalid", "true");
      else entrada.removeAttribute("aria-invalid");
    }
  };
  nombre.addEventListener("input", () => nombre.getAttribute("aria-invalid") && validarDatos(false));
  contacto.addEventListener("input", () => contacto.getAttribute("aria-invalid") && validarDatos(false));

  const validarCuando = () => {
    if (dia < 0 || hora < 0) {
      mostrarError("hora", dia < 0 ? "No quedan horas libres esta semana." : "Elige una hora.");
      (cajaHoras.querySelector("input") ?? cajaDias.querySelector("input"))?.focus();
      return false;
    }
    return true;
  };

  function validarDatos(enfocar = true) {
    const n = nombre.value.trim();
    const c = contacto.value.trim();
    const errorNombre = n.length < 2 ? "Escribe tu nombre (al menos dos letras)." : "";
    const errorContacto = !c
      ? "Escribe un teléfono o un correo para poder responderte."
      : !(esCorreo(c) || esTelefono(c))
        ? "Revisa el dato: un teléfono de 7 a 15 cifras o un correo como nombre@correo.com."
        : "";
    mostrarError("nombre", errorNombre);
    mostrarError("contacto", errorContacto);
    if (enfocar) (errorNombre ? nombre : errorContacto ? contacto : null)?.focus();
    return !errorNombre && !errorContacto;
  }

  // ---- Resumen y mensaje.
  const datos = () => {
    const d = dias[dia]!;
    const n = Number(personas.value);
    return {
      fecha: fechaLarga(d),
      hora: hhmm(hora),
      personas: `${n} ${n === 1 ? "persona" : "personas"}`,
      nombre: nombre.value.trim(),
      contacto: contacto.value.trim(),
      notas: notas.value.trim(),
    };
  };

  const pintarResumen = () => {
    const x = datos();
    const filas: [string, string][] = [
      ["Día", x.fecha],
      ["Hora", x.hora],
      ["Mesa para", x.personas],
      ["A nombre de", x.nombre],
      ["Contacto", x.contacto],
    ];
    if (x.notas) filas.push(["Nota", x.notas]);
    resumen.replaceChildren(
      ...filas.flatMap(([k, v], i) => {
        const fila = document.createElement("div");
        fila.style.setProperty("--i", String(i));
        const dt = document.createElement("dt");
        dt.textContent = k;
        const dd = document.createElement("dd");
        dd.textContent = v;
        fila.append(dt, dd);
        return fila;
      }),
    );
  };

  const pintarMensaje = () => {
    const x = datos();
    mensaje.value = [
      `Hola, Hervor. Quisiera reservar una mesa para ${x.personas} el ${x.fecha} a las ${x.hora}.`,
      `Nombre: ${x.nombre}`,
      `Contacto: ${x.contacto}`,
      ...(x.notas ? [`Nota: ${x.notas}`] : []),
      "¡Gracias!",
    ].join("\n");
    copiado.textContent = "";
  };

  // ---- Navegación entre pasos.
  const irA = (n: number) => {
    paso = n;
    etapas.forEach((e) => {
      const activa = Number(e.dataset.etapa) === n;
      e.hidden = !activa;
      if (activa) {
        e.classList.remove("entrando");
        void e.offsetWidth;
        e.classList.add("entrando");
      }
    });
    textoPaso.textContent = `Paso ${n} de ${PASOS}`;
    barra.style.transform = `scaleX(${n / PASOS})`;
    atras.hidden = n === 1;
    siguiente.hidden = n === PASOS;
    siguiente.textContent = n === 3 ? "Preparar el mensaje" : "Continuar";
    copiar.hidden = whatsapp.hidden = n !== PASOS;
    // El foco va al título del paso, para que se anuncie y se pueda seguir.
    const titulo = etapas[n - 1]!.querySelector<HTMLElement>(".reserva-etapa-titulo")!;
    titulo.tabIndex = -1;
    titulo.focus({ preventScroll: true });
    form.scrollTop = 0;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (paso === 1 && !validarCuando()) return;
    if (paso === 2 && !validarDatos()) return;
    if (paso === 2) pintarResumen();
    if (paso === 3) pintarMensaje();
    if (paso < PASOS) irA(paso + 1);
  });
  atras.addEventListener("click", () => irA(Math.max(1, paso - 1)));

  copiar.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(mensaje.value);
      copiado.textContent = "Mensaje copiado. Recuerda: en esta demo no se ha enviado nada.";
    } catch {
      mensaje.focus();
      mensaje.select();
      copiado.textContent = "No se pudo copiar automáticamente: el texto está seleccionado para que lo copies.";
    }
  });

  // ---- Abrir y cerrar.
  prepararModal(dialogo);
  form.querySelector("[data-reserva-cerrar]")!.addEventListener("click", () => cerrarModal(dialogo));
  document.querySelectorAll<HTMLButtonElement>("[data-abrir-reserva]").forEach((b) =>
    b.addEventListener("click", () => {
      // Los días y las horas se recalculan al abrir: el tiempo pasa.
      pintarDias();
      fijarPersonas(Number(personas.value));
      mostrarError("hora", "");
      abrirModal(dialogo);
      irA(1);
    }),
  );
}
