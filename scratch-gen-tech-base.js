// Scratch script (NOT part of the app) — bulk-transforms NeonTemplate.tsx into
// structural drafts for HologramaTemplate / CircuitoTemplate / Cristal3DTemplate.
// Purely mechanical (colors, identifiers, font wiring). Doodle SVGs, cover
// effects, and photo-frame/shine sections are hand-patched afterward.
const fs = require("fs");
const path = require("path");

const TEMPLATES_DIR = path.join(__dirname, "src/components/templates");
const src = fs.readFileSync(path.join(TEMPLATES_DIR, "NeonTemplate.tsx"), "utf8");

function apply(str, pairs) {
  let out = str;
  for (const [search, replace] of pairs) {
    if (!out.includes(search)) {
      console.warn("WARN: pattern not found -> " + JSON.stringify(search).slice(0, 80));
    }
    out = out.split(search).join(replace);
  }
  return out;
}

const FONT_BLOCK_SEARCH = `const neonBebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--neon-bebas",
  display: "swap",
});
const neonSpaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--neon-space-grotesk",
  display: "swap",
});
const neonSpaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--neon-space-mono",
  display: "swap",
});`;

const configs = [
  {
    name: "Holograma",
    file: "HologramaTemplate.tsx",
    importLine: `import { Bebas_Neue, Space_Grotesk, Space_Mono } from "next/font/google";`,
    newImportLine: `import { Space_Grotesk, Space_Mono } from "next/font/google";`,
    fontBlockReplace: `const holoDisplay = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--holo-display",
  display: "swap",
});
const holoBody = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--holo-body",
  display: "swap",
});
const holoMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--holo-mono",
  display: "swap",
});`,
    variableClassLine: `${"${holoDisplay.variable} ${holoBody.variable} ${holoMono.variable}"}`,
    fontVars: {
      "--font-cormorant": "var(--holo-display)",
      "--font-inter": "var(--holo-body)",
      "--font-sans": "var(--holo-body)",
    },
    monoVarCss: "var(--holo-mono), monospace",
    colors: {
      "#39FFD0": "#A78BFA", // t-acc (violet, primary)
      "#FF2E9B": "#22D3EE", // t-acc2 (cyan, secondary)
      "#0D0D10": "#0D0D14", // bg
      "#141418": "#16162C", // surface
      "#8F8F98": "#9490B4", // muted
      "#15151A": "#17172E", // bg alt 1
      "#111114": "#131228", // bg alt 2
      "#0F1013": "#121229", // input bg
      "#F2F2F5": "#F1EEFF", // near-white text
    },
    rgba: {
      "rgba(57,255,208,": "rgba(167,139,250,",
      "rgba(255,46,155,": "rgba(34,211,238,",
      "rgba(57, 255, 208,": "rgba(167, 139, 250,",
      "rgba(255, 46, 155,": "rgba(34, 211, 238,",
    },
    classNames: {
      "neon-doodle": "holo-doodle",
      "neon-scroll-doodle": "holo-scroll-doodle",
      "neon-seal": "holo-seal",
    },
    keyframes: {
      "neon-meshDrift": "holo-meshDrift",
      "neon-glowPulse": "holo-glowPulse",
      "neon-lineExpand": "holo-lineExpand",
    },
    icons: {
      IconDiscoBall: "IconOrb",
      IconSpark: "IconParticle",
    },
  },
  {
    name: "Circuito",
    file: "CircuitoTemplate.tsx",
    importLine: `import { Bebas_Neue, Space_Grotesk, Space_Mono } from "next/font/google";`,
    newImportLine: `import { Orbitron, JetBrains_Mono } from "next/font/google";`,
    fontBlockReplace: `const circDisplay = Orbitron({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--circ-display",
  display: "swap",
});
const circBody = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--circ-body",
  display: "swap",
});
const circMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--circ-mono",
  display: "swap",
});`,
    variableClassLine: `${"${circDisplay.variable} ${circBody.variable} ${circMono.variable}"}`,
    fontVars: {
      "--font-cormorant": "var(--circ-display)",
      "--font-inter": "var(--circ-body)",
      "--font-sans": "var(--circ-body)",
    },
    monoVarCss: "var(--circ-mono), monospace",
    colors: {
      "#39FFD0": "#39FFD0", // t-acc (terminal green, primary) -- matches mockup 1:1
      "#FF2E9B": "#FF2E9B", // t-acc2 (magenta, secondary) -- matches mockup 1:1
      "#0D0D10": "#08080A", // bg (true black)
      "#141418": "#101014", // surface
      "#8F8F98": "#7C8C88", // muted
      "#15151A": "#0C0C10", // bg alt 1
      "#111114": "#0A0A0D", // bg alt 2
      "#0F1013": "#0B0B0F", // input bg
      "#F2F2F5": "#E9FFF6", // near-white text (mint tint)
    },
    rgba: {
      "rgba(57,255,208,": "rgba(57,255,208,",
      "rgba(255,46,155,": "rgba(255,46,155,",
      "rgba(57, 255, 208,": "rgba(57, 255, 208,",
      "rgba(255, 46, 155,": "rgba(255, 46, 155,",
    },
    classNames: {
      "neon-doodle": "circ-doodle",
      "neon-scroll-doodle": "circ-scroll-doodle",
      "neon-seal": "circ-seal",
    },
    keyframes: {
      "neon-meshDrift": "circ-meshDrift",
      "neon-glowPulse": "circ-glowPulse",
      "neon-lineExpand": "circ-lineExpand",
    },
    icons: {
      IconDiscoBall: "IconHex",
      IconSpark: "IconNode",
    },
  },
  {
    name: "Cristal3D",
    file: "Cristal3DTemplate.tsx",
    importLine: `import { Bebas_Neue, Space_Grotesk, Space_Mono } from "next/font/google";`,
    newImportLine: `import { Outfit, Manrope, Space_Mono } from "next/font/google";`,
    fontBlockReplace: `const crysDisplay = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--crys-display",
  display: "swap",
});
const crysBody = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--crys-body",
  display: "swap",
});
const crysMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--crys-mono",
  display: "swap",
});`,
    variableClassLine: `${"${crysDisplay.variable} ${crysBody.variable} ${crysMono.variable}"}`,
    fontVars: {
      "--font-cormorant": "var(--crys-display)",
      "--font-inter": "var(--crys-body)",
      "--font-sans": "var(--crys-body)",
    },
    monoVarCss: "var(--crys-mono), monospace",
    colors: {
      "#39FFD0": "#8FD3FF", // t-acc (icy blue, primary)
      "#FF2E9B": "#B9A6FF", // t-acc2 (lavender, secondary)
      "#0D0D10": "#0A0E16", // bg
      "#141418": "#121A28", // surface
      "#8F8F98": "#93A4B8", // muted
      "#15151A": "#101826", // bg alt 1
      "#111114": "#0D141F", // bg alt 2
      "#0F1013": "#0E1620", // input bg
      "#F2F2F5": "#F0F6FF", // near-white text (icy tint)
    },
    rgba: {
      "rgba(57,255,208,": "rgba(143,211,255,",
      "rgba(255,46,155,": "rgba(185,166,255,",
      "rgba(57, 255, 208,": "rgba(143, 211, 255,",
      "rgba(255, 46, 155,": "rgba(185, 166, 255,",
    },
    classNames: {
      "neon-doodle": "crys-doodle",
      "neon-scroll-doodle": "crys-scroll-doodle",
      "neon-seal": "crys-seal",
    },
    keyframes: {
      "neon-meshDrift": "crys-meshDrift",
      "neon-glowPulse": "crys-glowPulse",
      "neon-lineExpand": "crys-lineExpand",
    },
    icons: {
      IconDiscoBall: "IconFacet",
      IconSpark: "IconShard",
    },
  },
];

