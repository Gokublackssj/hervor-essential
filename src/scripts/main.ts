import { iniciarMovimiento } from "./movimiento";
import { iniciarMenu } from "./menu";
import { iniciarCarta } from "./carta";
import { iniciarVisor } from "./visor";
import { iniciarHorario } from "./horario";
import { iniciarReserva } from "./reserva";
import { iniciarAvisos } from "./aviso";

// Señal para Base.astro: los scripts han cargado (si no llegan, la página
// quita los estados ocultos y se muestra entera).
document.documentElement.dataset.listo = "";

iniciarMovimiento();
iniciarMenu();
iniciarCarta();
iniciarVisor();
iniciarHorario();
iniciarReserva();
iniciarAvisos();
