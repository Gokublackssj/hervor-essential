// La hora de Potosí (America/La_Paz, UTC−4), sea cual sea la zona del
// visitante. Para probar otros momentos, la dirección acepta ?ahora=AAAA-MM-DDTHH:MM
// (hora de Bolivia), por ejemplo ?ahora=2026-11-01T13:45 para un domingo
// poco antes del cierre.
import { zona } from "../data/horario";

export type Fecha = { y: number; m: number; d: number; dia: number };
export type Ahora = Fecha & { min: number };

const semana: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function forzada(): Ahora | null {
  const valor = new URLSearchParams(location.search).get("ahora");
  const m = valor?.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [y, mes, d, h, min] = m.slice(1).map(Number) as [number, number, number, number, number];
  return { y, m: mes, d, dia: new Date(Date.UTC(y, mes - 1, d)).getUTCDay(), min: h * 60 + min };
}

export function ahoraBolivia(): Ahora {
  const f = forzada();
  if (f) return f;
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: zona,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  return {
    y: Number(partes.year),
    m: Number(partes.month),
    d: Number(partes.day),
    dia: semana[partes.weekday!] ?? 0,
    min: Number(partes.hour) * 60 + Number(partes.minute),
  };
}

/** El día que está `n` días después de `f`. */
export function sumarDias(f: Fecha, n: number): Fecha {
  const t = new Date(Date.UTC(f.y, f.m - 1, f.d + n));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), dia: t.getUTCDay() };
}

export const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
export const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
