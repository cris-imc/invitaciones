// Retoques al motor propios de Postal. Cada uno es un reemplazo exacto que
// falla si el anclaje se movió (ver derivar-tipografica.js, paso 5).
module.exports = [
  {
    etiqueta: "matasellos que vuelve a caer al repetir la apertura",
    // El matasellos cae con una animación CSS que corre una sola vez. Al
    // volver a ver la tapa hay que reiniciarla: se saca y se vuelve a poner.
    de: "      }, 260 + i * 130);\n    });\n  }, []);\n\n  const dibujarRuta",
    a: [
      "      }, 260 + i * 130);",
      "    });",
      "    const matasellos = escena ? escena.querySelector<HTMLElement>(\"[data-matasellos]\") : null;",
      "    if (matasellos) {",
      "      matasellos.style.animation = \"none\";",
      "      void matasellos.offsetWidth;",
      "      matasellos.style.animation = \"\";",
      "    }",
      "  }, []);",
      "",
      "  const dibujarRuta",
    ].join("\n"),
  },
];
