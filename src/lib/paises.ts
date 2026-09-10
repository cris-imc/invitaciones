/**
 * Definición de los datos bancarios que se piden por país para que los
 * invitados puedan transferirle un regalo o pagar la tarjeta al anfitrión.
 *
 * Este archivo es sólo la definición + validación. No está conectado a
 * StepBankDetails.tsx todavía: falta que otra persona reemplace los campos
 * fijos de CBU/Alias por una selección dinámica según `CodigoPais`.
 */

export type CodigoPais = "AR" | "UY" | "CO" | "MX" | "ES" | "US";

/** Cómo validar el valor que carga el usuario en un campo bancario. */
export type ValidacionCampo =
    | { tipo: "digitos"; longitud: number }
    | { tipo: "digitos-rango"; min: number; max: number }
    | { tipo: "texto-libre" }
    | { tipo: "email" }
    | { tipo: "opciones"; valores: readonly string[] }
    | { tipo: "regex"; patron: RegExp; mensajeError: string };

export interface CampoBancario {
    /** Clave estable para guardar el valor (ej. en el store del wizard). No cambia aunque cambie la etiqueta. */
    clave: string;
    /** Lo que ve el usuario. */
    etiqueta: string;
    /** Ejemplo realista para el placeholder del input. */
    placeholder: string;
    obligatorio: boolean;
    validacion: ValidacionCampo;
    /** Texto de ayuda corto, sólo cuando el campo no es autoexplicativo (ej. qué es una CLABE). */
    ayuda?: string;
}

export interface Moneda {
    /** Código ISO 4217. */
    codigo: string;
    simbolo: string;
}

export interface DefinicionPais {
    codigo: CodigoPais;
    nombre: string;
    moneda: Moneda;
    /** Código telefónico internacional, con el signo "+". */
    codigoTelefonico: string;
    camposBancarios: CampoBancario[];
}

