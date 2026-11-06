import type { MetadataRoute } from "next";
import { fetchAllCatalog } from "@/lib/sharky";
import { SITE_URL } from "@/lib/site";
import { itemPath } from "@/lib/slug";
import { LOCALE } from "@/lib/copy";

// Igual às páginas: o cache de fetch do Next é compartilhado por URL, e um
// revalidate maior aqui aceitaria uma lista de itens velha gravada por elas.
export const revalidate = 60; // literal: o Next exige valor estático

/** A home e a página de cada item. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await fetchAllCatalog(LOCALE);
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...items.map((item) => ({
      url: `${SITE_URL}${itemPath(item)}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
