import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  fetchAllCatalog,
  fetchCatalogItem,
  fetchSiteSeo,
  stripHtml,
} from "@/lib/sharky";
import { SITE_URL } from "@/lib/site";
import { buildSlug, itemPath, parseId } from "@/lib/slug";
import { formatPrice, getPrice, getStatus } from "@/lib/garage";
import { LOCALE, copy, fill } from "@/lib/copy";
import ItemCard from "@/components/ItemCard";
import { ItemJsonLd } from "@/components/JsonLd";

/**
 * Página de um item, com link próprio para mandar a alguém. SSG + ISR: os
 * itens que existem no build saem prontos; os novos são gerados na primeira
 * visita (`dynamicParams` padrão) e todos revalidam como a home.
 */
export const revalidate = 60; // literal: o Next exige valor estático

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const items = await fetchAllCatalog(LOCALE);
  return items.map((i) => ({ slug: buildSlug(i) }));
}

async function loadItem(slug: string) {
  const id = parseId(slug);
  return id ? fetchCatalogItem(id, LOCALE) : null;
}

/** OG por item: é a prévia (foto, nome e preço) que aparece no WhatsApp. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await loadItem((await params).slug);
  if (!item) return {};

  const sold = getStatus(item) === "sold";
  const title = fill(copy.itemPage.metaTitle, {
    title: item.title,
    price: sold ? copy.status.sold : formatPrice(getPrice(item)),
  });
  const description =
    stripHtml(item.html).slice(0, 160) || copy.meta.description;
  // O openGraph do filho substitui o do layout inteiro: sem foto, usa a do site.
  const image = item.coverUrl ?? (await fetchSiteSeo()).image;
  const images = image ? [image] : undefined;
  const path = itemPath(item);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: copy.brand,
      locale: LOCALE.replace("-", "_"),
      title,
      description,
      url: `${SITE_URL}${path}`,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images ? { images } : {}),
    },
  };
}

export default async function ItemPage({ params }: Props) {
  const { slug } = await params;
  const item = await loadItem(slug);
  if (!item) notFound();
  // O título na URL é cosmético: link antigo (título mudou) vai para o atual.
  if (slug !== buildSlug(item)) permanentRedirect(itemPath(item));

  return (
    <div className="container item-page">
      <ItemJsonLd item={item} />
      <Link className="back" href="/#items">
        {copy.itemPage.back}
      </Link>
      <ItemCard item={item} detail />
      <p className="pickup">{copy.pickup}</p>
      <p className="more">
        <Link className="btn" href="/#items">
          {copy.itemPage.more}
        </Link>
      </p>
    </div>
  );
}
