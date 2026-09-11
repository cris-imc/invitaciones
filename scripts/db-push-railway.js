// Aplica el esquema a la base en el arranque de Railway.
//
// `prisma db push` se frena, a propósito, ante cualquier cambio que PUEDA
// perder datos. Antes se arrancaba siempre con --accept-data-loss, o sea con
// permiso permanente para borrar columnas de producción sin preguntar. Eso se
// sacó y no vuelve.
//
// Pero Prisma no distingue entre "vas a borrar una columna con datos" y
// "vas a agregar un índice único sobre una columna que acabás de crear". Las
// dos las reporta como posible pérdida de datos, y la segunda es inofensiva:
// la columna nueva nace vacía, no puede haber duplicados. Frenar el deploy
// por eso -- y obligar a alguien a ir a Railway a poner una variable -- es
// fricción sin ninguna protección a cambio.
//
// Así que: se intenta sin el flag. Si falla SÓLO por avisos de esa clase, se
// vuelve a correr aceptándolos. Si algún aviso habla de borrar o alterar
// algo, se frena y se explica. PRISMA_ACEPTAR_PERDIDA=1 sigue existiendo como
// llave manual para ese caso, cuando alguien ya leyó el aviso y decidió.
const { spawnSync } = require("child_process");

const ARGS = ["prisma", "db", "push", "--skip-generate"];

/** Los avisos que se pueden aceptar sin mirar dos veces. */
const AVISOS_INOFENSIVOS = [
  // "A unique constraint covering the columns `[x]` on the table `T` will be
  // added. If there are existing duplicate values, this will fail." -- si
  // hubiera duplicados, falla el push, no se pierde nada.
  /unique constraint .* will be added/i,
];

/**
 * Lee la salida de `db push` y decide si TODOS los avisos son inofensivos.
 * Devuelve la lista de avisos que no lo son (vacía = se puede aceptar).
 */
function avisosPeligrosos(salida) {
  return salida
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("•"))
    .map((l) => l.replace(/^•\s*/, ""))
    .filter((aviso) => !AVISOS_INOFENSIVOS.some((re) => re.test(aviso)));
}

function correr(extra) {
  const r = spawnSync("npx", [...ARGS, ...extra], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  const salida = (r.stdout || "") + (r.stderr || "");
  process.stdout.write(salida);
  return { ok: r.status === 0, salida };
}

if (require.main === module) {
  const forzado = process.env.PRISMA_ACEPTAR_PERDIDA === "1";

  if (forzado) {
    console.warn(
      "⚠️  PRISMA_ACEPTAR_PERDIDA=1: se aplican los cambios de esquema aunque Prisma avise " +
        "posible pérdida de datos. Sacá la variable de Railway después de este deploy."
    );
    process.exit(correr(["--accept-data-loss"]).ok ? 0 : 1);
  }

  const primero = correr([]);
  if (primero.ok) process.exit(0);

  if (!/data loss/i.test(primero.salida)) {
    // Falló por otra cosa (conexión, esquema inválido): no hay nada que aceptar.
    process.exit(1);
  }

  const peligrosos = avisosPeligrosos(primero.salida);
  if (peligrosos.length > 0) {
    console.error(
      "\n⛔ El esquema no se aplicó porque hay cambios que SÍ pueden perder datos:\n" +
        peligrosos.map((a) => "   • " + a).join("\n") +
        "\n\nRevisalos. Si de verdad querés aplicarlos, definí PRISMA_ACEPTAR_PERDIDA=1 en " +
        "Railway para este deploy y sacala después."
    );
    process.exit(1);
  }

  console.log(
    "\nℹ️  Los únicos avisos son índices únicos sobre columnas nuevas, que no pueden perder " +
      "datos. Se aplican."
  );
  process.exit(correr(["--accept-data-loss"]).ok ? 0 : 1);
}

module.exports = { avisosPeligrosos };
