import fs from "fs/promises";
import path from "path";
import { Metadata } from "next";
import { TermsDocument } from "@/components/legal/TermsDocument";

export const metadata: Metadata = {
  title: "Términos y Condiciones del servicio LIVE · Alta Invitación",
};

export default async function TerminosLivePage() {
  const filePath = path.join(process.cwd(), "docs", "terminos-condiciones-live.txt");
  const content = await fs.readFile(filePath, "utf8");
  return <TermsDocument content={content} />;
}
