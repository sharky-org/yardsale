import type { Metadata } from "next";
import { Bowlby_One, DM_Sans } from "next/font/google";
import "./globals.css";
import { fetchSiteSeo, fetchSiteAnalytics, fetchSiteInfo } from "@/lib/sharky";
import { SITE_URL } from "@/lib/site";
import { LOCALE, copy } from "@/lib/copy";
import { TrackingScripts } from "@/components/TrackingScripts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingContact from "@/components/layout/FloatingContact";

// Fontes auto-hospedadas pelo next/font (sem request ao Google em runtime):
// Bowlby One para os títulos grossos da referência, DM Sans para o texto.
const display = Bowlby_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const sans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

/**
 * Metadados da meta da Sharky (fail-fast): descrição (bloco "SEO & Meta" ou a
 * descrição do projeto), imagem de OG, palavras-chave e analytics. O título é
 * o do "SEO & Meta"; vazio, fica o da copy — o nome do projeto é a frase do
 * topo da home, longa demais para a aba. O ícone da aba é o `app/icon.svg`
 * (+ `app/apple-icon.png` para o iPhone), por convenção de arquivo.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [seo, site] = await Promise.all([fetchSiteSeo(), fetchSiteInfo()]);
  const images = seo.image ? [seo.image] : undefined;
  const title = site.seoTitle ?? copy.meta.title;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description: seo.description,
    ...(seo.keywords.length ? { keywords: seo.keywords } : {}),
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: copy.brand,
      locale: LOCALE.replace("-", "_"),
      title,
      description: seo.description,
      url: SITE_URL,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: seo.description,
      ...(images ? { images } : {}),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [seo, analytics, site] = await Promise.all([
    fetchSiteSeo(),
    fetchSiteAnalytics(),
    fetchSiteInfo(),
  ]);
  const umami = analytics?.websiteId && analytics?.scriptUrl ? analytics : null;

  return (
    <html lang={LOCALE} className={`${display.variable} ${sans.variable}`}>
      <head>
        {umami && (
          <script
            defer
            src={umami.scriptUrl!}
            data-website-id={umami.websiteId!}
          />
        )}
        <TrackingScripts
          googleTagId={seo.googleTagId}
          metaPixelId={seo.metaPixelId}
        />
      </head>
      <body>
        <Header />
        <FloatingContact phone={site.phone} />
        <main>{children}</main>
        <Footer phone={site.phone} />
      </body>
    </html>
  );
}
