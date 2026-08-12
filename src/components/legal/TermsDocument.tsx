import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Parsea el .txt de términos (títulos con "N. Título", separadores de
// líneas "────...", y párrafos en texto plano) y lo renderiza como un
// documento legal clásico: fondo blanco, tipografía serif, secciones
// numeradas.
function renderSections(raw: string) {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks: { type: "h1" | "meta" | "hr" | "heading" | "p"; text: string }[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "p", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (/^─+$/.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: "hr", text: "" });
    } else if (i === 0) {
      blocks.push({ type: "h1", text: trimmed });
    } else if (i === 1 || i === 2) {
      blocks.push({ type: "meta", text: trimmed });
    } else if (/^\d+\.\s+.+/.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: "heading", text: trimmed });
    } else if (trimmed === "") {
      flushParagraph();
    } else {
      paragraph.push(trimmed);
    }
  });
  flushParagraph();

  return blocks;
}

export function TermsDocument({ content }: { content: string }) {
  const blocks = renderSections(content);

  return (
    <div style={{ background: "#FFFFFF", minHeight: "100dvh", color: "#1A1A1A" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 96px" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            color: "#666",
            textDecoration: "none",
            marginBottom: 32,
          }}
        >
          <ChevronLeft size={16} />
          Volver al inicio
        </Link>

        <article style={{ fontFamily: "Georgia, 'Times New Roman', serif", lineHeight: 1.7 }}>
          {blocks.map((block, i) => {
            if (block.type === "h1") {
              return (
                <h1
                  key={i}
                  style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px", color: "#111" }}
                >
                  {block.text}
                </h1>
              );
            }
            if (block.type === "meta") {
              return (
                <p key={i} style={{ fontSize: 14, color: "#666", margin: "0 0 4px" }}>
                  {block.text}
                </p>
              );
            }
            if (block.type === "hr") {
              return (
                <hr
                  key={i}
                  style={{ border: "none", borderTop: "1px solid #E2E2E2", margin: "28px 0" }}
                />
              );
            }
            if (block.type === "heading") {
              return (
                <h2
                  key={i}
                  style={{ fontSize: 19, fontWeight: 700, margin: "0 0 14px", color: "#111" }}
                >
                  {block.text}
                </h2>
              );
            }
            return (
              <p key={i} style={{ fontSize: 15.5, margin: "0 0 16px", color: "#2B2B2B" }}>
                {block.text}
              </p>
            );
          })}
        </article>
      </div>
    </div>
  );
}
