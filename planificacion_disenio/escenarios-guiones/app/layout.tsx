import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { ModalProvider } from "@/components/ModalProvider";
import { TopBar } from "@/components/TopBar";
import packageJson from "../package.json";

export const metadata: Metadata = {
  title: "Escenarios y Guiones",
  description: "Herramienta para armar escenarios de prueba, guiones y funciones auxiliares.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- next/font requiere alcanzar fonts.googleapis.com en build time; se carga en runtime para no depender de esa red al compilar. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ToastProvider>
          <ModalProvider>
            <div className="app">
              <TopBar />
              <main className="main">{children}</main>
              <footer className="footer">
                <span className="footer__dev">
                  Desarrollador: Leonardo Pérez · <a href="mailto:lperez@ces.com.uy">lperez@ces.com.uy</a>
                </span>
                <span className="footer__version">
                  Versión <strong>{packageJson.version}</strong>
                </span>
              </footer>
            </div>
          </ModalProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
