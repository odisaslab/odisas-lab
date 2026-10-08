import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@/components/analytics/Analytics";
import { Tracking } from "@/components/analytics/Tracking";
import { CookieConsent } from "@/components/cookies/CookieConsent";
import { QuoteProvider } from "@/components/forms/QuoteProvider";
import { Footer } from "@/components/layout/Footer";
import { FloatingContact } from "@/components/layout/FloatingContact";
import { Header } from "@/components/layout/Header";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { JsonLd } from "@/components/ui/JsonLd";
import { site } from "@/data/site";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Zona Pies | Laboratorio de ortesis plantares y plantillas a medida",
    template: "%s | Zona Pies",
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "plantillas ortopédicas",
    "plantillas a medida",
    "ortesis plantares",
    "fabricación de plantillas",
    "laboratorio podológico",
    "plantillas para podólogos",
    "plantillas 3D",
    "plantillas fibra de carbono",
    "plantillas EVA",
    "plantillas PA11",
  ],
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07090b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <QuoteProvider>
          <Header />
          <main id="contenido">{children}</main>
          <Footer />
          <FloatingContact />
        </QuoteProvider>
        <SmoothScroll />
        <CookieConsent />
        <Analytics />
        <Tracking />
      </body>
    </html>
  );
}
