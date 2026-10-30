import type { ImageMetadata } from "astro";
import hero from "../assets/fotos/hero.jpg";
import casa from "../assets/fotos/casa.jpg";
import grano from "../assets/fotos/historia-grano.jpg";
import oficio from "../assets/fotos/historia-oficio.jpg";
import vapor from "../assets/fotos/galeria-vapor.jpg";
import dos from "../assets/fotos/galeria-dos.jpg";
import chemex from "../assets/fotos/galeria-chemex.jpg";
import saco from "../assets/fotos/galeria-saco.jpg";
import visita from "../assets/fotos/visita.jpg";

// Fotografías de Unsplash ("Free to use under the Unsplash License",
// comprobado en la página de cada una). Ninguna muestra el negocio: es un
// negocio ficticio. Créditos completos en CREDITS.md y en el pie.
export const fotos = { hero, casa, grano, oficio, visita };

export type FotoGaleria = { src: ImageMetadata; alt: string; encuadre?: string };

export const galeria: FotoGaleria[] = [
  { src: vapor, alt: "Una máquina de espresso entre vapor, con dos portafiltros listos", encuadre: "40% 50%" },
  { src: dos, alt: "Dos espressos cayendo a la vez en vasos de vidrio" },
  { src: chemex, alt: "Un Chemex con filtro de papel mientras se vierte agua de una tetera", encuadre: "50% 40%" },
  { src: saco, alt: "Granos de café tostado desbordando un saco de yute" },
];

export type Credito = { uso: string; autor: string; perfil: string; foto: string };

// El orden es el de la página.
export const creditos: Credito[] = [
  { uso: "Portada", autor: "Cemrecan Yurtman", perfil: "cmrcn_", foto: "XXLXQYrKuqo" },
  { uso: "La casa", autor: "Elist Nguyen", perfil: "hieuanhcauam", foto: "YISEqk2Zbq4" },
  { uso: "Carta: espresso", autor: "Nathan Dumlao", perfil: "nate_dumlao", foto: "QxL6R8_bQ_4" },
  { uso: "Carta: con leche", autor: "Ahmet Yüksek", perfil: "ahmetyuksek", foto: "bhbirk_C4-w" },
  { uso: "Carta: filtrados", autor: "Beau Carpenter", perfil: "btcarpenter", foto: "KGR2u2rG6c4" },
  { uso: "Carta: repostería", autor: "Mae Mu", perfil: "picoftasty", foto: "m9pzwmxm2rk" },
  { uso: "Historia: el grano", autor: "blackieshoot", perfil: "blackieshoot", foto: "vimMDduzk_k" },
  { uso: "Historia: el oficio", autor: "Charmoré Nel", perfil: "chamie88", foto: "xLN3w7kf0sQ" },
  { uso: "Galería", autor: "Krists Luhaers", perfil: "kristsll", foto: "EI50hwMVp28" },
  { uso: "Galería", autor: "Kevin Butz", perfil: "kevin_butz", foto: "BBFRIGifYQ8" },
  { uso: "Galería", autor: "Eiliv Aceron", perfil: "shootdelicious", foto: "XP5zW2ngk9w" },
  { uso: "Galería", autor: "Tina Guina", perfil: "kittinskie", foto: "obV_LM0KjxY" },
  { uso: "Visítanos", autor: "Kobe Kian Clata", perfil: "kobe007", foto: "mNAS4KzVamU" },
];
