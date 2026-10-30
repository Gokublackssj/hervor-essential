// «Abierto ahora / Cerrado» y el día de hoy resaltado, en la hora de Bolivia.
// Se actualiza cada minuto.
import { horario, hhmm } from "../data/horario";
import { ahoraBolivia, diasSemana } from "./bolivia";

function estado(): { abierto: boolean; texto: string } {
  const a = ahoraBolivia();
  const hoy = horario[a.dia]!;
  if (a.min >= hoy.abre && a.min < hoy.cierra) {
    const pronto = hoy.cierra - a.min <= 60;
    return { abierto: true, texto: pronto ? `Abierto, cierra pronto: a las ${hhmm(hoy.cierra)}` : `Abierto ahora, cierra a las ${hhmm(hoy.cierra)}` };
  }
  if (a.min < hoy.abre) return { abierto: false, texto: `Cerrado, abre hoy a las ${hhmm(hoy.abre)}` };
  const manana = (a.dia + 1) % 7;
  return { abierto: false, texto: `Cerrado, abre mañana, ${diasSemana[manana]}, a las ${hhmm(horario[manana]!.abre)}` };
}

export function iniciarHorario() {
  const caja = document.querySelector<HTMLElement>("[data-estado]");
  const texto = document.querySelector<HTMLElement>("[data-estado-texto]");
  if (!caja || !texto) return;
  const filas = [...document.querySelectorAll<HTMLTableRowElement>("tr[data-dias]")];

  const pintar = () => {
    const e = estado();
    texto.textContent = e.texto;
    caja.dataset.abierto = String(e.abierto);
    const dia = ahoraBolivia().dia;
    for (const fila of filas) {
      const hoy = fila.dataset.dias!.split(",").map(Number).includes(dia);
      fila.classList.toggle("es-hoy", hoy);
      if (hoy) fila.setAttribute("aria-current", "date");
      else fila.removeAttribute("aria-current");
    }
  };
  pintar();
  window.setInterval(pintar, 60_000);
}
