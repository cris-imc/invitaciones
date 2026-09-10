"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const STORAGE_KEY = "alta-tema";

type Tema = "claro" | "oscuro";

// Vive fuera del componente para que cualquier instancia del toggle (sidebar,
// nav de la landing, etc.) aplique exactamente la misma lógica.
function applyTema(tema: Tema) {
  // "oscuro" es el valor por defecto (ver globals.css): sin atributo, el CSS
  // ya cae en oscuro. Sacar el atributo en vez de escribir data-tema="oscuro"
  // mantiene el HTML limpio y evita dos formas distintas de pedir lo mismo.
  if (tema === "claro") {
    document.documentElement.setAttribute("data-tema", "claro");
  } else {
    document.documentElement.removeAttribute("data-tema");
  }
  try {
    localStorage.setItem(STORAGE_KEY, tema);
  } catch {
    // Modo privado o storage bloqueado: el cambio de tema sigue funcionando
    // en esta visita, solo no se recuerda en la próxima.
  }
}

interface ThemeToggleProps {
  className?: string;
}

// Selector de modo claro/oscuro para el panel y la landing (no aplica a las
// invitaciones que ven los invitados, esas no usan este atributo).
//
// No hay "flash" de tema equivocado al cargar: un script inline en
// layout.tsx (antes de hidratar React) ya lee localStorage y pone el
// atributo en <html> si corresponde "claro". Por eso el estado inicial de
// este componente arranca en "oscuro" (el default real) y en el primer
// efecto solo LEE lo que ese script ya decidió -- nunca lo pisa, así el
// primer render de React coincide con el HTML que llegó del servidor.
export function ThemeToggle({ className }: ThemeToggleProps) {
  const [tema, setTema] = useState<Tema>("oscuro");

  useEffect(() => {
    const actual = document.documentElement.getAttribute("data-tema") === "claro" ? "claro" : "oscuro";
    setTema(actual);
  }, []);

  const toggle = () => {
    const next: Tema = tema === "claro" ? "oscuro" : "claro";
    applyTema(next);
    setTema(next);
  };

  const enClaro = tema === "claro";

  // Un switch y no un botón con un ícono: un botón que muestra una luna no
  // dice si estás en oscuro o si al tocarlo vas a oscuro -- las dos lecturas
  // son razonables y la mitad de la gente entiende la contraria. Un riel con
  // la perilla de un lado muestra el ESTADO, y los dos íconos a la vista
  // muestran las dos opciones.
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enClaro}
      onClick={toggle}
      aria-label={enClaro ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
      title={enClaro ? "Modo oscuro" : "Modo claro"}
      className={`tema-switch inline-flex ${className ?? ""}`}
    >
      <span className="tema-switch-riel">
        <span className="tema-switch-icono" aria-hidden="true">
          <Sun className="w-3 h-3" />
        </span>
        <span className="tema-switch-icono" aria-hidden="true">
          <Moon className="w-3 h-3" />
        </span>
        <span className={`tema-switch-perilla ${enClaro ? "" : "a-la-derecha"}`} aria-hidden="true" />
      </span>
    </button>
  );
}
