/**
 * Definición de los datos bancarios que se piden por país para que los
 * invitados puedan transferirle un regalo o pagar la tarjeta al anfitrión.
 *
 * Este archivo es sólo la definición + validación. No está conectado a
 * StepBankDetails.tsx todavía: falta que otra persona reemplace los campos
 * fijos de CBU/Alias por una selección dinámica según `CodigoPais`.
 */

export type CodigoPais = "AR" | "CL" | "UY" | "BR" | "CO" | "MX" | "US";

/**
 * Cómo validar el valor que carga el usuario en un campo bancario.
 * "pix" y "rut-cl" son casos especiales: no son una sola regla de longitud,
 * sino un formato compuesto (PIX admite 5 tipos de clave distintos; el RUT
 * lleva dígito verificador con un algoritmo propio), así que se resuelven
 * con lógica dedicada en `validarCampoBancario` en vez de un patrón genérico.
 */
export type ValidacionCampo =
    | { tipo: "digitos"; longitud: number }
    | { tipo: "digitos-rango"; min: number; max: number }
    | { tipo: "texto-libre" }
    | { tipo: "email" }
    | { tipo: "opciones"; valores: readonly string[] }
    | { tipo: "regex"; patron: RegExp; mensajeError: string }
    | { tipo: "pix" }
    | { tipo: "rut-cl" };

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
                obligatorio: true,
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
    CL: {
        codigo: "CL",
        nombre: "Chile",
        moneda: { codigo: "CLP", simbolo: "$" },
        codigoTelefonico: "+56",
        camposBancarios: [
            {
                clave: "rut",
                etiqueta: "RUT del titular",
                placeholder: "12.345.678-9",
                obligatorio: true,
                validacion: { tipo: "rut-cl" },
                ayuda: "RUT (Rol Único Tributario) del titular de la cuenta, con puntos y el dígito verificador separado por guion.",
            },
            {
                clave: "tipoCuenta",
                etiqueta: "Tipo de cuenta",
                placeholder: "Cuenta Corriente",
                obligatorio: true,
                validacion: {
                    tipo: "opciones",
                    valores: ["Cuenta Corriente", "Cuenta Vista", "Cuenta de Ahorro"],
                },
            },
            {
                clave: "numeroCuenta",
                etiqueta: "Número de cuenta",
                placeholder: "00012345678",
                obligatorio: true,
                // Verificado que varía según el banco (BancoEstado, BCI, Santander, etc.);
                // no encontré un largo único oficial. Uso un rango amplio (8 a 14 dígitos)
                // en base a lo que reportan los propios bancos, no es un estándar cerrado.
                validacion: { tipo: "digitos-rango", min: 8, max: 14 },
            },
            {
                clave: "banco",
                etiqueta: "Banco",
                placeholder: "Banco Estado",
                obligatorio: true,
                validacion: { tipo: "texto-libre" },
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
    BR: {
        codigo: "BR",
        nombre: "Brasil",
        moneda: { codigo: "BRL", simbolo: "R$" },
        codigoTelefonico: "+55",
        camposBancarios: [
            {
                clave: "pix",
                etiqueta: "Clave PIX",
                placeholder: "juan@email.com",
                obligatorio: true,
                validacion: { tipo: "pix" },
                ayuda:
                    "Puede ser tu CPF, CNPJ, email, teléfono (con +55) o una clave aleatoria generada por tu banco (formato UUID, ej: 123e4567-e89b-12d3-a456-426614174000).",
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

/** Dígito verificador de un RUT chileno por el algoritmo de Módulo 11 (pesos 2 a 7, cíclicos, de derecha a izquierda). */
function calcularDigitoVerificadorRut(cuerpo: string): string {
    let suma = 0;
    let multiplicador = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    const resto = 11 - (suma % 11);
    if (resto === 11) return "0";
    if (resto === 10) return "K";
    return String(resto);
}

function validarRutChileno(valor: string): string | null {
    const formatoOk = /^\d{1,2}\.\d{3}\.\d{3}-[0-9Kk]$/.test(valor);
    if (!formatoOk) {
        return "El RUT tiene que tener el formato 12.345.678-9, con puntos y el dígito verificador separado por guion.";
    }
    const [cuerpoConPuntos, digitoVerificador] = valor.split("-");
    const cuerpo = cuerpoConPuntos.replace(/\./g, "");
    const digitoEsperado = calcularDigitoVerificadorRut(cuerpo);
    if (digitoVerificador.toUpperCase() !== digitoEsperado) {
        return `El dígito verificador no corresponde a ese RUT: para ${cuerpoConPuntos} debería ser ${digitoEsperado}, ingresaste ${digitoVerificador.toUpperCase()}.`;
    }
    return null;
}

/**
 * PIX admite 5 tipos de clave (CPF, CNPJ, email, teléfono o una clave
 * aleatoria tipo UUID). Como no hay un selector previo de tipo en este
 * archivo, se acepta cualquiera de los 5 formatos y se informa cuál se
 * esperaba si no matchea ninguno.
 */
function validarClavePix(valor: string): string | null {
    const soloNumeros = valor.replace(/[.\-/\s]/g, "");
    const esCpf = /^\d{11}$/.test(soloNumeros);
    const esCnpj = /^\d{14}$/.test(soloNumeros);
    const esEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
    const esTelefono = /^\+55\d{10,11}$/.test(valor.replace(/[\s-]/g, ""));
    const esAleatoria = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(valor);

    if (esCpf || esCnpj || esEmail || esTelefono || esAleatoria) {
        return null;
    }
    return "La clave PIX tiene que ser un CPF (11 dígitos), CNPJ (14 dígitos), email, teléfono con código de país (+55...) o una clave aleatoria (formato UUID).";
}

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
        case "pix":
            return validarClavePix(valor);
        case "rut-cl":
            return validarRutChileno(valor);
    }
}
