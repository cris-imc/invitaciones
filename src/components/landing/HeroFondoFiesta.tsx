/**
 * Fondo animado del hero: luces que suben despacio, como una guirnalda
 * encendida en una fiesta.
 *
 * Server component puro, sin JavaScript en el cliente: son 18 spans con su
 * posición, tamaño y demora escritas en el HTML, y el resto lo hace una
 * animación CSS (ver .hero-fondo en globals.css). No hay canvas ni librería.
 *
 * Las posiciones son fijas y no aleatorias a propósito: con Math.random() el
 * servidor y el cliente dibujarían cosas distintas y React tiraría un error de
 * hidratación. Además así el resultado es siempre el mismo y se puede afinar a
 * ojo.
 *
 * Se anima sólo transform y opacity, que la GPU compone sin repintar. Quien
 * pidió menos movimiento en el sistema no ve las luces (queda el resplandor).
 */

// izq: % horizontal · tam: px · dur: segundos · demora: segundos · dx: cuánto
// se corre de costado mientras sube, para que no parezcan caer en línea recta.
const LUCES = [
  { izq: 4, tam: 7, dur: 15, demora: 0, dx: 22 },
  { izq: 11, tam: 4, dur: 19, demora: 3.5, dx: -16 },
  { izq: 17, tam: 10, dur: 22, demora: 7, dx: 30 },
  { izq: 23, tam: 5, dur: 17, demora: 1.5, dx: -10 },
  { izq: 29, tam: 8, dur: 25, demora: 9, dx: 18 },
  { izq: 35, tam: 3, dur: 14, demora: 5, dx: -24 },
  { izq: 41, tam: 11, dur: 27, demora: 11, dx: 12 },
  { izq: 47, tam: 5, dur: 18, demora: 2.5, dx: -18 },
  { izq: 53, tam: 7, dur: 21, demora: 8, dx: 26 },
  { izq: 59, tam: 4, dur: 16, demora: 12, dx: -14 },
  { izq: 65, tam: 9, dur: 24, demora: 4.5, dx: 20 },
  { izq: 71, tam: 6, dur: 20, demora: 10, dx: -22 },
  { izq: 77, tam: 3, dur: 15, demora: 6.5, dx: 16 },
  { izq: 83, tam: 10, dur: 26, demora: 13, dx: -12 },
  { izq: 89, tam: 5, dur: 18, demora: 2, dx: 24 },
  { izq: 95, tam: 8, dur: 23, demora: 8.5, dx: -20 },
  { izq: 14, tam: 6, dur: 28, demora: 14, dx: 14 },
  { izq: 68, tam: 4, dur: 29, demora: 16, dx: -26 },
];

export function HeroFondoFiesta() {
  return (
    <div className="hero-fondo" aria-hidden="true">
      {LUCES.map((l, i) => (
        <i
          key={i}
          style={{
            left: `${l.izq}%`,
            width: l.tam,
            height: l.tam,
            animationDuration: `${l.dur}s`,
            animationDelay: `-${l.demora}s`,
            ["--dx" as string]: `${l.dx}px`,
          }}
        />
      ))}
    </div>
  );
}