for (const cfg of configs) {
  let out = src;

  // 1) Component/type identifier rename
  out = out.split("NeonTemplate").join(cfg.name === "Cristal3D" ? "Cristal3DTemplate" : `${cfg.name}Template`);

  // 2) Font import + block
  out = out.split(cfg.importLine).join(cfg.newImportLine);
  out = out.split(FONT_BLOCK_SEARCH).join(cfg.fontBlockReplace);

  // 3) className variable line (font faces attached to root wrapper)
  out = out.split(`className={`).map((chunk, idx) => chunk).join(`className={`); // no-op, placeholder
  out = out.split(
    "className={`${neonBebas.variable} ${neonSpaceGrotesk.variable} ${neonSpaceMono.variable}`}"
  ).join("className={`" + cfg.variableClassLine.replace(/^\$\{/, "").replace(/\}$/, "") + "`}");

  // 4) font CSS var mapping (two occurrences: mobile wrapper + desktop-stage wrapper)
  out = out.split(`"--font-cormorant": "var(--neon-bebas)",`).join(`"--font-cormorant": "${cfg.fontVars["--font-cormorant"]}",`);
  out = out.split(`"--font-inter": "var(--neon-space-grotesk)",`).join(`"--font-inter": "${cfg.fontVars["--font-inter"]}",`);
  out = out.split(`"--font-sans": "var(--neon-space-grotesk)",`).join(`"--font-sans": "${cfg.fontVars["--font-sans"]}",`);

  // 5) monospace CSS override rule
  out = out.split("var(--neon-space-mono), monospace !important;").join(cfg.monoVarCss + " !important;");

  // 6) Color hexes
  for (const [from, to] of Object.entries(cfg.colors)) {
    out = out.split(from).join(to);
  }
  // 7) rgba() derived colors
  for (const [from, to] of Object.entries(cfg.rgba)) {
    out = out.split(from).join(to);
  }
  // 8) class name identifiers
  for (const [from, to] of Object.entries(cfg.classNames)) {
    out = out.split(from).join(to);
  }
  // 9) keyframe identifiers
  for (const [from, to] of Object.entries(cfg.keyframes)) {
    out = out.split(from).join(to);
  }
  // 10) icon component identifiers (bodies rewritten by hand afterward)
  for (const [from, to] of Object.entries(cfg.icons)) {
    out = out.split(from).join(to);
  }

  fs.writeFileSync(path.join(TEMPLATES_DIR, cfg.file), out, "utf8");
  console.log("Wrote " + cfg.file);
}
