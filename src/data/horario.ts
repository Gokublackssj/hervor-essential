// Horario (ficticio) y datos de contacto inventados de la demo. Los usa la
// página al construirse y los scripts en el navegador (estado "abierto ahora"
// y horas de reserva), así que hay una sola fuente.

/** Zona horaria de Potosí, Bolivia (UTC−4, sin horario de verano). */
export const zona = "America/La_Paz";

/** Apertura y cierre en minutos desde medianoche, por día (0 = domingo). */
export const horario: Record<number, { abre: number; cierra: number }> = {
  0: { abre: 9 * 60, cierra: 14 * 60 },
  1: { abre: 7 * 60, cierra: 20 * 60 },
  2: { abre: 7 * 60, cierra: 20 * 60 },
  3: { abre: 7 * 60, cierra: 20 * 60 },
  4: { abre: 7 * 60, cierra: 20 * 60 },
  5: { abre: 7 * 60, cierra: 20 * 60 },
  6: { abre: 8 * 60, cierra: 21 * 60 },
};

/** Filas de la tabla de horario, en orden de lectura. */
export const filas = [
  { dias: [1, 2, 3, 4, 5], nombre: "Lunes a viernes" },
  { dias: [6], nombre: "Sábado" },
  { dias: [0], nombre: "Domingo" },
];

/** Reservas: cada 30 minutos, la última una hora antes de cerrar. */
export const reserva = { intervalo: 30, margenCierre: 60, antelacionMinima: 30, personasMax: 8 };

export const hhmm = (min: number) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}`;

// Dirección inventada: no corresponde a ninguna calle real y no enlaza a un
// mapa. El teléfono tampoco es real y no se marca.
export const direccion = { calle: "Calle de los Tostadores 87", zona: "Casco histórico, Potosí, Bolivia" };