export const PAISES: Record<CodigoPais, DefinicionPais> = {
    AR: {
        codigo: "AR",
        nombre: "Argentina",
        moneda: { codigo: "ARS", simbolo: "$" },
        codigoTelefonico: "+54",
        camposBancarios: [
            {
                clave: "cbu",
                etiqueta: "CBU o CVU",
                placeholder: "0000003100010000000001",
                // En Argentina el alias reemplaza al CBU/CVU para transferir: pedir
                // los dos sí o sí dejaría afuera a las invitaciones ya publicadas que
                // sólo cargaron el alias, y sus links ya están en manos de los
                // invitados. Ninguno de los dos es obligatorio por separado; que haya
                // al menos uno lo exige el formulario (ver StepBankDetails.tsx).
                obligatorio: false,
                validacion: { tipo: "digitos", longitud: 22 },
                ayuda:
                    "El CBU (Clave Bancaria Uniforme) identifica una cuenta bancaria; el CVU (Clave Virtual Uniforme) identifica una cuenta en una billetera virtual como Mercado Pago o Ualá. Ambos tienen 22 números.",
            },
            {
                clave: "alias",
                etiqueta: "Alias",
                placeholder: "juan.perez.mp",
                obligatorio: false,
                // Regla verificada en la ficha oficial de Alias CBU del BCRA: 6 a 20
                // caracteres, letras (sin distinguir mayúsculas), números, "." y "-".
                validacion: {
                    tipo: "regex",
                    patron: /^[A-Za-z0-9.-]{6,20}$/,
                    mensajeError:
                        "El alias tiene que tener entre 6 y 20 caracteres, y sólo puede usar letras, números, puntos y guiones (sin espacios).",
                },
                ayuda: "Reemplaza al CBU/CVU para transferir más fácil. Lo configurás en tu banco o billetera virtual.",
            },
        ],
    },
    UY: {
        codigo: "UY",
        nombre: "Uruguay",
        moneda: { codigo: "UYU", simbolo: "$" },
        codigoTelefonico: "+598",
        camposBancarios: [
            {
                clave: "banco",
                etiqueta: "Banco",
                placeholder: "BROU",
                obligatorio: true,
                validacion: { tipo: "texto-libre" },
            },
            {
                clave: "numeroCuenta",
                etiqueta: "Número de cuenta",
                placeholder: "00001234500002",
                obligatorio: true,
                // Sólo pude verificar el formato de BROU (banco estatal): 14 dígitos
                // (9 de cuenta + 5 de subcuenta), completando con ceros a la izquierda.
                // No verifiqué el formato de los bancos privados (Santander, Itaú, BBVA
                // Uruguay, etc.), que puede diferir; dejo un rango amplio a propósito.
                validacion: { tipo: "digitos-rango", min: 4, max: 14 },
                ayuda: "Si tu banco te dio un número más corto, completalo con ceros a la izquierda hasta 14 dígitos (formato usado por BROU).",
            },
        ],
    },
    ES: {
        codigo: "ES",
        nombre: "España",
        moneda: { codigo: "EUR", simbolo: "€" },
        codigoTelefonico: "+34",
        camposBancarios: [
            {
                clave: "iban",
                etiqueta: "IBAN",
                placeholder: "ES91 2100 0418 4502 0005 1332",
                obligatorio: true,
                // NO se exige que empiece con "ES". Mucha gente en España cobra
                // en cuentas de Wise, Revolut o N26, que emiten IBAN de
                // Luxemburgo, Lituania o Irlanda: son cuentas perfectamente
                // válidas para recibir euros y un patrón "^ES" se las
                // rechazaría. Se valida la forma general de un IBAN -- dos
                // letras de país, dos dígitos de control y hasta 30
                // alfanuméricos -- y se admiten los espacios de a cuatro con
                // los que los bancos lo muestran.
                validacion: {
                    tipo: "regex",
                    patron: /^[A-Z]{2}\s?\d{2}(?:\s?[A-Z0-9]){11,30}$/i,
                    mensajeError: "El IBAN empieza con dos letras del país y dos dígitos de control (por ejemplo ES91 2100 0418 4502 0005 1332).",
                },
                ayuda: "IBAN de la cuenta, con espacios o sin ellos. Vale también el de cuentas tipo Wise o Revolut, aunque no empiece con ES.",
            },
            {
                clave: "banco",
                etiqueta: "Banco",
                placeholder: "CaixaBank",
                obligatorio: true,
                validacion: { tipo: "texto-libre" },
            },
            {
                clave: "bizum",
                etiqueta: "Bizum",
                placeholder: "600123456",
                obligatorio: false,
                // Los móviles españoles son 9 dígitos y empiezan con 6 o 7.
                validacion: { tipo: "digitos", longitud: 9 },
                ayuda: "Opcional. El móvil asociado a Bizum, la forma más habitual de mandar un regalo en España.",
            },
        ],
    },
    CO: {
        codigo: "CO",
        nombre: "Colombia",
        moneda: { codigo: "COP", simbolo: "$" },
        codigoTelefonico: "+57",
        camposBancarios: [
            {
                clave: "llaveBreB",
                etiqueta: "Llave Bre-B",
                placeholder: "@mariarestrepo",
                obligatorio: false,
                // Texto libre a propósito: una llave Bre-B puede ser un alias
                // alfanumérico, un celular, un correo o el documento, cada uno
                // con su propio formato. Validar estricto con reglas que no
                // tengo verificadas del todo significaría rechazar llaves
                // buenas, que es mucho peor que aceptar una mal escrita: el
                // invitado ve el error al pegarla en su banco y avisa. Mismo
                // criterio que el rango amplio de la cédula, acá abajo.
                validacion: { tipo: "texto-libre" },
                ayuda:
                    "Opcional, pero es la forma más cómoda para tus invitados: con la llave transfieren desde cualquier banco sin tipear el número de cuenta.",
            },
            {
                clave: "banco",
                etiqueta: "Banco",
                placeholder: "Bancolombia",
                obligatorio: true,
                validacion: { tipo: "texto-libre" },
            },
            {
                clave: "tipoCuenta",
                etiqueta: "Tipo de cuenta",
                placeholder: "Ahorros",
                obligatorio: true,
                validacion: { tipo: "opciones", valores: ["Ahorros", "Corriente"] },
            },
            {
                clave: "numeroCuenta",
                etiqueta: "Número de cuenta",
                placeholder: "12345678901",
                obligatorio: true,
                // Verificado: varía entre 9 y 12 dígitos según el banco y el tipo de
                // cuenta (las de ahorro rondan 11). No hay un largo único nacional.
                validacion: { tipo: "digitos-rango", min: 9, max: 12 },
            },
            {
                clave: "cedula",
                etiqueta: "Cédula del titular",
                placeholder: "1020304050",
                obligatorio: true,
                // Verificado: la cédula colombiana actual tiene 10 dígitos, pero
                // cédulas emitidas antes de la actualización de formato pueden tener
                // menos (hasta 6). Uso un rango para no rechazar cédulas viejas válidas.
                validacion: { tipo: "digitos-rango", min: 6, max: 10 },
                ayuda: "Cédula de ciudadanía del titular de la cuenta, sin puntos.",
            },
        ],
    },
    MX: {
        codigo: "MX",
        nombre: "México",
        moneda: { codigo: "MXN", simbolo: "$" },
        codigoTelefonico: "+52",
        camposBancarios: [
            {
                clave: "clabe",
                etiqueta: "CLABE",
                placeholder: "032180000118359719",
                obligatorio: true,
                validacion: { tipo: "digitos", longitud: 18 },
                ayuda:
                    "CLABE (Clave Bancaria Estandarizada): identifica la cuenta en cualquier banco de México. Tiene 18 números: banco, plaza, número de cuenta y un dígito de control.",
            },
            {
                clave: "banco",
                etiqueta: "Banco",
                placeholder: "BBVA México",
                obligatorio: false,
                validacion: { tipo: "texto-libre" },
                ayuda: "Opcional: la CLABE ya identifica el banco, esto es sólo para mostrarlo más claro a tus invitados.",
            },
        ],
    },
    US: {
        codigo: "US",
        nombre: "Estados Unidos",
        moneda: { codigo: "USD", simbolo: "$" },
        codigoTelefonico: "+1",
        camposBancarios: [
            {
                clave: "routingNumber",
                etiqueta: "Routing number (ABA)",
                placeholder: "021000021",
                obligatorio: true,
                validacion: { tipo: "digitos", longitud: 9 },
                ayuda: "Código de 9 números que identifica al banco (ABA routing number). Lo encontrás abajo a la izquierda de un cheque.",
            },
            {
                clave: "accountNumber",
                etiqueta: "Account number",
                placeholder: "0123456789",
                obligatorio: true,
                // Verificado que no hay un largo único: distintas fuentes reportan
                // comúnmente entre 10 y 12 dígitos, pero algunos bancos emiten
                // números de tan sólo 4 y otros de hasta 17. Uso ese rango amplio
                // a propósito para no rechazar cuentas válidas.
                validacion: { tipo: "digitos-rango", min: 4, max: 17 },
            },
            {
                clave: "tipoCuenta",
                etiqueta: "Tipo de cuenta",
                placeholder: "Checking",
                obligatorio: true,
                validacion: {
                    tipo: "opciones",
                    valores: ["Checking (cuenta corriente)", "Savings (caja de ahorro)"],
                },
            },
        ],
    },
};

