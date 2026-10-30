# Hervor, café de altura

Demo conceptual del paquete **Essential** de [luisdataworks](https://gokublackssj.github.io/):
una web de una sola página para una cafetería **ficticia** de Potosí, Bolivia.

La idea del negocio: a 4.090 metros el agua hierve a unos 87 °C, por debajo del
rango habitual para preparar café, así que cada receta está ajustada a la altura.

> Hervor no existe. Nombre, carta, precios, horario, dirección y teléfono son
> inventados, y la página lo dice en la cabecera, la carta, Visítanos, la
> reserva y el pie. Ninguna reserva se envía.

## Funcionalidades

| Parte | Qué hace |
|---|---|
| Cabecera | Enlaces a cada sección; se oculta al bajar y vuelve al subir. Por debajo de 960 px, menú a pantalla completa (se cierra con Escape, el botón o un enlace). |
| Portada | Entrada en secuencia; la temperatura baja una vez de 100 a 87 °C. |
| Carta | Cuatro pestañas accesibles (clic, toque, flechas, Inicio y Fin) que cambian la foto, los cuatro productos con su precio y la nota sobre la altura. 16 productos. |
| Historia | Gráfica del punto de ebullición según la altitud (valores calculados y redondeados). |
| Galería | Mosaico de cuatro fotos y un visor sencillo: anterior y siguiente (botones, flechas o deslizando), cierre con Escape, el botón o el fondo. |
| Visítanos | «Abierto ahora / Cerrado» y el día de hoy, calculados en hora de Bolivia (`America/La_Paz`). «Cómo llegar» y «Llamar» muestran un aviso en lugar de abrir un mapa o marcar un número inventados. |
| Reserva | Cuatro pasos: día (próximos siete), hora (según el horario de ese día; hoy, solo las que aún no han pasado), personas (1 a 8); nombre y teléfono o correo, validados; resumen; y el mensaje de WhatsApp listo para copiar. |

Movimiento en toda la página (revelados de fotos, cascadas, barras, la lámpara
que «se enciende», una profundidad leve en escritorio), con CSS y unas líneas
de JavaScript. Con `prefers-reduced-motion: reduce` todo aparece completo y
quieto, y sin JavaScript la página también se ve entera.

## Alcance y limitaciones

- Es un sitio estático, solo de frontend: no hay servidor, base de datos ni
  formularios que envíen datos. La reserva prepara un mensaje y nada más; el
  botón de WhatsApp está desactivado porque el número sería inventado (y podría
  ser el de una persona real).
- No guarda nada en el navegador (ni cookies ni almacenamiento local) y no
  incluye analítica ni servicios de terceros.
- Solo en español.
- La página lleva `noindex` y `robots.txt` bloquea a los buscadores: un negocio
  que no existe no debe aparecer en los resultados.
- Queda fuera, porque corresponde a los paquetes superiores: galería avanzada
  (zoom, miniaturas, transiciones), varias páginas, formularios reales y
  animaciones guiadas por el desplazamiento.

## Tecnología

- [Astro](https://astro.build) 7, salida estática. TypeScript estricto.
- Tipografías Bodoni Moda y Hanken Grotesk, alojadas en el propio sitio
  (Fontsource).
- Fotografías locales; Astro genera AVIF y WebP en varios tamaños, con carga
  diferida salvo la portada.
- Sin frameworks de interfaz ni librerías de animación.
- Pruebas en el navegador con [Playwright Test](https://playwright.dev).

## Requisitos

- Node.js 22.23.4 o superior (lo exige Astro 7).
- Para las pruebas, Google Chrome instalado (o Edge, con `PW_CHANNEL=msedge`).
  No se descargan navegadores.

## Instalación y uso

```bash
npm install
npm run dev       # desarrollo en http://localhost:4321
npm run build     # comprueba los tipos (astro check) y construye en dist/
npm run preview   # sirve dist/ en http://localhost:4321
```

Para ver el horario en otro momento, añade a la dirección
`?ahora=AAAA-MM-DDTHH:MM` (hora de Bolivia). Por ejemplo,
`?ahora=2026-11-01T13:45` es un domingo poco antes del cierre: ya no quedan
horas para reservar ese día.

## Pruebas

```bash
npm run build
npm test
```

`npm test` sirve el sitio construido en el puerto 4322 (o reutiliza un
`astro preview` que ya esté ahí) y prueba en tres tamaños (1440 × 900,
390 × 844 y 320 × 640), con movimiento y con movimiento reducido:

- la página: carga sin errores en la consola, sin desbordamiento lateral, con
  el aviso de demo; las 13 fotos son locales, cargan y tienen texto
  alternativo; al recorrerla, todo queda visible;
- la navegación, el menú del móvil y los avisos de «Cómo llegar» y «Llamar»;
- la carta: pestañas con ratón y teclado, productos y precios;
- la galería: visor, navegación en círculo, Escape, foco;
- la reserva completa, incluida la validación, y que no hace ninguna petición
  al enviar;
- el horario en momentos concretos (abierto, cierra pronto, cerrado).

## Estructura

```
src/
  pages/index.astro       la página: el orden de las secciones
  layouts/Base.astro      <head>, fuentes y las clases js/motion antes de pintar
  components/             una sección por componente: Header, Hero, Casa, Carta,
                          Historia, Galeria, Visitanos, Reserva (el diálogo), Pie
  data/                   carta.ts (16 productos), horario.ts (horario, reservas,
                          dirección), fotos.ts (fotos y créditos)
  scripts/                main (arranque), movimiento, menu, carta, visor,
                          horario, reserva, aviso, modal (diálogos), bolivia (hora)
  styles/                 global.css importa, en orden, una hoja por sección y
                          al final movimiento.css
  assets/fotos/           las 13 fotografías originales
public/                   favicon y robots.txt
tests/                    pruebas de Playwright y sus ayudas
```

## Publicación

Pendiente de aprobación. `.github/workflows/deploy.yml` construye, ejecuta las
pruebas y publica en GitHub Pages. Solo se ejecuta a mano (Actions > Publicar >
Run workflow), con «GitHub Actions» elegido en Settings > Pages. Para un dominio
propio, construir con `SITE=https://dominio` y sin `BASE`.

## Créditos

Fotografías de Unsplash, con autor y enlace en [CREDITS.md](CREDITS.md) y en el
pie de la página. Diseño y desarrollo: luisdataworks.
