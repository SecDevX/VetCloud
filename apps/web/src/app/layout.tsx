import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VetCloud | Gestión veterinaria",
  description: "Plataforma veterinaria segura y multi-tenant.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-PE"><body>{children}</body></html>;
}