/**
 * Valida un valor contra la definición de su campo bancario.
 * Devuelve el mensaje de error en español, o null si el valor es válido.
 */
export function validarCampoBancario(campo: CampoBancario, valorCrudo: string): string | null {
    const valor = (valorCrudo ?? "").trim();

    if (valor === "") {
        return campo.obligatorio ? `${campo.etiqueta} es obligatorio.` : null;
    }

    const v = campo.validacion;
    switch (v.tipo) {
        case "digitos": {
            if (!/^\d+$/.test(valor)) {
                return `${campo.etiqueta} sólo puede contener números.`;
            }
            if (valor.length !== v.longitud) {
                return `${campo.etiqueta} tiene ${v.longitud} dígitos, ingresaste ${valor.length}.`;
            }
            return null;
        }
        case "digitos-rango": {
            if (!/^\d+$/.test(valor)) {
                return `${campo.etiqueta} sólo puede contener números.`;
            }
            if (valor.length < v.min || valor.length > v.max) {
                return `${campo.etiqueta} tiene que tener entre ${v.min} y ${v.max} dígitos, ingresaste ${valor.length}.`;
            }
            return null;
        }
        case "texto-libre":
            return null;
        case "email": {
            const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
            return ok ? null : `${campo.etiqueta} no es un email válido.`;
        }
        case "opciones": {
            return v.valores.includes(valor)
                ? null
                : `${campo.etiqueta} tiene que ser una de estas opciones: ${v.valores.join(", ")}.`;
        }
        case "regex": {
            return v.patron.test(valor) ? null : v.mensajeError;
        }
    }
}

/** Si un valor cualquiera (de la base, de un formulario) es un país que manejamos. */
export function esCodigoPais(v: unknown): v is CodigoPais {
    return typeof v === "string" && v in PAISES;
}

/** Los países, en orden alfabético, para armar un selector. */
export const PAISES_ORDENADOS: DefinicionPais[] = Object.values(PAISES).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es")
);
