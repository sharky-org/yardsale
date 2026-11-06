import type { Metadata } from "next";
import { Bowlby_One, DM_Sans } from "next/font/google";
import "./globals.css";
import { fetchSiteSeo, fetchSiteAnalytics } from "@/lib/sharky";
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
 * Metadados em BUILD-TIME. Da meta da Sharky vêm imagem de OG, palavras-chave
 * e analytics (fail-fast); título e descrição vêm da copy. O ícone da aba é o
 * `app/icon.svg` (+ `app/apple-icon.png` para o iPhone), por convenção de arquivo.
 */
export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchSiteSeo();
  const images = seo.image ? [seo.image] : undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: copy.meta.title,
    description: copy.meta.description,
    ...(seo.keywords.length ? { keywords: seo.keywords } : {}),
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: copy.brand,
      locale: LOCALE.replace("-", "_"),
      title: copy.meta.title,
      description: copy.meta.description,
      url: SITE_URL,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: copy.meta.title,
      description: copy.meta.description,
      ...(images ? { images } : {}),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [seo, analytics] = await Promise.all([
    fetchSiteSeo(),
    fetchSiteAnalytics(),
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
        <FloatingContact />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
