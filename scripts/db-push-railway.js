// Aplica el esquema a la base en el arranque de Railway.
//
// `prisma db push` se frena, a propósito, ante cualquier cambio que PUEDA
// perder datos (borrar una columna, agregar un índice único...). Antes se
// arrancaba siempre con --accept-data-loss, o sea con permiso permanente para
// borrar datos de producción sin preguntar. Eso se sacó.
//
// Pero hay cambios que Prisma marca como riesgosos y no lo son -- agregar un
// índice único sobre una columna recién creada, por ejemplo: todas las filas
// quedan en NULL y no puede haber duplicados. Para esos casos existe este
// interruptor: se pone PRISMA_ACEPTAR_PERDIDA=1 en Railway, se despliega, y
// SE SACA. Que sea un acto explícito y visible es todo el punto.
const { spawnSync } = require("child_process");

const aceptar = process.env.PRISMA_ACEPTAR_PERDIDA === "1";
const args = ["prisma", "db", "push", "--skip-generate"];
if (aceptar) {
  args.push("--accept-data-loss");
  console.warn(
    "⚠️  PRISMA_ACEPTAR_PERDIDA=1: se aplican los cambios de esquema aunque Prisma avise " +
      "posible pérdida de datos. Sacá la variable de Railway después de este deploy."
  );
}

const r = spawnSync("npx", args, { stdio: "inherit", shell: process.platform === "win32" });
if (r.status !== 0) {
  console.error(
    "\nEl esquema no se aplicó. Si el aviso de arriba es un falso positivo (columna nueva, " +
      "índice sobre columna vacía), definí PRISMA_ACEPTAR_PERDIDA=1 en Railway para este " +
      "deploy y volvé a desplegar. Si dice que va a BORRAR una columna con datos, no lo hagas."
  );
  process.exit(r.status ?? 1);
}
