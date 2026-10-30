import type { ImageMetadata } from "astro";
import espresso from "../assets/fotos/menu-espresso.jpg";
import leche from "../assets/fotos/menu-leche.jpg";
import filtrado from "../assets/fotos/menu-filtrado.jpg";
import reposteria from "../assets/fotos/menu-reposteria.jpg";

// La carta: cuatro categorías de cuatro productos. Nombres, descripciones y
// precios son ficticios (demo de un negocio inventado). Precios en bolivianos.
export type Producto = { nombre: string; precio: number; descripcion: string };
export type Categoria = {
  id: string;
  nombre: string;
  /** Una línea sobre cómo la altura cambia esta categoría. */
  altura: string;
  foto: ImageMetadata;
  alt: string;
  /** Encuadre de la foto (object-position). */
  encuadre?: string;
  productos: Producto[];
};

export const carta: Categoria[] = [
  {
    id: "espresso",
    nombre: "Espresso",
    altura: "Molemos un punto más fino que a nivel del mar: con agua más fría, el café necesita más superficie para dar todo su sabor.",
    foto: espresso,
    alt: "Un espresso con crema dorada en un vaso de vidrio, sobre una mesa negra",
    encuadre: "50% 60%",
    productos: [
      { nombre: "Espresso de altura", precio: 12, descripcion: "Caranavi lavado, molido más fino para el agua de Potosí. Cacao amargo y panela." },
      { nombre: "Doble ristretto", precio: 15, descripcion: "Dos extracciones cortas: cuerpo denso y final de nuez." },
      { nombre: "Americano largo", precio: 14, descripcion: "Espresso alargado con agua caliente; limpio, sin amargor quemado." },
      { nombre: "Cortado", precio: 15, descripcion: "Espresso con un dedo de leche texturizada." },
    ],
  },
  {
    id: "con-leche",
    nombre: "Con leche",
    altura: "La leche se texturiza a 60 °C, como en cualquier sitio; el espresso de base ya viene ajustado a la altura.",
    foto: leche,
    alt: "Un capuchino con arte latte en forma de hoja, visto desde arriba sobre granos de café",
    encuadre: "50% 45%",
    productos: [
      { nombre: "Capuchino Hervor", precio: 18, descripcion: "Espuma fina y densa; canela de la casa si la pides." },
      { nombre: "Flat white", precio: 19, descripcion: "Doble ristretto y leche sedosa, con poca espuma." },
      { nombre: "Latte de panela", precio: 20, descripcion: "Espresso, leche y panela fundida: dulce sin azúcar refinado." },
      { nombre: "Mocachino de cacao amazónico", precio: 22, descripcion: "Cacao boliviano al 70 %, espresso y leche." },
    ],
  },
  {
    id: "filtrados",
    nombre: "Filtrados",
    altura: "Alargamos el contacto: tres minutos y medio en lugar de tres, para que el agua a 87 °C saque lo que a 94 °C saldría antes.",
    foto: filtrado,
    alt: "Agua cayendo de una tetera de cuello largo sobre un filtro de café, con luz cálida",
    encuadre: "50% 50%",
    productos: [
      { nombre: "V60 del día", precio: 24, descripcion: "Un origen boliviano distinto cada semana, preparado a mano." },
      { nombre: "Chemex para dos", precio: 42, descripcion: "Taza limpia y brillante; se prepara y se sirve en la mesa." },
      { nombre: "Prensa francesa", precio: 22, descripcion: "Cinco minutos de infusión para un cuerpo pleno." },
      { nombre: "Cold brew de 18 horas", precio: 20, descripcion: "Extraído en frío: el único de la carta al que la altura no le afecta." },
    ],
  },
  {
    id: "reposteria",
    nombre: "Repostería",
    altura: "Horneamos cada mañana. A esta altura la masa sube más rápido, así que la dejamos fermentar en frío durante la noche.",
    foto: reposteria,
    alt: "Dos croissants dorados sobre una pizarra oscura, con azúcar glas cayendo",
    encuadre: "50% 70%",
    productos: [
      { nombre: "Croissant de mantequilla", precio: 14, descripcion: "Hojaldre de tres días, horneado cada mañana." },
      { nombre: "Cuñapé recién horneado", precio: 10, descripcion: "Pan de queso y almidón de yuca, tibio." },
      { nombre: "Tarta de quinua y chocolate", precio: 18, descripcion: "Quinua real del altiplano, chocolate amargo y un toque de sal." },
      { nombre: "Alfajor de maicena", precio: 8, descripcion: "Dulce de leche y coco rallado." },
    ],
  },
];
